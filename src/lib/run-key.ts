const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Run keys name realtime channels, so only accept the UUIDs the browser generates. */
export function isRunKey(value: unknown): value is string {
  return typeof value === "string" && UUID_PATTERN.test(value);
}
