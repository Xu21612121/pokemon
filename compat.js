// Some file previews deny storage; allow play while clearly warning about persistence.
const memoryStorage = new Map();
const gameStorage = {
  getItem(key) {
    try { return window.localStorage.getItem(key); }
    catch { return memoryStorage.get(key) ?? null; }
  },
  setItem(key, value) {
    memoryStorage.set(key, value);
    try { window.localStorage.setItem(key, value); }
    catch { showStorageWarning(); }
  }
};
function showStorageWarning() {
  if (document.getElementById('storage-warning')) return;
  const warning = document.createElement('p');
  warning.id = 'storage-warning';
  warning.className = 'notice';
  warning.textContent = '当前浏览器禁止保存数据：进度仅保留在本次打开期间，请使用普通浏览器打开游戏并及时导出存档。';
  document.body.prepend(warning);
}
function cardId() {
  return globalThis.crypto?.randomUUID?.() ?? `card-${Date.now()}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`;
}
