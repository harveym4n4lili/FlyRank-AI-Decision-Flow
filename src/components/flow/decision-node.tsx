import { Handle, Position, type NodeProps } from "@xyflow/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DecisionNode as DecisionNodeType } from "@/types/workflow";

export function DecisionNode({ data }: NodeProps<DecisionNodeType>) {
  return (
    <Card className="w-56 gap-2 py-3">
      <Handle type="target" position={Position.Top} />
      <CardHeader className="px-4">
        <CardTitle className="text-sm">{data.label}</CardTitle>
      </CardHeader>
      <CardContent className="px-4 text-xs text-muted-foreground">{data.prompt}</CardContent>
      <Handle type="source" position={Position.Bottom} />
    </Card>
  );
}
