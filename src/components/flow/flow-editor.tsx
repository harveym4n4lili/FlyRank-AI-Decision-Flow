"use client";

import { ReactFlowProvider } from "@xyflow/react";
import { FlowCanvas } from "@/components/flow/flow-canvas";
import { NodeInspector } from "@/components/flow/node-inspector";
import { RunDetails } from "@/components/flow/run-details";
import { RunPanel } from "@/components/flow/run-panel";

export function FlowEditor() {
  return (
    <ReactFlowProvider>
      <div className="flex h-full">
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="min-h-0 flex-1">
            <FlowCanvas />
          </div>
          <RunDetails />
        </div>
        <aside className="w-80 divide-y overflow-y-auto border-l bg-background">
          <RunPanel />
          <NodeInspector />
        </aside>
      </div>
    </ReactFlowProvider>
  );
}
