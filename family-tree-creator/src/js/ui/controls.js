import { exportTree, importTree } from "../services/storageService.js";
import { toggleGrid } from "./gridOverlay.js";

export function initializeControls(appState) {
  const panel = document.getElementById("editor-panel");
  if (!panel) return;

  panel.innerHTML = `
    <div class="controls">
      <button id="auto-adjust">Auto-Adjust Layout</button>
      <button id="toggle-grid">Toggle Grid</button>
      <button id="save-json">Save JSON</button>
      <button id="load-json">Import JSON</button>
      <textarea id="json-input" placeholder="Paste tree JSON here"></textarea>
    </div>
  `;

  document.getElementById("auto-adjust")?.addEventListener("click", () => {
    window.location.reload();
  });

  document.getElementById("toggle-grid")?.addEventListener("click", () => {
    toggleGrid(true);
  });

  document.getElementById("save-json")?.addEventListener("click", () => {
    const json = exportTree(appState.people);
    console.log(json);
    alert("JSON exported to console.");
  });

  document.getElementById("load-json")?.addEventListener("click", () => {
    const input = document.getElementById("json-input");
    if (!input) return;
    try {
      const data = importTree(input.value);
      appState.people = data;
      window.location.reload();
    } catch (error) {
      alert(error.message);
    }
  });
};
