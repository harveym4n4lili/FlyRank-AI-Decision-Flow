"use client";

import { useRef, type ChangeEvent } from "react";
import { useReactFlow } from "@xyflow/react";
import { Download, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { parseWorkflowFile, toWorkflowFile } from "@/lib/workflow-file";
import { useRunStore } from "@/store/run-store";
import { useWorkflowStore } from "@/store/workflow-store";

/** Export the workflow to a JSON file, or import one exported earlier. */
export function WorkflowFileButtons() {
  const fileInput = useRef<HTMLInputElement>(null);
  const { fitView } = useReactFlow();

  const handleExport = () => {
    const { startNodeId, nodes, edges, input } = useWorkflowStore.getState();
    const json = JSON.stringify(toWorkflowFile({ startNodeId, nodes, edges }, input), null, 2);
    const url = URL.createObjectURL(new Blob([json], { type: "application/json" }));
    const link = Object.assign(document.createElement("a"), { href: url, download: "workflow.json" });
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Workflow exported", { description: `${nodes.length} nodes, ${edges.length} edges` });
  };

  const handleImport = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = ""; // allow re-importing the same file
    if (!file) return;
    try {
      const { graph, input } = parseWorkflowFile(await file.text());
      useWorkflowStore.getState().loadWorkflow(graph, input);
      useRunStore.getState().clear();
      requestAnimationFrame(() => fitView());
      toast.success("Workflow imported", { description: `${graph.nodes.length} nodes from ${file.name}` });
    } catch (err) {
      toast.error("Couldn't import workflow", { description: (err as Error).message });
    }
  };

  return (
    <>
      <Button variant="outline" onClick={handleExport}>
        <Download /> Export
      </Button>
      <Button variant="outline" onClick={() => fileInput.current?.click()}>
        <Upload /> Import
      </Button>
      <input ref={fileInput} type="file" accept="application/json,.json" hidden onChange={handleImport} />
    </>
  );
}
