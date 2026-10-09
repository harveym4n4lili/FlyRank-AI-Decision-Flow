import { Handle, Position, type NodeProps } from "@xyflow/react";
import { cn } from "cn";
import { CircleAlert, CircleCheck, CircleX, GitFork, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNodeRunState } from "@/hooks/use-run-state";
import { BRANCHES } from "@/lib/branches";
import { useWorkflowStore } from "@/store/workflow-store";
import type { Branch, DecisionNode as DecisionNodeType, NodeRunState } from "@/types/workflow";

const HANDLE_SIZE = 12;
const ACTIVE_COLOR = "#f59e0b";
const FAILED_COLOR = "#dc2626";

/** Outline colour per run state; idle and skipped nodes keep the default card ring. */
const RUN_RING: Partial<Record<NodeRunState, string>> = {
  active: ACTIVE_COLOR,
  yes: BRANCHES.yes.color,
  no: BRANCHES.no.color,
  failed: FAILED_COLOR,
};

function RunStateIcon({ state }: { state: NodeRunState }) {
  switch (state) {
    case "active":
      return <Loader2 className="size-4 animate-spin" style={{ color: ACTIVE_COLOR }} />;
    case "yes":
      return <CircleCheck className="size-4" style={{ color: BRANCHES.yes.color }} />;
    case "no":
      return <CircleX className="size-4" style={{ color: BRANCHES.no.color }} />;
    case "failed":
      return <CircleAlert className="size-4" style={{ color: FAILED_COLOR }} />;
    default:
      return <GitFork className="size-4 text-muted-foreground" />;
  }
}

function BranchHandle({ branch, left }: { branch: Branch; left: string }) {
  return (
    <Handle
      type="source"
      id={branch}
      position={Position.Bottom}
      style={{ left, width: HANDLE_SIZE, height: HANDLE_SIZE, background: BRANCHES[branch].color }}
    />
  );
}

export function DecisionNode({ id, data, selected }: NodeProps<DecisionNodeType>) {
  const isStart = useWorkflowStore((s) => s.startNodeId === id);
  const runState = useNodeRunState(id);
  const ring = RUN_RING[runState];

  return (
    <div className={cn("transition-opacity duration-300", runState === "skipped" && "opacity-40")}>
      <Handle type="target" position={Position.Top} style={{ width: HANDLE_SIZE, height: HANDLE_SIZE }} />
      <Card
        size="sm"
        className={cn(
          "w-60 gap-2 pb-2 transition-shadow duration-300",
          selected && "outline-2 outline-offset-2 outline-primary",
          runState === "failed" && "bg-red-50",
        )}
        style={
          ring
            ? {
                boxShadow:
                  runState === "active" ? `0 0 0 2px ${ring}, 0 0 18px 2px ${ring}66` : `0 0 0 2px ${ring}`,
              }
            : undefined
        }
      >
        <CardHeader className="flex items-center gap-2">
          <RunStateIcon state={runState} />
          <CardTitle className="flex-1 truncate">{data.label || "Untitled"}</CardTitle>
          {isStart && <Badge>Start</Badge>}
        </CardHeader>
        <CardContent className="line-clamp-3 text-xs text-muted-foreground">
          {data.prompt || <span className="italic">No prompt yet</span>}
        </CardContent>
        <div className="flex justify-around text-[10px] font-semibold">
          <span style={{ color: BRANCHES.yes.color }}>YES</span>
          <span style={{ color: BRANCHES.no.color }}>NO</span>
        </div>
      </Card>
      <BranchHandle branch="yes" left="25%" />
      <BranchHandle branch="no" left="75%" />
    </div>
  );
}
