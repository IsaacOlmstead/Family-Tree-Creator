const STORAGE_KEY = "family-tree-session";

export function saveSession(people) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(people));
  } catch (error) {
    console.warn("Failed to save session:", error);
  }
}

export function restoreSession() {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.warn("Failed to restore session:", error);
    return null;
  }
}
