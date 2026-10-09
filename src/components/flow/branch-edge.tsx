import { BaseEdge, EdgeLabelRenderer, getBezierPath, type EdgeProps } from "@xyflow/react";
import { useEdgeRunState } from "@/hooks/use-run-state";
import { BRANCHES } from "@/lib/branches";
import type { Branch, DecisionEdge, EdgeRunState } from "@/types/workflow";

const STROKE_WIDTH: Record<EdgeRunState, number> = { idle: 2, active: 3.5, taken: 3.5, skipped: 1.5 };

function BranchEdge({ branch, ...props }: EdgeProps<DecisionEdge> & { branch: Branch }) {
  const [path, labelX, labelY] = getBezierPath(props);
  const { color, decision } = BRANCHES[branch];
  const runState = useEdgeRunState(props.source, branch);
  const opacity = runState === "skipped" ? 0.25 : 1;

  return (
    <>
      <BaseEdge
        id={props.id}
        path={path}
        markerEnd={props.markerEnd}
        style={{
          stroke: color,
          strokeWidth: props.selected ? STROKE_WIDTH[runState] + 1 : STROKE_WIDTH[runState],
          opacity,
          transition: "opacity 300ms, stroke-width 300ms",
          // React Flow's built-in dash animation, used while the run is moving along this edge.
          ...(runState === "active" && { strokeDasharray: 6, animation: "dashdraw 0.5s linear infinite" }),
        }}
      />
      <EdgeLabelRenderer>
        <div
          className="nodrag nopan pointer-events-auto absolute rounded px-1.5 py-0.5 text-[10px] font-semibold text-white"
          style={{
            transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
            background: color,
            opacity,
          }}
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
