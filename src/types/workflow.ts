import type { Edge, Node } from "@xyflow/react";

/** Every decision node resolves to exactly one of these. */
export type Decision = "YES" | "NO";

/** Handle id on a node and edge type on the canvas; one per Decision. */
export type Branch = "yes" | "no";

export type DecisionNodeData = {
  label: string;
  prompt: string;
};

export type DecisionNode = Node<DecisionNodeData, "decision">;

/** An edge's type is the branch it represents: the YES path or the NO path. */
export type DecisionEdge = Edge<Record<string, unknown>, Branch>;

export type WorkflowGraph = {
  /** Node where execution begins. */
  startNodeId: string | null;
  nodes: DecisionNode[];
  edges: DecisionEdge[];
};
