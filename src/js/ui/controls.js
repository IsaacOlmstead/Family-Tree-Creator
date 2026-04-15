import { createId } from "../utils/idUtils.js";
import { validatePerson } from "../services/validationService.js";
import { saveSession } from "../services/indexedDBService.js";
import { exportTree, importTree } from "../services/storageService.js";
import { toggleGrid } from "./gridOverlay.js";
import { renderTree, zoomTree, resetZoom } from "./treeRenderer.js";

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
      <div id="connection-controls" class="connection-controls">
        <h2>Connection Editor</h2>
        <div class="form-actions connection-actions">
          <button id="start-connect" type="button">Connect Nodes</button>
          <button id="start-disconnect" type="button">Disconnect Line</button>
          <button id="cancel-connection" type="button" class="hidden">Cancel</button>
        </div>
        <div id="connection-status" class="connection-status">
          Click "Connect Nodes" to select a parent and a child.
        </div>
      </div>
      <div id="zoom-controls" class="connection-controls">
        <h2>Zoom Controls</h2>
        <div class="form-actions connection-actions">
          <button id="zoom-in" type="button">Zoom In</button>
          <button id="zoom-out" type="button">Zoom Out</button>
          <button id="reset-zoom" type="button">Reset</button>
        </div>
        <div class="connection-status">
          Use mouse wheel over the tree to zoom.
        </div>
      </div>
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
          <div class="form-actions">
          <button id="submit-person" type="button">Add Person</button>
          <button id="cancel-person" type="button">Cancel</button>
        </div>
      </div>
    </div>
  `;

  let gridVisible = false;
  let connectionMode = null;
  let pendingParentId = null;
  let selectedNodeGroup = null;

  const connectButton = document.getElementById("start-connect");
  const disconnectButton = document.getElementById("start-disconnect");
  const cancelConnectionButton = document.getElementById("cancel-connection");
  const connectionStatus = document.getElementById("connection-status");
  const personForm = document.getElementById("person-form");
  const formFields = {
    name: document.getElementById("person-name"),
    birth: document.getElementById("person-birth"),
    death: document.getElementById("person-death"),
  };

  function updateStatus(message) {
    if (connectionStatus) {
      connectionStatus.textContent = message;
    }
  }

  function clearSelection() {
    if (selectedNodeGroup) {
      selectedNodeGroup.classList.remove("selected-node");
      selectedNodeGroup = null;
    }
    pendingParentId = null;
  }

  function setConnectionMode(mode) {
    connectionMode = mode;
    clearSelection();

    if (connectButton) {
      connectButton.classList.toggle("active", mode === "connect");
    }
    if (disconnectButton) {
      disconnectButton.classList.toggle("active", mode === "disconnect");
    }
    if (cancelConnectionButton) {
      cancelConnectionButton.classList.toggle("hidden", mode === null);
    }

    if (mode === "connect") {
      updateStatus("Select a parent node, then click a child node to connect them.");
    } else if (mode === "disconnect") {
      updateStatus("Click a line to disconnect it.");
    } else {
      updateStatus("Click Connect or Disconnect to manage lines manually.");
    }
  }

  function handleNodeClick(nodeId, group) {
    if (connectionMode !== "connect") return;

    if (!pendingParentId) {
      pendingParentId = nodeId;
      selectedNodeGroup = group;
      selectedNodeGroup.classList.add("selected-node");
      updateStatus(`Parent selected: ${nodeId}. Now click the child node.`);
      return;
    }

    if (pendingParentId === nodeId) {
      updateStatus("Please select a different child node.");
      return;
    }

    addConnection(pendingParentId, nodeId);
    setConnectionMode(null);
  }

  function handlePathClick(sourceId, targetId) {
    if (connectionMode !== "disconnect") return;
    removeConnection(sourceId, targetId);
    setConnectionMode(null);
  }

  function addConnection(sourceId, targetId) {
    const source = appState.people.find((person) => person.id === sourceId);
    const target = appState.people.find((person) => person.id === targetId);
    if (!source || !target) {
      updateStatus("Could not find selected people.");
      return;
    }
    if (sourceId === targetId) {
      updateStatus("Nodes must be different.");
      return;
    }

    if (!source.children.includes(targetId)) {
      source.children.push(targetId);
    }
    if (!target.parents.includes(sourceId)) {
      target.parents.push(sourceId);
    }

    saveSession(appState.people);
    renderTree(appState.people, { onNodeClick: handleNodeClick, onPathClick: handlePathClick });
    updateStatus(`Connected ${sourceId} → ${targetId}.`);
  }

  function removeConnection(sourceId, targetId) {
    const source = appState.people.find((person) => person.id === sourceId);
    const target = appState.people.find((person) => person.id === targetId);
    if (!source || !target) {
      updateStatus("Could not find selected connection.");
      return;
    }

    source.children = source.children.filter((childId) => childId !== targetId);
    target.parents = target.parents.filter((parentId) => parentId !== sourceId);

    saveSession(appState.people);
    renderTree(appState.people, { onNodeClick: handleNodeClick, onPathClick: handlePathClick });
    updateStatus(`Disconnected ${sourceId} → ${targetId}.`);
  }

  document.getElementById("auto-adjust")?.addEventListener("click", () => {
    appState.people.forEach((person) => {
      delete person.x;
      delete person.y;
    });
    renderTree(appState.people, { onNodeClick: handleNodeClick, onPathClick: handlePathClick });
    resetZoom();
    saveSession(appState.people);
    updateStatus("Auto-adjust layout complete.");
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
      renderTree(appState.people, { onNodeClick: handleNodeClick, onPathClick: handlePathClick });
      updateStatus("Tree imported successfully.");
    } catch (error) {
      alert(error.message);
    } finally {
      if (fileInput) fileInput.value = "";
    }
  });

  document.getElementById("add-person")?.addEventListener("click", () => {
    personForm?.classList.toggle("hidden");
  });

  document.getElementById("cancel-person")?.addEventListener("click", () => {
    personForm?.classList.add("hidden");
  });

  connectButton?.addEventListener("click", () => {
    setConnectionMode(connectionMode === "connect" ? null : "connect");
  });

  disconnectButton?.addEventListener("click", () => {
    setConnectionMode(connectionMode === "disconnect" ? null : "disconnect");
  });

  cancelConnectionButton?.addEventListener("click", () => {
    setConnectionMode(null);
  });

  document.getElementById("zoom-in")?.addEventListener("click", () => {
    zoomTree(1.2);
  });

  document.getElementById("zoom-out")?.addEventListener("click", () => {
    zoomTree(0.8);
  });

  document.getElementById("reset-zoom")?.addEventListener("click", () => {
    resetZoom();
  });

  document.getElementById("submit-person")?.addEventListener("click", () => {
    const name = formFields.name?.value.trim() ?? "";
    const birth = formFields.birth?.value ?? "";
    const death = formFields.death?.value ?? "";
    const newPerson = {
      id: createId(),
      name,
      birth,
      death,
      parents: [],
      children: [],
    };

    if (!validatePerson(newPerson)) {
      alert("Please provide a valid name and valid dates.");
      return;
    }

    appState.people.push(newPerson);
    saveSession(appState.people);
    renderTree(appState.people, { onNodeClick: handleNodeClick, onPathClick: handlePathClick });
    personForm?.classList.add("hidden");
    Object.values(formFields).forEach((field) => {
      if (field instanceof HTMLInputElement) field.value = "";
    });
    updateStatus("Person added successfully.");
  });

  renderTree(appState.people, { onNodeClick: handleNodeClick, onPathClick: handlePathClick });
}
