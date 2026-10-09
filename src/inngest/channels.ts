import { channel, staticSchema } from "inngest/realtime";
import type { ExecutionStep } from "@/types/workflow";

export type RunStatusMessage =
  | { status: "running"; nodeId: string }
  | { status: "completed" }
  | { status: "failed"; error: string };

/**
 * One realtime channel per run, keyed by a client-generated runKey so the browser
 * can subscribe before the run starts and never miss a message.
 */
export const workflowRunChannel = channel({
  name: (runKey: string) => `workflow-run:${runKey}`,
  topics: {
    step: { schema: staticSchema<ExecutionStep>() },
    status: { schema: staticSchema<RunStatusMessage>() },
  },
});

export const RUN_TOPICS = ["step", "status"] as const;

/** A message received on a run's channel. */
export type RunChannelMessage =
  | { kind: "data"; topic: "step"; data: ExecutionStep }
  | { kind: "data"; topic: "status"; data: RunStatusMessage };

/** What the browser needs to subscribe to a run's channel. */
export type RealtimeToken = { key: string | undefined; apiBaseUrl?: string };
