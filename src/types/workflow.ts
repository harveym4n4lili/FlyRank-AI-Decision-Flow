import type { Edge, Node } from "@xyflow/react";

/** Every decision node resolves to exactly one of these. */
export type Decision = "YES" | "NO";

export type DecisionNodeData = {
  label: string;
  prompt: string;
};

export type DecisionNode = Node<DecisionNodeData, "decision">;

/** Edges carry the branch they represent: the YES path or the NO path. */
export type DecisionEdge = Edge<{ branch: Decision }>;

export type WorkflowGraph = {
  nodes: DecisionNode[];
  edges: DecisionEdge[];
};
