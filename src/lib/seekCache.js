import Dexie from "dexie";

const db = new Dexie("abide_cache");
db.version(1).stores({ results: "key, savedAt" });

export async function getSeekCached(q, translation) {
  try {
    const entry = await db.results.get(cacheKey(q, translation));
    return entry?.data ?? null;
  } catch {
    return null;
  }
}

export async function setSeekCached(q, translation, data) {
  try {
    await db.results.put({ key: cacheKey(q, translation), savedAt: Date.now(), data });
    const count = await db.results.count();
    if (count > 200) {
      const oldestKeys = await db.results.orderBy("savedAt").limit(count - 200).primaryKeys();
      await db.results.bulkDelete(oldestKeys);
    }
  } catch { /* ignore — cache miss is fine */ }
}

export function cacheKey(q, translation) {
  return `${translation.toLowerCase()}:${q.toLowerCase().trim()}`;
}
