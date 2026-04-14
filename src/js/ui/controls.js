import { createId } from "../utils/idUtils.js";
import { validatePerson } from "../services/validationService.js";
import { saveSession } from "../services/indexedDBService.js";
import { exportTree, importTree } from "../services/storageService.js";
import { toggleGrid } from "./gridOverlay.js";
import { renderTree } from "./treeRenderer.js";

export function initializeControls(appState) {
  const panel = document.getElementById("editor-panel");
  if (!panel) return;

  panel.innerHTML = `
    <div class="controls">
      <button id="auto-adjust">Auto-Adjust Layout</button>
      <button id="toggle-grid">Toggle Grid</button>
      <button id="export-json-file">Export JSON File</button>
      <button id="import-json-file">Import JSON File</button>
      <button id="add-person">Add New Person</button>
      <input id="json-file-input" type="file" accept=".json,application/json" hidden />
      <div id="person-form" class="person-form hidden">
        <h2>Add New Person</h2>
        <label>
          Name
          <input id="person-name" type="text" placeholder="Full name" required />
        </label>
        <label>
          Birth Date
          <input id="person-birth" type="date" />
        </label>
        <label>
          Death Date
          <input id="person-death" type="date" />
        </label>
        <label>
          Parent IDs (comma-separated)
          <input id="person-parents" type="text" placeholder="p1, p2" />
        </label>
        <label>
          Child IDs (comma-separated)
          <input id="person-children" type="text" placeholder="p3, p4" />
        </label>
        <div class="form-actions">
          <button id="submit-person" type="button">Add Person</button>
          <button id="cancel-person" type="button">Cancel</button>
        </div>
      </div>
    </div>
  `;

  let gridVisible = false;

  document.getElementById("auto-adjust")?.addEventListener("click", () => {
    window.location.reload();
  });

  document.getElementById("toggle-grid")?.addEventListener("click", () => {
    gridVisible = !gridVisible;
    toggleGrid(gridVisible);
  });

  document.getElementById("export-json-file")?.addEventListener("click", () => {
    const json = exportTree(appState.people);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `family-tree-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  });

  const fileInput = document.getElementById("json-file-input");
  document.getElementById("import-json-file")?.addEventListener("click", () => {
    fileInput?.click();
  });

  fileInput?.addEventListener("change", async () => {
    const file = fileInput.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const data = importTree(text);
      if (!Array.isArray(data)) {
        throw new Error("Imported JSON must be an array of people.");
      }
      const invalid = data.some((person) => !validatePerson(person));
      if (invalid) {
        throw new Error("Imported file contains invalid person data.");
      }
      appState.people = data;
      saveSession(appState.people);
      renderTree(appState.people);
      alert("Tree imported successfully.");
    } catch (error) {
      alert(error.message);
    } finally {
      if (fileInput) fileInput.value = "";
    }
  });

  const personForm = document.getElementById("person-form");
  const formFields = {
    name: document.getElementById("person-name"),
    birth: document.getElementById("person-birth"),
    death: document.getElementById("person-death"),
    parents: document.getElementById("person-parents"),
    children: document.getElementById("person-children"),
  };

  document.getElementById("add-person")?.addEventListener("click", () => {
    personForm?.classList.toggle("hidden");
  });

  document.getElementById("cancel-person")?.addEventListener("click", () => {
    personForm?.classList.add("hidden");
  });

  document.getElementById("submit-person")?.addEventListener("click", () => {
    const name = formFields.name?.value.trim() ?? "";
    const birth = formFields.birth?.value ?? "";
    const death = formFields.death?.value ?? "";
    const parents = (formFields.parents?.value ?? "")
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean);
    const children = (formFields.children?.value ?? "")
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean);

    const newPerson = {
      id: createId(),
      name,
      birth,
      death,
      parents,
      children,
    };

    if (!validatePerson(newPerson)) {
      alert("Please provide a valid name and valid dates.");
      return;
    }

    parents.forEach((parentId) => {
      const parent = appState.people.find((person) => person.id === parentId);
      if (parent && !parent.children.includes(newPerson.id)) {
        parent.children.push(newPerson.id);
      }
    });

    children.forEach((childId) => {
      const child = appState.people.find((person) => person.id === childId);
      if (child && !child.parents.includes(newPerson.id)) {
        child.parents.push(newPerson.id);
      }
    });

    appState.people.push(newPerson);
    saveSession(appState.people);
    renderTree(appState.people);
    personForm?.classList.add("hidden");
    Object.values(formFields).forEach((field) => {
      if (field instanceof HTMLInputElement) field.value = "";
    });
  });
}
