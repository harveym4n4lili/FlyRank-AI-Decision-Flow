import OpenAI from "openai";
import { env } from "@/lib/env";

let client: OpenAI | null = null;

/** Lazily created so the app can boot without a key until a workflow actually runs. */
export function getOpenAI(): OpenAI {
  client ??= new OpenAI({ apiKey: env.openaiApiKey });
  return client;
}
