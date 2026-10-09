import { NextResponse } from "next/server";
import { getSubscriptionToken } from "inngest/realtime";
import { RUN_TOPICS, workflowRunChannel, type RealtimeToken } from "@/inngest/channels";
import { inngest } from "@/inngest/client";
import { isRunKey } from "@/lib/run-key";

/** Issues a token that lets the browser subscribe to one run's realtime channel. */
export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as { runKey?: unknown } | null;
  if (!isRunKey(body?.runKey)) {
    return NextResponse.json({ error: "Expected { runKey } as a UUID." }, { status: 400 });
  }

  const { key, apiBaseUrl } = await getSubscriptionToken(inngest, {
    channel: workflowRunChannel(body.runKey),
    topics: [...RUN_TOPICS],
  });
  return NextResponse.json({ key, apiBaseUrl } satisfies RealtimeToken);
}
