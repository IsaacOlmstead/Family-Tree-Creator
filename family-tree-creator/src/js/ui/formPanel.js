export function createFormPanel() {
  const panel = document.createElement("section");
  panel.className = "person-form";
  panel.innerHTML = `
    <h2>Edit Person</h2>
    <label>Name<input type="text" id="person-name" /></label>
    <label>Birth<input type="date" id="person-birth" /></label>
    <label>Death<input type="date" id="person-death" /></label>
    <button id="save-person">Save</button>
  `;
  return panel;
}
