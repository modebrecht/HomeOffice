(() => {
  const MAIN_KEY = 'andrin-homeoffice:v2';
  const HISTORY_KEY = 'homeoffice:history:v1';
  const MAX_ENTRIES = 180;

  const esc = value => String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');

  function readJson(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  }

  function readMain() {
    const value = readJson(MAIN_KEY, {});
    return value && typeof value === 'object' ? value : {};
  }

  function readHistory() {
    const value = readJson(HISTORY_KEY, []);
    return Array.isArray(value) ? value : [];
  }

  function saveHistory(history) {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, MAX_ENTRIES)));
  }

  function cloneFeedback(feedback) {
    const source = feedback && typeof feedback === 'object' ? feedback : {};
    return {
      feelings: Array.isArray(source.feelings) ? [...source.feelings] : [],
      feelingText: String(source.feelingText || ''),
      goodText: String(source.goodText || ''),
      hardText: String(source.hardText || ''),
      nextText: String(source.nextText || '')
    };
  }

  function cloneCompleted(completed) {
    if (!Array.isArray(completed)) return [];
    return completed.map(item => ({
      id: item?.id ?? null,
      title: String(item?.title || 'Task'),
      icon: String(item?.icon || '✓'),
      type: item?.type === 'light' ? 'light' : 'focus',
      durationMs: Math.max(0, Number(item?.durationMs) || 0),
      xp: Math.max(0, Number(item?.xp) || 0),
      completedAt: Number(item?.completedAt) || null
    }));
  }

  function makeSnapshot(main) {
    const startedAt = Number(main.startedAt) || 0;
    const endedAt = Number(main.endedAt) || 0;
    if (!startedAt || !endedAt || endedAt < startedAt) return null;

    return {
      id: `session-${startedAt}`,
      startedAt,
      endedAt,
      durationMs: endedAt - startedAt,
      dayXp: Math.max(0, Number(main.dayXp) || 0),
      completed: cloneCompleted(main.completed),
      feedback: cloneFeedback(main.feedback),
      savedAt: Date.now()
    };
  }

  function upsertCurrentSession() {
    const snapshot = makeSnapshot(readMain());
    if (!snapshot) return false;

    const history = readHistory();
    const existingIndex = history.findIndex(item => item?.id === snapshot.id || Number(item?.startedAt) === snapshot.startedAt);
    if (existingIndex >= 0) history[existingIndex] = snapshot;
    else history.unshift(snapshot);

    history.sort((a, b) => (Number(b?.endedAt) || 0) - (Number(a?.endedAt) || 0));
    saveHistory(history);
    render();
    return true;
  }

  function fmtDate(value) {
    if (!value) return '–';
    return new Date(value).toLocaleDateString('de-CH', {
      weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric'
    });
  }

  function fmtClock(value) {
    if (!value) return '–';
    return new Date(value).toLocaleTimeString('de-CH', { hour: '2-digit', minute: '2-digit' });
  }

  function fmtDuration(ms) {
    const total = Math.max(0, Math.round((Number(ms) || 0) / 60000));
    const h = Math.floor(total / 60);
    const m = total % 60;
    if (!h) return `${m} Min.`;
    return m ? `${h} h ${m} Min.` : `${h} h`;
  }

  function renderNotes(feedback) {
    const rows = [
      ['Notiz', feedback.feelingText],
      ['Gut', feedback.goodText],
      ['Schwierig', feedback.hardText],
      ['Nächstes Mal', feedback.nextText]
    ].filter(([, value]) => String(value || '').trim());

    if (!rows.length) return '';
    return `<div class="archive-notes">${rows.map(([label, value]) => `
      <div class="archive-note"><span>${esc(label)}</span><p>${esc(value)}</p></div>
    `).join('')}</div>`;
  }

  function renderTasks(tasks) {
    if (!tasks.length) return '<div class="archive-empty">Keine Tasks</div>';
    return `<div class="archive-tasks">${tasks.map(task => `
      <div class="archive-task">
        <span>${esc(task.icon)} ${esc(task.title)}</span>
        <small>${fmtDuration(task.durationMs)} · +${task.xp} XP</small>
      </div>
    `).join('')}</div>`;
  }

  function renderFeelings(feelings) {
    if (!feelings.length) return '';
    return `<div class="archive-feelings">${feelings.map(item => `<span>${esc(item)}</span>`).join('')}</div>`;
  }

  function ensureUi() {
    if (document.getElementById('sessionArchiveCard')) return;
    const side = document.querySelector('.side');
    if (!side) return;

    const card = document.createElement('section');
    card.className = 'card archive-card';
    card.id = 'sessionArchiveCard';
    card.innerHTML = `
      <details class="panel-details archive-details" id="sessionArchiveDetails">
        <summary class="panel-summary">
          <span class="summary-copy"><strong>📚 Verlauf</strong><small id="sessionArchiveCount">0 Tage</small></span>
          <span class="summary-chevron" aria-hidden="true">⌄</span>
        </summary>
        <div class="panel-details-body archive-body" id="sessionArchiveBody"></div>
      </details>`;
    side.appendChild(card);

    const style = document.createElement('style');
    style.id = 'sessionArchiveStyles';
    style.textContent = `
      .archive-card{min-width:0;grid-column:1/-1!important;background:linear-gradient(180deg,rgba(112,225,200,.055),rgba(255,255,255,.04))!important}
      .archive-body{display:grid;gap:8px;max-height:min(62vh,620px);overflow:auto;padding-right:2px}
      .archive-day{border:1px solid rgba(255,255,255,.085);border-radius:13px;background:rgba(255,255,255,.035);overflow:hidden}
      .archive-day>summary{list-style:none;display:flex;align-items:center;justify-content:space-between;gap:8px;padding:10px 11px;cursor:pointer}
      .archive-day>summary::-webkit-details-marker{display:none}
      .archive-day-title{min-width:0;display:flex;flex-direction:column;gap:2px}
      .archive-day-title strong{font-size:.79rem;line-height:1.2}
      .archive-day-title small{font-size:.65rem;color:var(--muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      .archive-day-xp{flex:0 0 auto;font-size:.72rem;color:#ffe0ad;font-weight:900}
      .archive-day-content{padding:0 11px 11px;border-top:1px solid rgba(255,255,255,.07)}
      .archive-session-meta{display:grid;grid-template-columns:repeat(3,1fr);gap:5px;padding:9px 0}
      .archive-session-meta div{padding:7px;border-radius:9px;background:rgba(255,255,255,.045);min-width:0}
      .archive-session-meta span{display:block;font-size:.57rem;color:var(--muted);text-transform:uppercase;letter-spacing:.06em}
      .archive-session-meta strong{display:block;margin-top:2px;font-size:.72rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      .archive-tasks{display:grid;gap:4px;margin-top:2px}
      .archive-task{display:flex;justify-content:space-between;align-items:center;gap:8px;padding:6px 7px;border-radius:8px;background:rgba(255,255,255,.035)}
      .archive-task span{min-width:0;font-size:.7rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      .archive-task small{flex:0 0 auto;color:var(--muted);font-size:.6rem}
      .archive-feelings{display:flex;gap:4px;flex-wrap:wrap;margin-top:8px}
      .archive-feelings span{padding:4px 6px;border-radius:999px;background:rgba(142,162,255,.09);border:1px solid rgba(142,162,255,.14);font-size:.62rem}
      .archive-notes{display:grid;gap:6px;margin-top:8px}
      .archive-note{padding:7px 8px;border-radius:9px;background:rgba(255,255,255,.035)}
      .archive-note span{display:block;font-size:.58rem;font-weight:850;color:var(--muted);text-transform:uppercase;letter-spacing:.055em;margin-bottom:3px}
      .archive-note p{margin:0;font-size:.7rem;line-height:1.4;white-space:pre-wrap;overflow-wrap:anywhere}
      .archive-empty{padding:12px 4px;color:var(--muted);font-size:.72rem;text-align:center}
      @media(max-width:860px){.archive-card{order:8;width:100%}}
      @media(max-width:450px){
        .archive-session-meta{gap:4px}.archive-session-meta div{padding:6px}
        .archive-task{align-items:flex-start;flex-direction:column;gap:2px}
      }
    `;
    document.head.appendChild(style);
  }

  function render() {
    ensureUi();
    const body = document.getElementById('sessionArchiveBody');
    const count = document.getElementById('sessionArchiveCount');
    if (!body || !count) return;

    const history = readHistory();
    count.textContent = `${history.length} ${history.length === 1 ? 'Tag' : 'Tage'}`;

    if (!history.length) {
      body.innerHTML = '<div class="archive-empty">Noch kein abgeschlossener Homeoffice-Tag.</div>';
      return;
    }

    body.innerHTML = history.map((session, index) => {
      const completed = Array.isArray(session.completed) ? session.completed : [];
      const feedback = cloneFeedback(session.feedback);
      return `
        <details class="archive-day" ${index === 0 ? 'open' : ''}>
          <summary>
            <span class="archive-day-title">
              <strong>${esc(fmtDate(session.startedAt))}</strong>
              <small>${fmtClock(session.startedAt)}–${fmtClock(session.endedAt)} · ${fmtDuration(session.durationMs)} · ${completed.length} Tasks</small>
            </span>
            <span class="archive-day-xp">+${Math.max(0, Number(session.dayXp) || 0)} XP</span>
          </summary>
          <div class="archive-day-content">
            <div class="archive-session-meta">
              <div><span>Start</span><strong>${fmtClock(session.startedAt)}</strong></div>
              <div><span>Ende</span><strong>${fmtClock(session.endedAt)}</strong></div>
              <div><span>Dauer</span><strong>${fmtDuration(session.durationMs)}</strong></div>
            </div>
            ${renderTasks(completed)}
            ${renderFeelings(feedback.feelings)}
            ${renderNotes(feedback)}
          </div>
        </details>`;
    }).join('');
  }

  function scheduleArchive() {
    window.setTimeout(upsertCurrentSession, 0);
  }

  ensureUi();
  upsertCurrentSession();
  render();

  document.getElementById('finishBtn')?.addEventListener('click', scheduleArchive);
  document.getElementById('resetBtn')?.addEventListener('click', upsertCurrentSession, true);

  ['feelingText', 'goodText', 'hardText', 'nextText'].forEach(id => {
    document.getElementById(id)?.addEventListener('input', scheduleArchive);
  });

  document.getElementById('feelings')?.addEventListener('click', scheduleArchive);
  window.addEventListener('pagehide', upsertCurrentSession);
  window.addEventListener('storage', event => {
    if (event.key === HISTORY_KEY) render();
  });
})();