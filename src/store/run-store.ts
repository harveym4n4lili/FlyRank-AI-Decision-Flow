import { subscribe } from "inngest/realtime";
import { create } from "zustand";
import { RUN_TOPICS, workflowRunChannel, type RealtimeToken, type RunChannelMessage } from "@/inngest/channels";
import { useHistoryStore } from "@/store/history-store";
import type {
  ExecutionStep,
  LogEntry,
  RunHistoryEntry,
  RunStatus,
  WorkflowRunRequest,
} from "@/types/workflow";

const RUN_TIMEOUT_MS = 120_000;

type RunRequest = Omit<WorkflowRunRequest, "runKey">;

type RunState = {
  status: RunStatus;
  eventId: string | null;
  /** Node currently being decided, while the run is in progress. */
  activeNodeId: string | null;
  /** Node that was being decided when the run failed; a retry resumes here. */
  failedNodeId: string | null;
  steps: ExecutionStep[];
  error: string | null;
  logs: LogEntry[];
  /** Set while showing a past run from history instead of the latest live one. */
  viewingHistoryId: string | null;
};

type RunActions = {
  startRun: (request: RunRequest) => Promise<void>;
  /** Re-runs from the failed node, keeping the steps that already succeeded. */
  retryFromFailed: (request: RunRequest) => Promise<void>;
  showHistory: (entry: RunHistoryEntry) => void;
  clear: () => void;
};

const initialState: RunState = {
  status: "idle",
  eventId: null,
  activeNodeId: null,
  failedNodeId: null,
  steps: [],
  error: null,
  logs: [],
  viewingHistoryId: null,
};

async function postJson<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error ?? `Request failed (${res.status})`);
  return json as T;
}

/** Increments on every new run or clear, so callbacks from a stale run are ignored. */
let activeRun = 0;
let teardown: (() => void) | null = null;

function stopListening() {
  teardown?.();
  teardown = null;
}

/** Current workflow execution, streamed from Inngest Realtime as each node runs. */
export const useRunStore = create<RunState & RunActions>()((set, get) => {
  async function execute({ graph, input }: RunRequest, priorSteps: ExecutionStep[], priorLogs: LogEntry[]) {
    stopListening();
    const runId = ++activeRun;
    const isCurrent = () => runId === activeRun;
    const runKey = crypto.randomUUID();
    const startedAt = Date.now();
    const labelOf = (id: string | null) => graph.nodes.find((n) => n.id === id)?.data.label ?? "Unknown";

    const log = (level: LogEntry["level"], message: string) =>
      set((s) => ({ logs: [...s.logs, { at: Date.now(), level, message }] }));

    let finished = false;
    const finish = (status: "completed" | "failed", error: string | null = null) => {
      if (!isCurrent() || finished) return;
      finished = true;
      stopListening();
      const failedNodeId = status === "failed" ? get().activeNodeId : null;
      set({ status, error, failedNodeId, activeNodeId: null });
      if (status === "completed") {
        const seconds = ((Date.now() - startedAt) / 1000).toFixed(1);
        log("success", `Run completed in ${seconds}s after ${get().steps.length} step(s).`);
      } else {
        log("error", failedNodeId ? `Failed at "${labelOf(failedNodeId)}": ${error}` : `Run failed: ${error}`);
      }
      const { steps, logs } = get();
      useHistoryStore.getState().add({
        id: runKey,
        startedAt,
        finishedAt: Date.now(),
        status,
        input,
        steps,
        error,
        failedNodeId,
        logs,
      });
    };

    set({ ...initialState, status: "queued", steps: priorSteps, logs: priorLogs });
    log("info", priorSteps.length ? `Retrying from "${labelOf(graph.startNodeId)}"…` : "Starting run…");

    try {
      // Subscribe before starting the run so no progress message is missed.
      const token = await postJson<RealtimeToken>("/api/workflows/realtime-token", { runKey });
      if (!isCurrent()) return;

      const subscription = await subscribe({
        key: token.key,
        apiBaseUrl: token.apiBaseUrl,
        channel: workflowRunChannel(runKey),
        topics: [...RUN_TOPICS],
        onMessage: (raw: unknown) => {
          const message = raw as RunChannelMessage;
          if (!isCurrent() || message.kind !== "data") return;

          if (message.topic === "step") {
            // A retry's steps continue numbering after the ones carried over.
            const step = { ...message.data, order: priorSteps.length + message.data.order };
            if (get().steps.some((x) => x.order === step.order)) return;
            set((s) => ({ steps: [...s.steps, step] }));
            log(
              "info",
              `"${step.label}" → ${step.decision}` +
                (step.nextNodeId ? `, next: "${labelOf(step.nextNodeId)}"` : ", workflow ends"),
            );
            return;
          }

          const update = message.data;
          if (update.status === "running") {
            set({ status: "running", activeNodeId: update.nodeId });
            log("info", `Deciding "${labelOf(update.nodeId)}"…`);
          } else if (update.status === "completed") {
            finish("completed");
          } else {
            finish("failed", update.error);
          }
        },
        onError: (err: unknown) => finish("failed", `Lost connection to the run: ${(err as Error)?.message ?? err}`),
      });
      const timeout = setTimeout(
        () => finish("failed", "Timed out waiting for the run to finish. Is the Inngest dev server running?"),
        RUN_TIMEOUT_MS,
      );
      teardown = () => {
        clearTimeout(timeout);
        subscription.close();
      };
      if (!isCurrent()) return stopListening();

      const { eventId } = await postJson<{ eventId: string }>("/api/workflows/run", { graph, input, runKey });
      if (!isCurrent()) return;
      set({ eventId });
      log("info", `Sent to Inngest (event ${eventId}).`);
    } catch (err) {
      finish("failed", (err as Error).message);
    }
  }

  return {
    ...initialState,

    startRun: (request) => execute(request, [], []),

    retryFromFailed: async (request) => {
      const { failedNodeId, steps, logs } = get();
      if (!failedNodeId) return;
      await execute({ ...request, graph: { ...request.graph, startNodeId: failedNodeId } }, steps, logs);
    },

    showHistory: (entry) => {
      activeRun++;
      stopListening();
      set({
        ...initialState,
        status: entry.status,
        steps: entry.steps,
        error: entry.error,
        failedNodeId: entry.failedNodeId,
        logs: entry.logs,
        viewingHistoryId: entry.id,
      });
    },

    clear: () => {
      activeRun++;
      stopListening();
      set(initialState);
    },
  };
});
