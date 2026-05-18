const DB_NAME = "biswasendpro_attachments";
const DB_VERSION = 1;
const STORE = "blobs";

interface StoredBlob {
  id: string;
  name: string;
  mimeType: string;
  blob: Blob;
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("IndexedDB indisponible"));
      return;
    }
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onerror = () => reject(req.error);
    req.onsuccess = () => resolve(req.result);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: "id" });
      }
    };
  });
}

export async function saveAttachmentBlob(
  id: string,
  file: File
): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.objectStore(STORE).put({
      id,
      name: file.name,
      mimeType: file.type,
      blob: file,
    } satisfies StoredBlob);
  });
}

export async function getAttachmentBlob(id: string): Promise<File | null> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readonly");
    const req = tx.objectStore(STORE).get(id);
    req.onsuccess = () => {
      const row = req.result as StoredBlob | undefined;
      if (!row?.blob) {
        resolve(null);
        return;
      }
      resolve(new File([row.blob], row.name, { type: row.mimeType }));
    };
    req.onerror = () => reject(req.error);
  });
}

export async function deleteAttachmentBlob(id: string): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.objectStore(STORE).delete(id);
  });
}

export async function deleteAttachmentBlobs(ids: string[]): Promise<void> {
  await Promise.all(ids.map(deleteAttachmentBlob));
}
