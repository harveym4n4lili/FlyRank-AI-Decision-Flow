"use client";

import { ReactFlowProvider } from "@xyflow/react";
import { FlowCanvas } from "@/components/flow/flow-canvas";
import { NodeInspector } from "@/components/flow/node-inspector";
import { RunPanel } from "@/components/flow/run-panel";

export function FlowEditor() {
  return (
    <ReactFlowProvider>
      <div className="flex h-full">
        <div className="flex-1">
          <FlowCanvas />
        </div>
        <aside className="w-80 divide-y overflow-y-auto border-l bg-background">
          <RunPanel />
          <NodeInspector />
        </aside>
      </div>
    </ReactFlowProvider>
  );
}
