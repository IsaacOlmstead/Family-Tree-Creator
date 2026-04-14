export function setupGridOverlay() {
  const treeArea = document.getElementById("tree-area");
  if (!treeArea) return;

  const existing = treeArea.querySelector(".grid-overlay");
  if (existing) return;

  const grid = document.createElement("div");
  grid.className = "grid-overlay";
  grid.style.display = "none";
  treeArea.prepend(grid);
}

export function toggleGrid(show) {
  const grid = document.querySelector(".grid-overlay");
  if (grid) {
    grid.style.display = show ? "block" : "none";
  }
}
