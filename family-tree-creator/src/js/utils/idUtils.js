export function createId(prefix = "p") {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}
