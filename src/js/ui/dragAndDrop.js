import { routeConnection } from "../services/treeLayoutService.js";

export function enableDragAndDrop(onPositionChange) {
  const container = document.getElementById("tree-area");
  if (!container) return;

  let dragging = false;
  let draggedGroup = null;
  let dragStart = { x: 0, y: 0 };
  let nodeStart = { x: 0, y: 0 };

  function getSvg() {
    return container.querySelector("svg.tree-svg");
  }

  function getGroupFromTarget(target) {
    if (!(target instanceof SVGElement)) return null;
    return target.closest("g[data-node-id]");
  }

  function toSvgPoint(clientX, clientY) {
    const svg = getSvg();
    if (!svg) return null;
    const point = svg.createSVGPoint();
    point.x = clientX;
    point.y = clientY;
    return point.matrixTransform(svg.getScreenCTM().inverse());
  }

  function updateConnections() {
    const svg = getSvg();
    if (!svg) return;

    const groups = Array.from(svg.querySelectorAll("g[data-node-id]")).reduce((map, group) => {
      const nodeId = group.dataset.nodeId;
      const x = parseFloat(group.dataset.x) || 0;
      const y = parseFloat(group.dataset.y) || 0;
      map[nodeId] = { x, y };
      return map;
    }, {});

    svg.querySelectorAll("path[data-source][data-target]").forEach((path) => {
      const source = groups[path.dataset.source];
      const target = groups[path.dataset.target];
      if (!source || !target) return;
      path.setAttribute(
        "d",
        routeConnection({ x: source.x + 110, y: source.y + 110 }, { x: target.x + 110, y: target.y })
      );
    });
  }

  function onMouseMove(event) {
    if (!dragging || !draggedGroup) return;

    const current = toSvgPoint(event.clientX, event.clientY);
    if (!current) return;

    const dx = current.x - dragStart.x;
    const dy = current.y - dragStart.y;
    const x = nodeStart.x + dx;
    const y = nodeStart.y + dy;

    draggedGroup.setAttribute("transform", `translate(${x}, ${y})`);
    draggedGroup.dataset.x = x;
    draggedGroup.dataset.y = y;
    updateConnections();
  }

  function onMouseUp() {
    if (!dragging || !draggedGroup) return;

    const nodeId = draggedGroup.dataset.nodeId;
    const x = parseFloat(draggedGroup.dataset.x) || 0;
    const y = parseFloat(draggedGroup.dataset.y) || 0;

    dragging = false;
    draggedGroup = null;
    window.removeEventListener("mousemove", onMouseMove);
    window.removeEventListener("mouseup", onMouseUp);

    if (typeof onPositionChange === "function" && nodeId) {
      onPositionChange(nodeId, x, y);
    }
  }

  container.addEventListener("mousedown", (event) => {
    const group = getGroupFromTarget(event.target);
    if (!group) return;

    event.preventDefault();
    dragging = true;
    draggedGroup = group;
    const startPoint = toSvgPoint(event.clientX, event.clientY);
    if (!startPoint) return;

    dragStart = { x: startPoint.x, y: startPoint.y };
    nodeStart = {
      x: parseFloat(group.dataset.x) || 0,
      y: parseFloat(group.dataset.y) || 0,
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  });
}
