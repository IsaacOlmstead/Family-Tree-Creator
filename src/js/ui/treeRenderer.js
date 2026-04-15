import { computeTreeLayout, routeConnection } from "../services/treeLayoutService.js";

const ZOOM_MIN = 0.4;
const ZOOM_MAX = 2.5;
const DEFAULT_CANVAS_WIDTH = 1600;
const DEFAULT_CANVAS_HEIGHT = 1100;

let currentZoom = {
  x: 0,
  y: 0,
  scale: 1,
};

let currentCanvas = {
  width: DEFAULT_CANVAS_WIDTH,
  height: DEFAULT_CANVAS_HEIGHT,
};

let currentSvg = null;

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function updateSvgViewBox() {
  if (!currentSvg) return;

  const width = currentCanvas.width / currentZoom.scale;
  const height = currentCanvas.height / currentZoom.scale;
  currentZoom.x = clamp(currentZoom.x, 0, Math.max(0, currentCanvas.width - width));
  currentZoom.y = clamp(currentZoom.y, 0, Math.max(0, currentCanvas.height - height));
  currentSvg.setAttribute("viewBox", `${currentZoom.x} ${currentZoom.y} ${width} ${height}`);
}

function svgPointFromEvent(event) {
  if (!currentSvg) return null;
  const point = currentSvg.createSVGPoint();
  point.x = event.clientX;
  point.y = event.clientY;
  return point.matrixTransform(currentSvg.getScreenCTM().inverse());
}

export function zoomTree(factor, event) {
  if (!currentSvg) return;

  const oldScale = currentZoom.scale;
  const nextScale = clamp(oldScale * factor, ZOOM_MIN, ZOOM_MAX);
  if (nextScale === oldScale) return;

  const focusPoint = event ? svgPointFromEvent(event) : { x: currentCanvas.width / 2, y: currentCanvas.height / 2 };
  if (!focusPoint) return;

  const oldWidth = currentCanvas.width / oldScale;
  const oldHeight = currentCanvas.height / oldScale;
  const newWidth = currentCanvas.width / nextScale;
  const newHeight = currentCanvas.height / nextScale;

  currentZoom.x = focusPoint.x - ((focusPoint.x - currentZoom.x) * newWidth) / oldWidth;
  currentZoom.y = focusPoint.y - ((focusPoint.y - currentZoom.y) * newHeight) / oldHeight;
  currentZoom.scale = nextScale;

  updateSvgViewBox();
}

export function resetZoom() {
  currentZoom = {
    x: 0,
    y: 0,
    scale: 1,
  };
  updateSvgViewBox();
}

function calculateCanvasSize(layout) {
  const maxX = Math.max(...layout.map((node) => node.x + 240), DEFAULT_CANVAS_WIDTH);
  const maxY = Math.max(...layout.map((node) => node.y + 150), DEFAULT_CANVAS_HEIGHT);
  return {
    width: Math.max(DEFAULT_CANVAS_WIDTH, maxX),
    height: Math.max(DEFAULT_CANVAS_HEIGHT, maxY),
  };
}

