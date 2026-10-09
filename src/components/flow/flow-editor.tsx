"use client";

import { ReactFlowProvider } from "@xyflow/react";
import { FlowCanvas } from "@/components/flow/flow-canvas";
import { NodeInspector } from "@/components/flow/node-inspector";

export function FlowEditor() {
  return (
    <ReactFlowProvider>
      <div className="flex h-full">
        <div className="flex-1">
          <FlowCanvas />
        </div>
        <NodeInspector />
      </div>
    </ReactFlowProvider>
  );
}
