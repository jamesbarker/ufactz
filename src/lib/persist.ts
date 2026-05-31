/**
 * Ask the browser to keep our IndexedDB data durable (exempt from eviction
 * under storage pressure). Browsers grant this readily once a PWA is installed
 * or the site sees repeat use. Safe to call on every load — it's a no-op if
 * already granted or unsupported.
 */
export async function requestPersistentStorage(): Promise<void> {
  try {
    if (navigator.storage?.persist && navigator.storage.persisted) {
      const already = await navigator.storage.persisted()
      if (!already) await navigator.storage.persist()
    }
  } catch {
    /* not supported — best-effort storage still works */
  }
}

export interface StorageStatus {
  persistent: boolean
  usageKb: number
}

export async function getStorageStatus(): Promise<StorageStatus | null> {
  try {
    if (!navigator.storage?.estimate) return null
    const persistent = (await navigator.storage.persisted?.()) ?? false
    const { usage } = await navigator.storage.estimate()
    return { persistent, usageKb: Math.round((usage ?? 0) / 1024) }
  } catch {
    return null
  }
}
