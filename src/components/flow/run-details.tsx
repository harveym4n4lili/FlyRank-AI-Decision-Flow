"use client";

import { useEffect, useRef } from "react";
import { cn } from "cn";
import { History, ScrollText, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useHistoryStore } from "@/store/history-store";
import { useRunStore } from "@/store/run-store";
import type { LogEntry } from "@/types/workflow";

const LOG_COLOR: Record<LogEntry["level"], string> = {
  info: "text-foreground",
  success: "text-emerald-600",
  error: "text-red-600",
};

const time = (ms: number) => new Date(ms).toLocaleTimeString([], { hour12: false });

function ExecutionLog() {
  const logs = useRunStore((s) => s.logs);
  const end = useRef<HTMLDivElement>(null);

  // Block body on purpose: scrollIntoView returns a Promise in newer browsers, and an
  // effect must not return anything but a cleanup function.
  useEffect(() => {
    end.current?.scrollIntoView({ block: "end" });
  }, [logs.length]);

  if (logs.length === 0) {
    return <p className="p-3 text-sm text-muted-foreground">Run the workflow to see its execution log.</p>;
  }
  return (
    <div className="space-y-0.5 p-3 font-mono text-xs">
      {logs.map((entry, i) => (
        <div key={i} className="flex gap-3">
          <span className="shrink-0 text-muted-foreground">{time(entry.at)}</span>
          <span className={LOG_COLOR[entry.level]}>{entry.message}</span>
        </div>
      ))}
      <div ref={end} />
    </div>
  );
}

function ExecutionHistory() {
  const entries = useHistoryStore((s) => s.entries);
  const clearHistory = useHistoryStore((s) => s.clear);
  const viewingId = useRunStore((s) => s.viewingHistoryId);
  const showHistory = useRunStore((s) => s.showHistory);

  if (entries.length === 0) {
    return <p className="p-3 text-sm text-muted-foreground">Finished runs will appear here.</p>;
  }
  return (
    <div className="space-y-1 p-2">
      <div className="flex items-center justify-between px-1">
        <p className="text-xs text-muted-foreground">Click a run to show its path on the canvas.</p>
        <Button variant="ghost" size="xs" onClick={clearHistory}>
          <Trash2 /> Clear history
        </Button>
      </div>
      {entries.map((entry) => (
        <button
          key={entry.id}
          type="button"
          onClick={() => showHistory(entry)}
          className={cn(
            "flex w-full items-center gap-3 rounded-md px-2 py-1.5 text-left text-xs hover:bg-muted",
            viewingId === entry.id && "bg-muted",
          )}
        >
          <Badge variant={entry.status === "completed" ? "default" : "destructive"}>
            {entry.status === "completed" ? "Completed" : "Failed"}
          </Badge>
          <span className="shrink-0 text-muted-foreground">{time(entry.startedAt)}</span>
          <span className="shrink-0">
            {entry.steps.length} step{entry.steps.length === 1 ? "" : "s"}
            {entry.steps.length > 0 && ` · ${entry.steps.map((s) => s.decision).join(" → ")}`}
          </span>
          <span className="truncate text-muted-foreground">{entry.input}</span>
        </button>
      ))}
    </div>
  );
}

/** Bottom panel: live execution log and the history of past runs. */
export function RunDetails() {
  return (
    <Tabs defaultValue="log" className="flex h-56 flex-col gap-0 border-t bg-background">
      <TabsList variant="line" className="shrink-0 px-2">
        <TabsTrigger value="log">
          <ScrollText /> Execution log
        </TabsTrigger>
        <TabsTrigger value="history">
          <History /> History
        </TabsTrigger>
      </TabsList>
      <TabsContent value="log" className="min-h-0 flex-1 overflow-y-auto">
        <ExecutionLog />
      </TabsContent>
      <TabsContent value="history" className="min-h-0 flex-1 overflow-y-auto">
        <ExecutionHistory />
      </TabsContent>
    </Tabs>
  );
}
