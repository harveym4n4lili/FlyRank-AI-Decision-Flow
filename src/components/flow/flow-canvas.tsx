"use client";

import { Background, Controls, MiniMap, ReactFlow } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { DecisionNode } from "@/components/flow/decision-node";
import { sampleWorkflow } from "@/lib/sample-workflow";

const nodeTypes = { decision: DecisionNode };

export function FlowCanvas() {
  return (
    <ReactFlow
      defaultNodes={sampleWorkflow.nodes}
      defaultEdges={sampleWorkflow.edges}
      nodeTypes={nodeTypes}
      fitView
    >
      <Background />
      <Controls />
      <MiniMap />
    </ReactFlow>
  );
}
