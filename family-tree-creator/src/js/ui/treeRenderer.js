import { computeTreeLayout, routeConnection } from "../services/treeLayoutService.js";

export function renderTree(people) {
  const container = document.getElementById("tree-area");
  if (!container) return;

  container.innerHTML = "";
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("width", "100%");
  svg.setAttribute("height", "100%");
  svg.classList.add("tree-svg");

  const layout = computeTreeLayout(people);
  const nodes = {};

  layout.forEach((node) => {
    nodes[node.id] = node;
  });

  people.forEach((person) => {
    const node = nodes[person.id];
    if (!node) return;
    const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
    group.setAttribute("transform", `translate(${node.x}, ${node.y})`);

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
    text.textContent = person.name;

    group.appendChild(rect);
    group.appendChild(text);
    svg.appendChild(group);
  });

  people.forEach((person) => {
    person.children.forEach((childId) => {
      const source = nodes[person.id];
      const target = nodes[childId];
      if (!source || !target) return;
      const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      path.setAttribute("d", routeConnection({ x: source.x + 110, y: source.y + 110 }, { x: target.x + 110, y: target.y }));
      path.setAttribute("stroke", "#64748b");
      path.setAttribute("stroke-width", "1.4");
      path.setAttribute("fill", "none");
      svg.appendChild(path);
    });
  });

  container.appendChild(svg);
}
