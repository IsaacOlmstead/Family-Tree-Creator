import { sampleTreeData } from "./data/sampleTreeData.js";
import { validatePerson } from "./services/validationService.js";
import { restoreSession, saveSession } from "./services/indexedDBService.js";
import { renderTree } from "./ui/treeRenderer.js";
import { initializeControls } from "./ui/controls.js";
import { setupGridOverlay } from "./ui/gridOverlay.js";
import { enableDragAndDrop } from "./ui/dragAndDrop.js";

const appState = {
  people: sampleTreeData,
};

async function init() {
  const restored = await restoreSession();
  if (Array.isArray(restored) && restored.length > 0) {
    appState.people = restored;
  }

  const invalid = appState.people.some((person) => !validatePerson(person));
  if (invalid) {
    console.warn("Some sample data does not pass validation.");
  }

  renderTree(appState.people);
  setupGridOverlay();
  initializeControls(appState);
  enableDragAndDrop((nodeId, x, y) => {
    const person = appState.people.find((entry) => entry.id === nodeId);
    if (!person) return;
    person.x = x;
    person.y = y;
    saveSession(appState.people);
  });

  window.addEventListener("beforeunload", () => saveSession(appState.people));
}

window.addEventListener("DOMContentLoaded", init);
