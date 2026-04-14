import { saveSession, restoreSession } from "../src/js/services/indexedDBService.js";

beforeEach(() => {
  window.localStorage.clear();
});

test("saveSession persists tree data", () => {
  const people = [{ id: "p1", name: "Alex" }];
  saveSession(people);
  expect(window.localStorage.getItem("family-tree-session")).toBeTruthy();
});

test("restoreSession returns saved data", () => {
  const people = [{ id: "p1", name: "Alex" }];
  window.localStorage.setItem("family-tree-session", JSON.stringify(people));
  expect(restoreSession()).toEqual(people);
});
