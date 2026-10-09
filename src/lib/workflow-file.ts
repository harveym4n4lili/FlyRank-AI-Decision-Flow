import { isBranch } from "@/lib/branches";
import { createBranchEdge, createDecisionNode, isValidBranchConnection } from "@/lib/graph";
import type { Branch, DecisionEdge, WorkflowGraph } from "@/types/workflow";

export const WORKFLOW_FILE_VERSION = 1;

/** Portable JSON format for exporting and importing a workflow. */
export type WorkflowFile = {
  version: typeof WORKFLOW_FILE_VERSION;
  startNodeId: string | null;
  input: string;
  nodes: { id: string; position: { x: number; y: number }; data: { label: string; prompt: string } }[];
  edges: { source: string; target: string; branch: Branch }[];
};

export function toWorkflowFile({ startNodeId, nodes, edges }: WorkflowGraph, input: string): WorkflowFile {
  return {
    version: WORKFLOW_FILE_VERSION,
    startNodeId,
    input,
    nodes: nodes.map(({ id, position, data }) => ({ id, position, data })),
    edges: edges.map(({ source, target, type }) => ({ source, target, branch: type! })),
  };
}

const isObject = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null;
const isFiniteNumber = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v);

/**
 * Parses and validates an exported workflow. Edges are re-added through the same
 * rules as the editor (one edge per YES/NO handle, no loops). Throws an Error with
 * a user-facing message if the file is invalid.
 */
export function parseWorkflowFile(text: string): { graph: WorkflowGraph; input: string } {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    throw new Error("The file isn't valid JSON.");
  }
  if (!isObject(raw) || raw.version !== WORKFLOW_FILE_VERSION) {
    throw new Error(`Expected a workflow file with "version": ${WORKFLOW_FILE_VERSION}.`);
  }
  if (!Array.isArray(raw.nodes) || !Array.isArray(raw.edges)) {
    throw new Error('The file needs "nodes" and "edges" arrays.');
  }

  const nodes = raw.nodes.map((n, i) => {
    const valid =
      isObject(n) &&
      typeof n.id === "string" &&
      n.id !== "" &&
      isObject(n.position) &&
      isFiniteNumber(n.position.x) &&
      isFiniteNumber(n.position.y) &&
      isObject(n.data) &&
      typeof n.data.label === "string" &&
      typeof n.data.prompt === "string";
    if (!valid) throw new Error(`Node ${i + 1} is missing an id, position, label or prompt.`);
    const { id, position, data } = n as WorkflowFile["nodes"][number];
    return createDecisionNode({ x: position.x, y: position.y }, { label: data.label, prompt: data.prompt }, id);
  });

  const ids = new Set(nodes.map((n) => n.id));
  if (ids.size !== nodes.length) throw new Error("Node ids must be unique.");

  const edges: DecisionEdge[] = [];
  raw.edges.forEach((e, i) => {
    if (!isObject(e) || typeof e.source !== "string" || typeof e.target !== "string" || !isBranch(e.branch)) {
      throw new Error(`Edge ${i + 1} needs a source, a target and a branch of "yes" or "no".`);
    }
    if (!ids.has(e.source) || !ids.has(e.target)) throw new Error(`Edge ${i + 1} points to a node that doesn't exist.`);
    const edge = createBranchEdge(e.source, e.target, e.branch);
    if (!isValidBranchConnection(edges, edge)) {
      throw new Error(`Edge ${i + 1} reuses a ${e.branch.toUpperCase()} handle or creates a loop.`);
    }
    edges.push(edge);
  });

  const startNodeId =
    typeof raw.startNodeId === "string" && ids.has(raw.startNodeId) ? raw.startNodeId : (nodes[0]?.id ?? null);
  const input = typeof raw.input === "string" ? raw.input : "";
  return { graph: { startNodeId, nodes, edges }, input };
}
