/** Thrown when a required variable is unset; retrying can't fix it. */
export class MissingEnvError extends Error {
  constructor(name: string) {
    super(`Missing required environment variable: ${name}`);
    this.name = "MissingEnvError";
  }
}

/** Server-only environment access. Throws early with a clear message when a key is missing. */
function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new MissingEnvError(name);
  return value;
}

export const env = {
  get openaiApiKey() {
    return required("OPENAI_API_KEY");
  },
  openaiModel: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
};
