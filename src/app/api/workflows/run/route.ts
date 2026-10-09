import { NextResponse } from "next/server";
import { inngest } from "@/inngest/client";
import type { WorkflowGraph } from "@/types/workflow";

/** Kicks off a workflow run by sending the graph to Inngest. */
export async function POST(req: Request) {
  const { graph } = (await req.json()) as { graph: WorkflowGraph };
  const { ids } = await inngest.send({ name: "workflow/run", data: { graph } });
  return NextResponse.json({ eventId: ids[0] });
}
