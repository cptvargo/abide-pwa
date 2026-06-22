import Dexie from "dexie";

const db = new Dexie("abide_cache");
db.version(1).stores({ results: "key, savedAt" });

export function cacheKey(q, translation, namespace = "") {
  const prefix = namespace ? `${namespace}:` : "";
  return `${prefix}${translation.toLowerCase()}:${q.toLowerCase().trim()}`;
}

export async function getSeekCached(q, translation, namespace = "") {
  try {
    const entry = await db.results.get(cacheKey(q, translation, namespace));
    return entry?.data ?? null;
  } catch {
    return null;
  }
}

export async function setSeekCached(q, translation, data, namespace = "") {
  try {
    await db.results.put({ key: cacheKey(q, translation, namespace), savedAt: Date.now(), data });
    const count = await db.results.count();
    if (count > 200) {
      const oldestKeys = await db.results.orderBy("savedAt").limit(count - 200).primaryKeys();
      await db.results.bulkDelete(oldestKeys);
    }
  } catch { /* ignore — cache miss is fine */ }
}

export async function clearSeekCache() {
  try {
    await db.results.clear();
  } catch { /* ignore */ }
}
