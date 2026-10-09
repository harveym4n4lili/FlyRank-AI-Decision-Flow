import { inngest } from "@/inngest/client";
import type { WorkflowGraph } from "@/types/workflow";

/**
 * Executes a decision workflow. Phase 1 placeholder: verifies the event reaches
 * Inngest and the graph is received. Node traversal + LLM calls land in Phase 3.
 */
export const runWorkflow = inngest.createFunction(
  { id: "run-workflow", triggers: [{ event: "workflow/run" }] },
  async ({ event, step }) => {
    const graph = event.data.graph as WorkflowGraph;

    const summary = await step.run("inspect-graph", () => ({
      nodes: graph.nodes.length,
      edges: graph.edges.length,
    }));

    return { status: "received", ...summary };
  },
);
