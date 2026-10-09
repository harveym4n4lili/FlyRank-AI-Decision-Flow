import { NextResponse } from "next/server";
import { inngest } from "@/inngest/client";
import { validateRunnable } from "@/lib/graph";
import { isRunKey } from "@/lib/run-key";
import type { WorkflowRunRequest } from "@/types/workflow";

/** Validates the workflow, then kicks off a run by sending it to Inngest. */
export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as Partial<WorkflowRunRequest> | null;
  if (!body?.graph || typeof body.input !== "string" || !isRunKey(body.runKey)) {
    return NextResponse.json({ error: "Expected { graph, input, runKey }." }, { status: 400 });
  }

  const problem = validateRunnable(body.graph, body.input);
  if (problem) return NextResponse.json({ error: problem }, { status: 400 });

  const { graph, input, runKey } = body;
  const { ids } = await inngest.send({
    name: "workflow/run",
    data: { graph, input, runKey } satisfies WorkflowRunRequest,
  });
  return NextResponse.json({ eventId: ids[0] });
}
