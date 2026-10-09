import { NonRetriableError } from "inngest";
import OpenAI from "openai";
import { workflowRunChannel } from "@/inngest/channels";
import { inngest } from "@/inngest/client";
import { branchFor } from "@/lib/branches";
import { decide } from "@/lib/decide";
import { MissingEnvError } from "@/lib/env";
import { findBranchEdge } from "@/lib/graph";
import type { ExecutionStep, WorkflowRunRequest, WorkflowRunResult } from "@/types/workflow";

/** Errors a retry can't fix (bad config, bad key, no credit) fail the run immediately. */
async function decideOrFail(prompt: string, input: string) {
  try {
    return await decide(prompt, input);
  } catch (err) {
    const permanent =
      err instanceof MissingEnvError ||
      err instanceof OpenAI.AuthenticationError ||
      (err instanceof OpenAI.RateLimitError && err.code === "insufficient_quota");
    if (permanent) throw new NonRetriableError((err as Error).message, { cause: err });
    throw err;
  }
}

/**
 * Executes a decision workflow: starting at the start node, each node runs as its
 * own Inngest step that asks the LLM YES or NO, then execution follows the matching
 * edge until a branch has no outgoing edge. Progress streams to the browser over
 * the run's realtime channel.
 */
export const runWorkflow = inngest.createFunction(
  {
    id: "run-workflow",
    retries: 2,
    triggers: [{ event: "workflow/run" }],
    onFailure: async ({ event, error, step }) => {
      const { runKey } = event.data.event.data as WorkflowRunRequest;
      await step.realtime.publish("publish-failure", workflowRunChannel(runKey).status, {
        status: "failed",
        error: error.message,
      });
    },
  },
  async ({ event, step }): Promise<WorkflowRunResult> => {
    const { graph, input, runKey } = event.data as WorkflowRunRequest;
    const channel = workflowRunChannel(runKey);
    const nodesById = new Map(graph.nodes.map((n) => [n.id, n]));
    const steps: ExecutionStep[] = [];

    let node = graph.startNodeId ? nodesById.get(graph.startNodeId) : undefined;
    if (!node) throw new NonRetriableError("Workflow has no valid start node.");

    while (node) {
      const current = node;
      // The editor prevents cycles, but the event payload is untrusted.
      if (steps.some((s) => s.nodeId === current.id)) {
        throw new NonRetriableError(`Cycle detected at node "${current.data.label}".`);
      }

      await step.realtime.publish(`active-${current.id}`, channel.status, {
        status: "running",
        nodeId: current.id,
      });

      const decision = await step.run(
        { id: `node-${current.id}`, name: `${current.data.label}: ${current.data.prompt}` },
        () => decideOrFail(current.data.prompt, input),
      );

      const edge = findBranchEdge(graph.edges, current.id, branchFor(decision));
      const executed: ExecutionStep = {
        order: steps.length + 1,
        nodeId: current.id,
        label: current.data.label,
        prompt: current.data.prompt,
        decision,
        nextNodeId: edge?.target ?? null,
      };
      steps.push(executed);
      await step.realtime.publish(`result-${current.id}`, channel.step, executed);

      node = edge ? nodesById.get(edge.target) : undefined;
    }

    await step.realtime.publish("completed", channel.status, { status: "completed" });
    return { steps };
  },
);
