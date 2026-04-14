export function enableDragAndDrop() {
  const container = document.getElementById("tree-area");
  if (!container) return;
  container.addEventListener("mousedown", (event) => {
    if (!(event.target instanceof SVGElement)) return;
    event.preventDefault();
  });
}
