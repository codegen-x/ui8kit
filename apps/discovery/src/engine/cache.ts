// IndexedDB cache of snapshots, keyed by content address (hash of the serialised screen + CSS + theme + size), so a reload
// or a theme switch back costs a lookup instead of a rasterisation. Any failure (private mode, quota) just means no cache.
const DB = "discovery-snapshots";
const STORE = "shots";
let dbp: Promise<IDBDatabase | null> | null = null;

function open(): Promise<IDBDatabase | null> {
  if (dbp) return dbp;
  dbp = new Promise((resolve) => {
    try {
      const req = indexedDB.open(DB, 1);
      req.onupgradeneeded = () => req.result.createObjectStore(STORE);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(null);
    } catch { resolve(null); }
  });
  return dbp;
}

export async function getShot(key: string): Promise<Blob | null> {
  const db = await open();
  if (!db) return null;
  return new Promise((resolve) => {
    try {
      const req = db.transaction(STORE, "readonly").objectStore(STORE).get(key);
      req.onsuccess = () => resolve((req.result as Blob | undefined) ?? null);
      req.onerror = () => resolve(null);
    } catch { resolve(null); }
  });
}

export async function putShot(key: string, blob: Blob): Promise<void> {
  const db = await open();
  if (!db) return;
  try { db.transaction(STORE, "readwrite").objectStore(STORE).put(blob, key); } catch { /* quota or closed: skip */ }
}
