(() => {
  const MAIN_KEY = 'andrin-homeoffice:v2';
  const SIDE_KEY = 'andrin-homeoffice:sidequests:v1';
  const HISTORY_KEY = 'homeoffice:history:v1';
  const TOKEN_KEY = 'andrin-homeoffice:cloud-token:v1';
  const META_KEY = 'andrin-homeoffice:cloud-meta:v1';
  const TARGET_KEYS = new Set([MAIN_KEY, SIDE_KEY, HISTORY_KEY]);

  const nativeSetItem = Storage.prototype.setItem;
  let suppress = false;
  let pushTimer = null;
  let syncing = false;

  function getMeta() {
    try {
      return {
        localUpdatedAt: 0,
        remoteUpdatedAt: 0,
        ...JSON.parse(localStorage.getItem(META_KEY) || '{}')
      };
    } catch {
      return { localUpdatedAt: 0, remoteUpdatedAt: 0 };
    }
  }

  function saveMeta(meta) {
    nativeSetItem.call(localStorage, META_KEY, JSON.stringify(meta));
  }

  function getToken() {
    return localStorage.getItem(TOKEN_KEY) || '';
  }

  function snapshot() {
    return {
      main: localStorage.getItem(MAIN_KEY),
      sidequests: localStorage.getItem(SIDE_KEY),
      history: localStorage.getItem(HISTORY_KEY),
      clientUpdatedAt: getMeta().localUpdatedAt || Date.now()
    };
  }

  function ensureCloudButton() {
    if (document.getElementById('cloudSyncBtn')) return;
    const host = document.querySelector('.header-status');
    if (!host) return;

    const btn = document.createElement('button');
    btn.id = 'cloudSyncBtn';
    btn.type = 'button';
    btn.className = 'status';
    btn.style.cursor = 'pointer';
    btn.title = 'Cloud-Sync';
    btn.textContent = getToken() ? '☁️ Sync' : '☁️ Cloud aus';
    host.prepend(btn);
    btn.addEventListener('click', onCloudButton);
  }

  function setStatus(text) {
    const btn = document.getElementById('cloudSyncBtn');
    if (btn) btn.textContent = text;
  }

  function markLocalChange() {
    if (suppress) return;
    const meta = getMeta();
    meta.localUpdatedAt = Date.now();
    saveMeta(meta);
    schedulePush();
  }

  Storage.prototype.setItem = function patchedSetItem(key, value) {
    nativeSetItem.call(this, key, value);
    if (this === localStorage && TARGET_KEYS.has(key)) markLocalChange();
  };

  function schedulePush() {
    if (!getToken()) return;
    clearTimeout(pushTimer);
    pushTimer = setTimeout(() => pushLocal(), 900);
  }

  async function request(method, body) {
    const token = getToken();
    const response = await fetch('/api/state', {
      method,
      headers: {
        'Authorization': `Bearer ${token}`,
        ...(body ? { 'Content-Type': 'application/json' } : {})
      },
      body: body ? JSON.stringify(body) : undefined,
      cache: 'no-store'
    });

    let data = {};
    try { data = await response.json(); } catch {}
    return { response, data };
  }

  async function pushLocal() {
    if (!getToken() || syncing) return;
    syncing = true;
    setStatus('☁️ Speichert…');

    try {
      const { response, data } = await request('POST', snapshot());
      if (response.status === 401) {
        localStorage.removeItem(TOKEN_KEY);
        setStatus('☁️ Code nötig');
        return;
      }
      if (!response.ok) throw new Error(data.error || `HTTP ${response.status}`);

      const remoteMs = Date.parse(data.updatedAt) || Date.now();
      const meta = getMeta();
      meta.remoteUpdatedAt = remoteMs;
      meta.localUpdatedAt = Math.max(meta.localUpdatedAt || 0, remoteMs);
      saveMeta(meta);
      setStatus('☁️ Gesichert ✓');
    } catch (error) {
      console.warn('Cloud-Sync push failed:', error);
      setStatus('☁️ Offline');
    } finally {
      syncing = false;
    }
  }

  function applyRemote(payload, updatedAt) {
    if (!payload || typeof payload !== 'object') return;
    suppress = true;
    try {
      if (typeof payload.main === 'string') nativeSetItem.call(localStorage, MAIN_KEY, payload.main);
      if (typeof payload.sidequests === 'string') nativeSetItem.call(localStorage, SIDE_KEY, payload.sidequests);
      if (typeof payload.history === 'string') nativeSetItem.call(localStorage, HISTORY_KEY, payload.history);
      const remoteMs = Date.parse(updatedAt) || Date.now();
      saveMeta({ localUpdatedAt: remoteMs, remoteUpdatedAt: remoteMs });
    } finally {
      suppress = false;
    }
    location.reload();
  }

  async function syncNow() {
    if (!getToken() || syncing) return;
    syncing = true;
    setStatus('☁️ Sync…');

    try {
      const { response, data } = await request('GET');

      if (response.status === 401) {
        localStorage.removeItem(TOKEN_KEY);
        setStatus('☁️ Code nötig');
        return;
      }

      if (response.status === 404) {
        syncing = false;
        await pushLocal();
        return;
      }

      if (!response.ok) throw new Error(data.error || `HTTP ${response.status}`);

      const remoteMs = Date.parse(data.updatedAt) || 0;
      const meta = getMeta();
      const localMs = Number(meta.localUpdatedAt) || 0;

      if (remoteMs > localMs + 1000) {
        setStatus('☁️ Lädt…');
        applyRemote(data.data, data.updatedAt);
        return;
      }

      if (localMs > remoteMs + 1000) {
        syncing = false;
        await pushLocal();
        return;
      }

      meta.remoteUpdatedAt = remoteMs;
      if (!meta.localUpdatedAt) meta.localUpdatedAt = remoteMs;
      saveMeta(meta);
      setStatus('☁️ Aktuell ✓');
    } catch (error) {
      console.warn('Cloud-Sync pull failed:', error);
      setStatus('☁️ Offline');
    } finally {
      syncing = false;
    }
  }

  function onCloudButton() {
    if (!getToken()) {
      const token = window.prompt('Cloud-Sync Code eingeben:');
      if (!token || !token.trim()) return;
      nativeSetItem.call(localStorage, TOKEN_KEY, token.trim());
      const meta = getMeta();
      if (!meta.localUpdatedAt) meta.localUpdatedAt = Date.now();
      saveMeta(meta);
      syncNow();
      return;
    }
    syncNow();
  }

  ensureCloudButton();
  if (getToken()) syncNow();
})();