import type { WorkflowGraph } from "@/types/workflow";

/** Starter graph from the assignment brief: support vs. sales routing. */
export const sampleWorkflow: WorkflowGraph = {
  nodes: [
    {
      id: "classify",
      type: "decision",
      position: { x: 250, y: 0 },
      data: { label: "Classify", prompt: "Is this a support request?" },
    },
    {
      id: "support",
      type: "decision",
      position: { x: 0, y: 200 },
      data: { label: "Support", prompt: "Is the issue urgent?" },
    },
    {
      id: "sales",
      type: "decision",
      position: { x: 500, y: 200 },
      data: { label: "Sales", prompt: "Is this an enterprise lead?" },
    },
  ],
  edges: [
    { id: "classify-yes", source: "classify", target: "support", label: "YES", data: { branch: "YES" } },
    { id: "classify-no", source: "classify", target: "sales", label: "NO", data: { branch: "NO" } },
  ],
};
