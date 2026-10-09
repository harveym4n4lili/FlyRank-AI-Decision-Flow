import type { Branch, Decision } from "@/types/workflow";

export const BRANCHES: Record<Branch, { decision: Decision; color: string }> = {
  yes: { decision: "YES", color: "#10b981" },
  no: { decision: "NO", color: "#f43f5e" },
};

export function isBranch(value: unknown): value is Branch {
  return value === "yes" || value === "no";
}

export function branchFor(decision: Decision): Branch {
  return decision === "YES" ? "yes" : "no";
}
