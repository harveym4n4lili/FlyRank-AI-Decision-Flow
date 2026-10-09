import { subscribe } from "inngest/realtime";
import { create } from "zustand";
import { RUN_TOPICS, workflowRunChannel, type RealtimeToken, type RunChannelMessage } from "@/inngest/channels";
import type { ExecutionStep, RunStatus, WorkflowRunRequest } from "@/types/workflow";

const RUN_TIMEOUT_MS = 120_000;

type RunState = {
  status: RunStatus;
  eventId: string | null;
  /** Node currently being decided, while the run is in progress. */
  activeNodeId: string | null;
  steps: ExecutionStep[];
  error: string | null;
};

type RunActions = {
  startRun: (request: Omit<WorkflowRunRequest, "runKey">) => Promise<void>;
  clear: () => void;
};

const initialState: RunState = { status: "idle", eventId: null, activeNodeId: null, steps: [], error: null };

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
export const useRunStore = create<RunState & RunActions>()((set) => ({
  ...initialState,

  startRun: async ({ graph, input }) => {
    stopListening();
    const runId = ++activeRun;
    const isCurrent = () => runId === activeRun;
    const fail = (error: string) => {
      if (!isCurrent()) return;
      stopListening();
      set({ status: "failed", activeNodeId: null, error });
    };

    set({ ...initialState, status: "queued" });
    const runKey = crypto.randomUUID();

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
            const step = message.data;
            set((s) => (s.steps.some((x) => x.order === step.order) ? s : { steps: [...s.steps, step] }));
            return;
          }

          const update = message.data;
          if (update.status === "running") {
            set({ status: "running", activeNodeId: update.nodeId });
          } else if (update.status === "completed") {
            stopListening();
            set({ status: "completed", activeNodeId: null });
          } else {
            fail(update.error);
          }
        },
        onError: (err: unknown) => fail(`Lost connection to the run: ${(err as Error)?.message ?? err}`),
      });
      const timeout = setTimeout(
        () => fail("Timed out waiting for the run to finish. Is the Inngest dev server running?"),
        RUN_TIMEOUT_MS,
      );
      teardown = () => {
        clearTimeout(timeout);
        subscription.close();
      };
      if (!isCurrent()) return stopListening();

      const { eventId } = await postJson<{ eventId: string }>("/api/workflows/run", { graph, input, runKey });
      if (isCurrent()) set({ eventId });
    } catch (err) {
      fail((err as Error).message);
    }
  },

  clear: () => {
    activeRun++;
    stopListening();
    set(initialState);
  },
}));
