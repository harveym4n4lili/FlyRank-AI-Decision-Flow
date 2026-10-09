/** Server-only environment access. Throws early with a clear message when a key is missing. */
function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

export const env = {
  get openaiApiKey() {
    return required("OPENAI_API_KEY");
  },
  openaiModel: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
};
