import { branchFor } from "@/lib/branches";
import { useRunStore } from "@/store/run-store";
import type { Branch, EdgeRunState, NodeRunState } from "@/types/workflow";

/** Whether nothing has run yet (or a run is only queued), so the canvas shows no run state. */
const isIdle = (status: string) => status === "idle" || status === "queued";

/** How a node should look given the current or viewed run. */
export function useNodeRunState(nodeId: string): NodeRunState {
  return useRunStore((s) => {
    if (isIdle(s.status)) return "idle";
    if (s.activeNodeId === nodeId) return "active";
    if (s.failedNodeId === nodeId) return "failed";
    const step = s.steps.find((x) => x.nodeId === nodeId);
    if (step) return step.decision === "YES" ? "yes" : "no";
    return "skipped";
  });
}

/** How an edge should look: taken by the run, still animating while it runs, or not taken. */
export function useEdgeRunState(source: string, branch: Branch): EdgeRunState {
  return useRunStore((s) => {
    if (isIdle(s.status)) return "idle";
    const taken = s.steps.some((x) => x.nodeId === source && branchFor(x.decision) === branch);
    if (!taken) return "skipped";
    return s.status === "running" ? "active" : "taken";
  });
}
