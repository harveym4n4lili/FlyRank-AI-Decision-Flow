import { MarkerType, type Connection, type XYPosition } from "@xyflow/react";
import { BRANCHES, isBranch } from "@/lib/branches";
import type { Branch, DecisionEdge, DecisionNode, DecisionNodeData } from "@/types/workflow";

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
