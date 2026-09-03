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
  let pendingRemote = null;

  function getMeta() {
    try {
      return {
        localUpdatedAt: 0,
        remoteUpdatedAt: 0,
        lastSyncAt: 0,
        conflict: false,
        ...JSON.parse(localStorage.getItem(META_KEY) || '{}')
      };
    } catch {
      return { localUpdatedAt: 0, remoteUpdatedAt: 0, lastSyncAt: 0, conflict: false };
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

  function fmtSyncTime(value) {
    if (!value) return '';
    const d = new Date(value);
    return d.toLocaleString('de-CH', {
      day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
    });
  }

  function ensureCloudButton() {
    if (document.getElementById('cloudSyncBtn')) return;
    const host = document.querySelector('.header-status');
    if (!host) return;

    const wrap = document.createElement('div');
    wrap.className = 'cloud-sync-wrap';
    wrap.innerHTML = `
      <button id="cloudSyncBtn" type="button" class="status cloud-sync-btn">☁️</button>
      <small id="cloudSyncMeta"></small>`;
    host.prepend(wrap);

    if (!document.getElementById('cloudSyncStyles')) {
      const style = document.createElement('style');
      style.id = 'cloudSyncStyles';
      style.textContent = `
        .cloud-sync-wrap{display:flex;flex-direction:column;align-items:center;gap:2px;min-width:72px}
        .cloud-sync-btn{cursor:pointer;min-height:30px!important;padding:5px 9px!important;font-size:.68rem!important;white-space:nowrap}
        #cloudSyncMeta{max-width:112px;color:var(--muted);font-size:.52rem;line-height:1.1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
        @media(max-width:450px){.cloud-sync-wrap{min-width:58px}.cloud-sync-btn{padding:5px 7px!important}#cloudSyncMeta{max-width:76px;font-size:.48rem}}
      `;
      document.head.appendChild(style);
    }

    document.getElementById('cloudSyncBtn')?.addEventListener('click', onCloudButton);
    renderIdleStatus();
  }

  function setStatus(buttonText, metaText = '', title = '') {
    const btn = document.getElementById('cloudSyncBtn');
    const meta = document.getElementById('cloudSyncMeta');
    if (btn) {
      btn.textContent = buttonText;
      btn.title = title || metaText || 'Cloud-Sync';
    }
    if (meta) meta.textContent = metaText;
  }

  function renderIdleStatus() {
    if (!getToken()) {
      setStatus('☁️ Aus', 'Nicht verbunden', 'Cloud-Sync verbinden');
      return;
    }
    const meta = getMeta();
    if (meta.conflict) {
      setStatus('⚠️ Konflikt', 'Tippen zum Lösen', 'Cloud-Konflikt lösen');
      return;
    }
    if (meta.lastSyncAt) {
      setStatus('☁️ ✓', fmtSyncTime(meta.lastSyncAt), `Zuletzt gesichert: ${fmtSyncTime(meta.lastSyncAt)}`);
      return;
    }
    setStatus('☁️ Sync', 'Noch nie', 'Cloud-Sync starten');
  }

  function markLocalChange() {
    if (suppress) return;
    const meta = getMeta();
    meta.localUpdatedAt = Date.now();
    saveMeta(meta);
    if (getToken() && !meta.conflict) setStatus('☁️ •', 'Ungesichert', 'Lokale Änderungen noch nicht gesichert');
    schedulePush();
  }

  Storage.prototype.setItem = function patchedSetItem(key, value) {
    nativeSetItem.call(this, key, value);
    if (this === localStorage && TARGET_KEYS.has(key)) markLocalChange();
  };

  function schedulePush() {
    if (!getToken() || getMeta().conflict) return;
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
    setStatus('☁️ ↑', 'Speichert…');

    try {
      const { response, data } = await request('POST', snapshot());
      if (response.status === 401) {
        localStorage.removeItem(TOKEN_KEY);
        setStatus('☁️ Aus', 'Code ungültig');
        return;
      }
      if (!response.ok) throw new Error(data.error || `HTTP ${response.status}`);

      const remoteMs = Date.parse(data.updatedAt) || Date.now();
      const now = Date.now();
      const meta = getMeta();
      meta.remoteUpdatedAt = remoteMs;
      meta.localUpdatedAt = remoteMs;
      meta.lastSyncAt = now;
      meta.conflict = false;
      saveMeta(meta);
      pendingRemote = null;
      setStatus('☁️ ✓', fmtSyncTime(now), `Zuletzt gesichert: ${fmtSyncTime(now)}`);
    } catch (error) {
      console.warn('Cloud-Sync push failed:', error);
      setStatus('☁️ Offline', 'Nicht gesichert', 'Cloud nicht erreichbar');
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
      saveMeta({
        localUpdatedAt: remoteMs,
        remoteUpdatedAt: remoteMs,
        lastSyncAt: Date.now(),
        conflict: false
      });
    } finally {
      suppress = false;
    }
    pendingRemote = null;
    location.reload();
  }

  function markConflict(remotePayload, updatedAt) {
    pendingRemote = { data: remotePayload, updatedAt };
    const meta = getMeta();
    meta.conflict = true;
    saveMeta(meta);
    setStatus('⚠️ Konflikt', 'Tippen zum Lösen', 'Lokal und Cloud wurden seit dem letzten Sync geändert');
  }

  async function resolveConflict() {
    if (!pendingRemote) {
      const meta = getMeta();
      meta.conflict = false;
      saveMeta(meta);
      await syncNow();
      return;
    }

    const keepLocal = window.confirm('Cloud-Konflikt. OK = lokale Daten behalten und hochladen. Abbrechen = Cloud-Version laden.');
    const meta = getMeta();
    meta.conflict = false;
    saveMeta(meta);
    if (keepLocal) await pushLocal();
    else applyRemote(pendingRemote.data, pendingRemote.updatedAt);
  }

  async function syncNow() {
    if (!getToken() || syncing) return;
    syncing = true;
    setStatus('☁️ ↕', 'Prüft…');

    try {
      const { response, data } = await request('GET');
      if (response.status === 401) {
        localStorage.removeItem(TOKEN_KEY);
        setStatus('☁️ Aus', 'Code ungültig');
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
      const previousRemote = Number(meta.remoteUpdatedAt) || 0;

      if (previousRemote > 0) {
        const localDirty = localMs > previousRemote + 1000;
        const remoteDirty = remoteMs > previousRemote + 1000;
        if (localDirty && remoteDirty) {
          markConflict(data.data, data.updatedAt);
          return;
        }
      }

      if (remoteMs > localMs + 1000) {
        setStatus('☁️ ↓', 'Lädt…');
        applyRemote(data.data, data.updatedAt);
        return;
      }

      if (localMs > remoteMs + 1000) {
        syncing = false;
        await pushLocal();
        return;
      }

      const now = Date.now();
      meta.remoteUpdatedAt = remoteMs;
      if (!meta.localUpdatedAt) meta.localUpdatedAt = remoteMs;
      meta.lastSyncAt = now;
      meta.conflict = false;
      saveMeta(meta);
      setStatus('☁️ ✓', fmtSyncTime(now), `Zuletzt geprüft: ${fmtSyncTime(now)}`);
    } catch (error) {
      console.warn('Cloud-Sync pull failed:', error);
      setStatus('☁️ Offline', 'Nicht erreichbar', 'Cloud nicht erreichbar');
    } finally {
      syncing = false;
    }
  }

  async function onCloudButton() {
    if (!getToken()) {
      const token = window.prompt('Cloud-Sync Code eingeben:');
      if (!token || !token.trim()) return;
      nativeSetItem.call(localStorage, TOKEN_KEY, token.trim());
      const meta = getMeta();
      if (!meta.localUpdatedAt) meta.localUpdatedAt = Date.now();
      saveMeta(meta);
      await syncNow();
      return;
    }

    if (getMeta().conflict) {
      await resolveConflict();
      return;
    }
    await syncNow();
  }

  ensureCloudButton();
  if (getToken()) syncNow();
})();