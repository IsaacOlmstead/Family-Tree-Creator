export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

export function snapToGrid(value, gridSize) {
  return Math.round(value / gridSize) * gridSize;
}

export function distance(x1, y1, x2, y2) {
  return Math.hypot(x2 - x1, y2 - y1);
}
