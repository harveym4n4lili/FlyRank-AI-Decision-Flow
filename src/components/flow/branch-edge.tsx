import { BaseEdge, EdgeLabelRenderer, getBezierPath, type EdgeProps } from "@xyflow/react";
import { BRANCHES } from "@/lib/branches";
import type { Branch, DecisionEdge } from "@/types/workflow";

function BranchEdge({ branch, ...props }: EdgeProps<DecisionEdge> & { branch: Branch }) {
  const [path, labelX, labelY] = getBezierPath(props);
  const { color, decision } = BRANCHES[branch];

  return (
    <>
      <BaseEdge
        id={props.id}
        path={path}
        markerEnd={props.markerEnd}
        style={{ stroke: color, strokeWidth: props.selected ? 3 : 2 }}
      />
      <EdgeLabelRenderer>
        <div
          className="nodrag nopan pointer-events-auto absolute rounded px-1.5 py-0.5 text-[10px] font-semibold text-white"
          style={{ transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`, background: color }}
        >
          {decision}
        </div>
      </EdgeLabelRenderer>
    </>
  );
}

function YesEdge(props: EdgeProps<DecisionEdge>) {
  return <BranchEdge {...props} branch="yes" />;
}

function NoEdge(props: EdgeProps<DecisionEdge>) {
  return <BranchEdge {...props} branch="no" />;
}

export const edgeTypes = { yes: YesEdge, no: NoEdge };
