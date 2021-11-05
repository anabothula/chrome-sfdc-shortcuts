export async function getFromStorage(storagekey) {
  const result = await chrome.storage.local.get(storagekey);
  const existingLinks = result[storagekey];

  return existingLinks ? JSON.parse(existingLinks) : [];
}

export function setToStorage(storagekey, links) {
  const x = {};
  x[storagekey] = JSON.stringify(links);
  chrome.storage.local.set(x);
}
