import { env } from "@/lib/env";
import { getOpenAI } from "@/lib/openai";
import type { Decision } from "@/types/workflow";

const SYSTEM_PROMPT =
  "You are one decision step in an automated workflow. " +
  "Answer the question about the input with exactly YES or NO. " +
  "If the input doesn't clearly support YES, answer NO.";

/** Structured output pinned to an enum, so the model can only produce YES or NO. */
const DECISION_FORMAT = {
  type: "json_schema",
  json_schema: {
    name: "decision",
    strict: true,
    schema: {
      type: "object",
      properties: { decision: { type: "string", enum: ["YES", "NO"] } },
      required: ["decision"],
      additionalProperties: false,
    },
  },
} as const;

/** Parses the model's reply, rejecting anything other than YES or NO. */
export function parseDecision(raw: string | null | undefined): Decision {
  try {
    const { decision } = JSON.parse(raw ?? "") as { decision?: unknown };
    if (decision === "YES" || decision === "NO") return decision;
  } catch {
    // fall through to the error below
  }
  throw new Error(`Model returned an invalid decision: ${raw}`);
}

/** Asks the LLM a single yes/no question about the workflow input. */
export async function decide(prompt: string, input: string): Promise<Decision> {
  const completion = await getOpenAI().chat.completions.create({
    model: env.openaiModel,
    temperature: 0,
    response_format: DECISION_FORMAT,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: `Question: ${prompt}\n\nInput:\n${input}` },
    ],
  });
  return parseDecision(completion.choices[0]?.message.content);
}
