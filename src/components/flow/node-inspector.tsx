"use client";

import { Flag, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { BRANCHES } from "@/lib/branches";
import { useWorkflowStore } from "@/store/workflow-store";
import type { Branch } from "@/types/workflow";

/** Side panel for editing the selected node's label and prompt. */
export function NodeInspector() {
  const nodes = useWorkflowStore((s) => s.nodes);
  const edges = useWorkflowStore((s) => s.edges);
  const startNodeId = useWorkflowStore((s) => s.startNodeId);
  const updateNodeData = useWorkflowStore((s) => s.updateNodeData);
  const deleteNode = useWorkflowStore((s) => s.deleteNode);
  const setStartNode = useWorkflowStore((s) => s.setStartNode);

  const node = nodes.find((n) => n.selected);

  if (!node) {
    return (
      <aside className="w-80 space-y-3 border-l bg-background p-4 text-sm text-muted-foreground">
        <h2 className="font-semibold text-foreground">Editing</h2>
        <ul className="list-disc space-y-1 pl-4">
          <li>Select a node to edit its prompt.</li>
          <li>Drag from the green handle for the YES path, red for the NO path.</li>
          <li>Each handle connects to one node, and loops aren&apos;t allowed.</li>
          <li>Press Backspace or Delete to remove a selected node or edge.</li>
        </ul>
      </aside>
    );
  }

  const targetOf = (branch: Branch) => {
    const edge = edges.find((e) => e.source === node.id && e.sourceHandle === branch);
    return edge ? (nodes.find((n) => n.id === edge.target)?.data.label ?? "Unknown") : null;
  };

  return (
    <aside className="w-80 space-y-4 overflow-y-auto border-l bg-background p-4">
      <h2 className="text-sm font-semibold">Decision node</h2>

      <div className="space-y-2">
        <Label htmlFor="node-label">Label</Label>
        <Input
          id="node-label"
          value={node.data.label}
          onChange={(e) => updateNodeData(node.id, { label: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="node-prompt">Prompt</Label>
        <Textarea
          id="node-prompt"
          rows={5}
          placeholder="A yes/no question, e.g. Is this a support request?"
          value={node.data.prompt}
          onChange={(e) => updateNodeData(node.id, { prompt: e.target.value })}
        />
        <p className="text-xs text-muted-foreground">The model will answer only YES or NO.</p>
      </div>

      <div className="space-y-1 text-sm">
        {(["yes", "no"] as const).map((branch) => (
          <p key={branch}>
            <span className="font-semibold" style={{ color: BRANCHES[branch].color }}>
              {BRANCHES[branch].decision}
            </span>{" "}
            → {targetOf(branch) ?? <span className="text-muted-foreground italic">ends workflow</span>}
          </p>
        ))}
      </div>

      <div className="flex gap-2">
        <Button variant="outline" disabled={startNodeId === node.id} onClick={() => setStartNode(node.id)}>
          <Flag /> {startNodeId === node.id ? "Start node" : "Set as start"}
        </Button>
        <Button variant="destructive" onClick={() => deleteNode(node.id)}>
          <Trash2 /> Delete
        </Button>
      </div>
    </aside>
  );
}
