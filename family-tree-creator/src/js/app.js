import { sampleTreeData } from "./data/sampleTreeData.js";
import { validatePerson } from "./services/validationService.js";
import { restoreSession, saveSession } from "./services/indexedDBService.js";
import { renderTree } from "./ui/treeRenderer.js";
import { initializeControls } from "./ui/controls.js";

const appState = {
  people: sampleTreeData,
};

function init() {
  const restored = restoreSession();
  if (restored) {
    appState.people = restored;
  }

  const invalid = appState.people.some((person) => !validatePerson(person));
  if (invalid) {
    console.warn("Some sample data does not pass validation.");
  }

  renderTree(appState.people);
  initializeControls(appState);
  window.addEventListener("beforeunload", () => saveSession(appState.people));
}

window.addEventListener("DOMContentLoaded", init);
