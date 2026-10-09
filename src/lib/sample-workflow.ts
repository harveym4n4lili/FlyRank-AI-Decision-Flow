import { createBranchEdge, createDecisionNode } from "@/lib/graph";
import type { WorkflowGraph } from "@/types/workflow";

/** Starter graph from the assignment brief: support vs. sales routing. */
export const sampleWorkflow: WorkflowGraph = {
  startNodeId: "classify",
  nodes: [
    createDecisionNode({ x: 250, y: 0 }, { label: "Classify", prompt: "Is this a support request?" }, "classify"),
    createDecisionNode({ x: 0, y: 220 }, { label: "Support", prompt: "Is the issue urgent?" }, "support"),
    createDecisionNode({ x: 500, y: 220 }, { label: "Sales", prompt: "Is this an enterprise lead?" }, "sales"),
  ],
  edges: [
    createBranchEdge("classify", "support", "yes"),
    createBranchEdge("classify", "sales", "no"),
  ],
};

export const sampleInput =
  "Hi, I was charged twice for my subscription this month. Can you refund the duplicate payment?";
