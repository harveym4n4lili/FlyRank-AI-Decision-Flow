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

/** Payload of the "workflow/run" event: the graph plus the text every node decides about. */
export type WorkflowRunRequest = {
  graph: WorkflowGraph;
  input: string;
  /** Client-generated id naming the realtime channel this run reports progress on. */
  runKey: string;
};

/** One executed node, in the order it ran. */
export type ExecutionStep = {
  order: number;
  nodeId: string;
  label: string;
  prompt: string;
  decision: Decision;
  /** Node the selected edge led to, or null when that branch ends the workflow. */
  nextNodeId: string | null;
};

export type WorkflowRunResult = {
  steps: ExecutionStep[];
};

export type RunStatus = "idle" | "queued" | "running" | "completed" | "failed";
