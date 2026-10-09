import { MarkerType, type Connection, type XYPosition } from "@xyflow/react";
import { BRANCHES, isBranch } from "@/lib/branches";
import type { Branch, DecisionEdge, DecisionNode, DecisionNodeData, WorkflowGraph } from "@/types/workflow";

export function createDecisionNode(
  position: XYPosition,
  data: DecisionNodeData = { label: "New decision", prompt: "" },
  id: string = crypto.randomUUID().slice(0, 8),
): DecisionNode {
  return { id, type: "decision", position, data };
}

export function createBranchEdge(source: string, target: string, branch: Branch): DecisionEdge {
  return {
    id: `${source}-${branch}-${target}`,
    type: branch,
    source,
    sourceHandle: branch,
    target,
    markerEnd: { type: MarkerType.ArrowClosed, color: BRANCHES[branch].color },
  };
}

/** True if adding source → target would let execution loop back to source. */
export function wouldCreateCycle(edges: DecisionEdge[], source: string, target: string): boolean {
  const stack = [target];
  const seen = new Set<string>();
  while (stack.length) {
    const current = stack.pop()!;
    if (current === source) return true;
    if (seen.has(current)) continue;
    seen.add(current);
    for (const edge of edges) if (edge.source === current) stack.push(edge.target);
  }
  return false;
}

/**
 * A connection is valid when it leaves a YES/NO handle that isn't already used
 * and doesn't form a cycle, so every run has exactly one next step and terminates.
 */
export function isValidBranchConnection(
  edges: DecisionEdge[],
  { source, target, sourceHandle }: Connection | DecisionEdge,
): boolean {
  if (source === target || !isBranch(sourceHandle)) return false;
  if (edges.some((e) => e.source === source && e.sourceHandle === sourceHandle)) return false;
  return !wouldCreateCycle(edges, source, target);
}

/** The edge execution follows out of `nodeId` for a given branch, if any. */
export function findBranchEdge(edges: DecisionEdge[], nodeId: string, branch: Branch) {
  return edges.find((e) => e.source === nodeId && e.sourceHandle === branch);
}

function reachableFrom(startNodeId: string, edges: DecisionEdge[]): Set<string> {
  const seen = new Set<string>();
  const stack = [startNodeId];
  while (stack.length) {
    const id = stack.pop()!;
    if (seen.has(id)) continue;
    seen.add(id);
    for (const edge of edges) if (edge.source === id) stack.push(edge.target);
  }
  return seen;
}

/** Returns a user-facing reason the workflow can't run yet, or null if it's ready. */
export function validateRunnable({ startNodeId, nodes, edges }: WorkflowGraph, input: string): string | null {
  if (!input.trim()) return "Enter some input for the workflow to decide on.";
  if (!startNodeId || !nodes.some((n) => n.id === startNodeId)) return "Choose a start node.";
  const reachable = reachableFrom(startNodeId, edges);
  const missing = nodes.find((n) => reachable.has(n.id) && !n.data.prompt.trim());
  if (missing) return `"${missing.data.label || "Untitled"}" needs a prompt.`;
  return null;
}

/** Strips canvas-only fields (position, selection, measurements) before sending a graph to the server. */
export function toRunnableGraph({ startNodeId, nodes, edges }: WorkflowGraph): WorkflowGraph {
  return {
    startNodeId,
    nodes: nodes.map(({ id, type, position, data }) => ({ id, type, position, data })),
    edges: edges.map(({ id, type, source, sourceHandle, target }) => ({ id, type, source, sourceHandle, target })),
  };
}
