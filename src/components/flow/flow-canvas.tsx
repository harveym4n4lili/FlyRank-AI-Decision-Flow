"use client";

import { useCallback, useRef } from "react";
import {
  Background,
  Controls,
  MiniMap,
  Panel,
  ReactFlow,
  useReactFlow,
  type Connection,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Plus, RotateCcw } from "lucide-react";
import { useShallow } from "zustand/react/shallow";
import { edgeTypes } from "@/components/flow/branch-edge";
import { DecisionNode } from "@/components/flow/decision-node";
import { Button } from "@/components/ui/button";
import { isValidBranchConnection } from "@/lib/graph";
import { useWorkflowStore } from "@/store/workflow-store";
import type { DecisionEdge } from "@/types/workflow";

const nodeTypes = { decision: DecisionNode };

/** Half the node's rendered size, so new nodes land centred in the viewport. */
const NODE_OFFSET = { x: 120, y: 50 };

export function FlowCanvas() {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, addNode, reset } = useWorkflowStore(
    useShallow((s) => ({
      nodes: s.nodes,
      edges: s.edges,
      onNodesChange: s.onNodesChange,
      onEdgesChange: s.onEdgesChange,
      onConnect: s.onConnect,
      addNode: s.addNode,
      reset: s.reset,
    })),
  );
  const { screenToFlowPosition, fitView } = useReactFlow();
  const wrapper = useRef<HTMLDivElement>(null);

  const isValidConnection = useCallback(
    (connection: Connection | DecisionEdge) =>
      isValidBranchConnection(useWorkflowStore.getState().edges, connection),
    [],
  );

  const handleAddNode = () => {
    const rect = wrapper.current!.getBoundingClientRect();
    const center = screenToFlowPosition({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
    addNode({ x: center.x - NODE_OFFSET.x, y: center.y - NODE_OFFSET.y });
  };

  const handleReset = () => {
    if (!window.confirm("Replace the current workflow with the sample workflow?")) return;
    reset();
    requestAnimationFrame(() => fitView());
  };

  return (
    <div ref={wrapper} className="h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        isValidConnection={isValidConnection}
        deleteKeyCode={["Backspace", "Delete"]}
        fitView
      >
        <Panel position="top-left" className="flex gap-2">
          <Button onClick={handleAddNode}>
            <Plus /> Add node
          </Button>
          <Button variant="outline" onClick={handleReset}>
            <RotateCcw /> Reset
          </Button>
        </Panel>
        {nodes.length === 0 && (
          <Panel position="top-center" className="mt-20 text-sm text-muted-foreground">
            Add a node to start building your workflow.
          </Panel>
        )}
        <Background />
        <Controls />
        <MiniMap />
      </ReactFlow>
    </div>
  );
}
