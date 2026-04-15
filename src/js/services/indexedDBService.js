const DB_NAME = "treeCreatorDB";
const DB_VERSION = 1;
const STORE_NAME = "sessions";
const SESSION_KEY = "currentTree";

function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function waitForTransaction(tx) {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}

export async function saveSession(people) {
  try {
    const db = await openDatabase();
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    store.put(people, SESSION_KEY);
    await waitForTransaction(tx);
  } catch (error) {
    console.warn("Failed to save session:", error);
  }
}

export async function restoreSession() {
  try {
    const db = await openDatabase();
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);

    return await new Promise((resolve, reject) => {
      const request = store.get(SESSION_KEY);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.warn("Failed to restore session:", error);
    return null;
  }
}
