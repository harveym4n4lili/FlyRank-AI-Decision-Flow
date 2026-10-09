import { Handle, Position, type NodeProps } from "@xyflow/react";
import { cn } from "cn";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BRANCHES } from "@/lib/branches";
import { useWorkflowStore } from "@/store/workflow-store";
import type { Branch, DecisionNode as DecisionNodeType } from "@/types/workflow";

const HANDLE_SIZE = 12;

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

  return (
    <>
      <Handle type="target" position={Position.Top} style={{ width: HANDLE_SIZE, height: HANDLE_SIZE }} />
      <Card size="sm" className={cn("w-60 gap-2 pb-2", selected && "ring-2 ring-primary")}>
        <CardHeader className="flex items-center justify-between gap-2">
          <CardTitle className="truncate">{data.label || "Untitled"}</CardTitle>
          {isStart && <Badge>Start</Badge>}
        </CardHeader>
        <CardContent className="text-xs text-muted-foreground">
          {data.prompt || <span className="italic">No prompt yet</span>}
        </CardContent>
        <div className="flex justify-around text-[10px] font-semibold">
          <span style={{ color: BRANCHES.yes.color }}>YES</span>
          <span style={{ color: BRANCHES.no.color }}>NO</span>
        </div>
      </Card>
      <BranchHandle branch="yes" left="25%" />
      <BranchHandle branch="no" left="75%" />
    </>
  );
}