export function renderTree(people, { onNodeClick, onPathClick } = {}) {
  const container = document.getElementById("tree-area");
  if (!container) return;

  container.querySelectorAll("svg.tree-svg").forEach((existingSvg) => existingSvg.remove());
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("width", "100%");
  svg.setAttribute("height", "100%");
  svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
  svg.classList.add("tree-svg");

  const layout = computeTreeLayout(people);
  const nodes = {};
  layout.forEach((node) => {
    nodes[node.id] = node;
  });

  currentCanvas = calculateCanvasSize(layout);
  currentSvg = svg;
  updateSvgViewBox();

  const contentGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
  contentGroup.classList.add("tree-content");

  people.forEach((person) => {
    const node = nodes[person.id];
    if (!node) return;

    const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
    group.setAttribute("transform", `translate(${node.x}, ${node.y})`);
    group.dataset.nodeId = person.id;
    group.dataset.x = node.x;
    group.dataset.y = node.y;
    group.style.cursor = "move";

    const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    rect.setAttribute("width", "220");
    rect.setAttribute("height", "110");
    rect.setAttribute("rx", "16");
    rect.setAttribute("fill", "#fff");
    rect.setAttribute("stroke", "#cbd5e1");
    rect.setAttribute("stroke-width", "1.5");

    const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
    text.setAttribute("x", "14");
    text.setAttribute("y", "28");
    text.setAttribute("fill", "#111827");
    text.setAttribute("font-size", "16");

    const titleLine = document.createElementNS("http://www.w3.org/2000/svg", "tspan");
    titleLine.setAttribute("x", "14");
    titleLine.setAttribute("dy", "0");
    titleLine.textContent = person.name;

    const birthLine = document.createElementNS("http://www.w3.org/2000/svg", "tspan");
    birthLine.setAttribute("x", "14");
    birthLine.setAttribute("dy", "26");
    birthLine.setAttribute("font-size", "13");
    birthLine.setAttribute("fill", "#4b5563");
    birthLine.textContent = person.birth ? `Born: ${person.birth}` : "Born: unknown";

    const lifeLine = document.createElementNS("http://www.w3.org/2000/svg", "tspan");
    lifeLine.setAttribute("x", "14");
    lifeLine.setAttribute("dy", "20");
    lifeLine.setAttribute("font-size", "13");
    lifeLine.setAttribute("fill", "#4b5563");
    lifeLine.textContent = person.death ? `Died: ${person.death}` : "Present";

    text.appendChild(titleLine);
    text.appendChild(birthLine);
    text.appendChild(lifeLine);

    const copyButton = document.createElementNS("http://www.w3.org/2000/svg", "g");
    copyButton.setAttribute("transform", "translate(164, 12)");
    copyButton.style.cursor = "pointer";

    const copyRect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    copyRect.setAttribute("width", "42");
    copyRect.setAttribute("height", "24");
    copyRect.setAttribute("rx", "12");
    copyRect.setAttribute("fill", "#e2e8f0");
    copyRect.setAttribute("stroke", "#94a3b8");
    copyRect.setAttribute("stroke-width", "1");

    const copyText = document.createElementNS("http://www.w3.org/2000/svg", "text");
    copyText.setAttribute("x", "21");
    copyText.setAttribute("y", "17");
    copyText.setAttribute("font-size", "10");
    copyText.setAttribute("fill", "#1f2937");
    copyText.setAttribute("text-anchor", "middle");
    copyText.textContent = "Copy";

    copyButton.appendChild(copyRect);
    copyButton.appendChild(copyText);
    copyButton.addEventListener("click", (event) => {
      event.stopPropagation();
      navigator.clipboard.writeText(person.name).catch(() => {
        console.warn(`Copy failed for ${person.name}`);
      });
    });

    group.addEventListener("click", (event) => {
      event.stopPropagation();
      if (typeof onNodeClick === "function") {
        onNodeClick(person.id, group);
      }
    });

    group.appendChild(rect);
    group.appendChild(text);
    group.appendChild(copyButton);
    contentGroup.appendChild(group);
  });

  people.forEach((person) => {
    person.children.forEach((childId) => {
      const source = nodes[person.id];
      const target = nodes[childId];
      if (!source || !target) return;

      const visiblePath = document.createElementNS("http://www.w3.org/2000/svg", "path");
      visiblePath.dataset.source = person.id;
      visiblePath.dataset.target = childId;
      visiblePath.setAttribute(
        "d",
        routeConnection({ x: source.x + 110, y: source.y + 110 }, { x: target.x + 110, y: target.y })
      );
      visiblePath.setAttribute("stroke", "#64748b");
      visiblePath.setAttribute("stroke-width", "1.4");
      visiblePath.setAttribute("fill", "none");
      visiblePath.setAttribute("stroke-linecap", "round");
      visiblePath.style.pointerEvents = "none";

      const hitPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
      hitPath.dataset.source = person.id;
      hitPath.dataset.target = childId;
      hitPath.classList.add("line-hit");
      hitPath.setAttribute(
        "d",
        routeConnection({ x: source.x + 110, y: source.y + 110 }, { x: target.x + 110, y: target.y })
      );
      hitPath.setAttribute("stroke", "transparent");
      hitPath.setAttribute("stroke-width", "18");
      hitPath.setAttribute("fill", "none");
      hitPath.style.cursor = "pointer";
      hitPath.style.pointerEvents = "stroke";

      hitPath.addEventListener("click", (event) => {
        event.stopPropagation();
        if (typeof onPathClick === "function") {
          onPathClick(person.id, childId, hitPath);
        }
      });

      const title = document.createElementNS("http://www.w3.org/2000/svg", "title");
      title.textContent = `${person.name} → ${childId}`;
      hitPath.appendChild(title);

      svg.appendChild(visiblePath);
      svg.appendChild(hitPath);
    });
  });

  svg.appendChild(contentGroup);

  let panStart = null;

  function onPanMove(event) {
    if (!panStart) return;
    const current = svgPointFromEvent(event);
    if (!current) return;

    currentZoom.x = panStart.view.x - (current.x - panStart.start.x);
    currentZoom.y = panStart.view.y - (current.y - panStart.start.y);
    updateSvgViewBox();
  }

  function onPanEnd(event) {
    if (!panStart) return;
    panStart = null;
    svg.releasePointerCapture(event.pointerId);
    window.removeEventListener("pointermove", onPanMove);
    window.removeEventListener("pointerup", onPanEnd);
  }

  svg.addEventListener("pointerdown", (event) => {
    if (event.button !== 0) return;
    if (event.target.closest("g[data-node-id]") || event.target.closest("path")) return;
    event.preventDefault();

    const start = svgPointFromEvent(event);
    if (!start) return;

    panStart = {
      start,
      view: { x: currentZoom.x, y: currentZoom.y },
    };

    svg.setPointerCapture(event.pointerId);
    window.addEventListener("pointermove", onPanMove);
    window.addEventListener("pointerup", onPanEnd);
  });

  svg.addEventListener("contextmenu", (event) => {
    event.preventDefault();
  });

  svg.addEventListener(
    "wheel",
    (event) => {
      event.preventDefault();
      const factor = event.deltaY < 0 ? 1.1 : 0.9;
      zoomTree(factor, event);
    },
    { passive: false }
  );

  let panStart = null;

  function onPanMove(event) {
    if (!panStart) return;
    const current = svgPointFromEvent(event);
    if (!current) return;

    currentZoom.x = panStart.view.x - (current.x - panStart.start.x);
    currentZoom.y = panStart.view.y - (current.y - panStart.start.y);
    updateSvgViewBox();
  }

  function onPanEnd(event) {
    if (!panStart) return;
    panStart = null;
    svg.releasePointerCapture(event.pointerId);
    window.removeEventListener("pointermove", onPanMove);
    window.removeEventListener("pointerup", onPanEnd);
  }

  svg.addEventListener("pointerdown", (event) => {
    if (event.button !== 0) return;
    if (event.target.closest("g[data-node-id]") || event.target.closest("path")) return;
    event.preventDefault();

    const start = svgPointFromEvent(event);
    if (!start) return;

    panStart = {
      start,
      view: { x: currentZoom.x, y: currentZoom.y },
    };

    svg.setPointerCapture(event.pointerId);
    window.addEventListener("pointermove", onPanMove);
    window.addEventListener("pointerup", onPanEnd);
  });

  svg.addEventListener("contextmenu", (event) => {
    event.preventDefault();
  });

  svg.addEventListener("dblclick", () => {
    resetZoom();
  });

  container.appendChild(svg);
}
