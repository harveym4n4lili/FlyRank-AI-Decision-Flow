import {
  applyEdgeChanges,
  applyNodeChanges,
  type Connection,
  type EdgeChange,
  type NodeChange,
  type XYPosition,
} from "@xyflow/react";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { isBranch } from "@/lib/branches";
import { createBranchEdge, createDecisionNode } from "@/lib/graph";
import { sampleInput, sampleWorkflow } from "@/lib/sample-workflow";
import type { DecisionEdge, DecisionNode, DecisionNodeData, WorkflowGraph } from "@/types/workflow";

type WorkflowState = WorkflowGraph & {
  /** Text every decision node is asked about when the workflow runs. */
  input: string;
};

type WorkflowActions = {
  setInput: (input: string) => void;
  onNodesChange: (changes: NodeChange<DecisionNode>[]) => void;
  onEdgesChange: (changes: EdgeChange<DecisionEdge>[]) => void;
  onConnect: (connection: Connection) => void;
  addNode: (position: XYPosition) => void;
  updateNodeData: (id: string, patch: Partial<DecisionNodeData>) => void;
  deleteNode: (id: string) => void;
  setStartNode: (id: string) => void;
  reset: () => void;
};

/** Keeps the start pointer on an existing node after removals. */
function resolveStart(startNodeId: string | null, nodes: DecisionNode[]): string | null {
  return nodes.some((n) => n.id === startNodeId) ? startNodeId : (nodes[0]?.id ?? null);
}

/** Graph editor state, persisted to localStorage so work survives reloads. */
export const useWorkflowStore = create<WorkflowState & WorkflowActions>()(
  persist(
    (set) => ({
      ...structuredClone(sampleWorkflow),
      input: sampleInput,

      setInput: (input) => set({ input }),

      onNodesChange: (changes) =>
        set((s) => {
          const nodes = applyNodeChanges(changes, s.nodes);
          return { nodes, startNodeId: resolveStart(s.startNodeId, nodes) };
        }),

      onEdgesChange: (changes) => set((s) => ({ edges: applyEdgeChanges(changes, s.edges) })),

      onConnect: ({ source, target, sourceHandle }) => {
        if (!isBranch(sourceHandle)) return;
        set((s) => ({ edges: [...s.edges, createBranchEdge(source, target, sourceHandle)] }));
      },

      addNode: (position) =>
        set((s) => {
          const node = { ...createDecisionNode(position), selected: true };
          return {
            nodes: [...s.nodes.map((n) => ({ ...n, selected: false })), node],
            startNodeId: s.startNodeId ?? node.id,
          };
        }),

      updateNodeData: (id, patch) =>
        set((s) => ({
          nodes: s.nodes.map((n) => (n.id === id ? { ...n, data: { ...n.data, ...patch } } : n)),
        })),

      deleteNode: (id) =>
        set((s) => {
          const nodes = s.nodes.filter((n) => n.id !== id);
          return {
            nodes,
            edges: s.edges.filter((e) => e.source !== id && e.target !== id),
            startNodeId: resolveStart(s.startNodeId, nodes),
          };
        }),

      setStartNode: (id) => set({ startNodeId: id }),

      reset: () => set({ ...structuredClone(sampleWorkflow), input: sampleInput }),
    }),
    {
      name: "ai-decision-flow:workflow",
      version: 1,
      partialize: ({ startNodeId, nodes, edges, input }) => ({ startNodeId, nodes, edges, input }),
    },
  ),
);
