"use client";

import { Loader2, Play } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { BRANCHES, branchFor } from "@/lib/branches";
import { toRunnableGraph, validateRunnable } from "@/lib/graph";
import { useRunStore } from "@/store/run-store";
import { useWorkflowStore } from "@/store/workflow-store";
import type { RunStatus } from "@/types/workflow";

const STATUS_LABEL: Record<Exclude<RunStatus, "idle">, string> = {
  queued: "Queued",
  running: "Running",
  completed: "Completed",
  failed: "Failed",
};

/** Workflow input, Run button, and the ordered results of the latest run. */
export function RunPanel() {
  const input = useWorkflowStore((s) => s.input);
  const setInput = useWorkflowStore((s) => s.setInput);
  const startNodeId = useWorkflowStore((s) => s.startNodeId);
  const nodes = useWorkflowStore((s) => s.nodes);
  const edges = useWorkflowStore((s) => s.edges);
  const { status, steps, error, activeNodeId, startRun } = useRunStore();

  const graph = { startNodeId, nodes, edges };
  const problem = validateRunnable(graph, input);
  const isRunning = status === "queued" || status === "running";
  const activeLabel = nodes.find((n) => n.id === activeNodeId)?.data.label;

  return (
    <section className="space-y-3 p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">Run workflow</h2>
        {status !== "idle" && (
          <Badge variant={status === "failed" ? "destructive" : status === "completed" ? "default" : "secondary"}>
            {STATUS_LABEL[status]}
          </Badge>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="run-input">Input</Label>
        <Textarea
          id="run-input"
          rows={4}
          placeholder="The text each node decides about, e.g. a customer message."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
      </div>

      <Button
        className="w-full"
        disabled={isRunning || problem !== null}
        onClick={() => startRun({ graph: toRunnableGraph(graph), input })}
      >
        {isRunning ? <Loader2 className="animate-spin" /> : <Play />}
        {isRunning ? "Running…" : "Run"}
      </Button>
      {problem && <p className="text-xs text-muted-foreground">{problem}</p>}

      {error && <p className="text-sm text-destructive">{error}</p>}

      {steps.length > 0 && (
        <ol className="space-y-2">
          {steps.map((step) => (
            <li key={step.nodeId} className="rounded-lg border p-2 text-sm">
              <div className="flex items-center justify-between gap-2">
                <span className="truncate font-medium">
                  {step.order}. {step.label}
                </span>
                <span
                  className="rounded px-1.5 py-0.5 text-[10px] font-semibold text-white"
                  style={{ background: BRANCHES[branchFor(step.decision)].color }}
                >
                  {step.decision}
                </span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{step.prompt}</p>
            </li>
          ))}
          {status === "completed" && (
            <li className="text-xs text-muted-foreground">Workflow ended after {steps.at(-1)!.label}.</li>
          )}
        </ol>
      )}
      {isRunning && activeLabel && (
        <p className="flex items-center gap-2 text-xs text-muted-foreground">
          <Loader2 className="size-3 animate-spin" /> Deciding: {activeLabel}
        </p>
      )}
    </section>
  );
}
