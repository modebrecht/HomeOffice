(() => {
  const MAIN_KEY = 'andrin-homeoffice:v2';
  const SIDE_KEY = 'andrin-homeoffice:sidequests:v1';
  const HISTORY_KEY = 'homeoffice:history:v1';
  const FIRST_NAME_KEY = 'homeoffice:first-name:v1';

  let rangeFilter = '30';
  let searchTerm = '';

  const $ = id => document.getElementById(id);
  const readJson = (key, fallback) => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  };

  const readMain = () => readJson(MAIN_KEY, {});
  const readSide = () => readJson(SIDE_KEY, {});
  const readHistory = () => {
    const value = readJson(HISTORY_KEY, []);
    return Array.isArray(value) ? value : [];
  };

  function fmtDuration(ms) {
    const minutes = Math.max(0, Math.round((Number(ms) || 0) / 60000));
    if (minutes < 60) return `${minutes} Min.`;
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m ? `${h} h ${m} Min.` : `${h} h`;
  }

  function fmtDate(value) {
    if (!value) return '–';
    return new Date(value).toLocaleDateString('de-CH', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  function sideQuestDoneCount(side) {
    let count = 0;
    if (Number(side?.waterSteps) >= 5) count += 1;
    if (side?.medsTaken) count += 1;
    if (Array.isArray(side?.customSideQuests)) count += side.customSideQuests.filter(q => q?.done).length;
    return count;
  }

  function currentSession() {
    const main = readMain();
    const side = readSide();
    const startedAt = Number(main.startedAt) || 0;
    const endedAt = Number(main.endedAt) || 0;
    if (!startedAt || !endedAt) return null;
    const taskXp = Math.max(0, Number(main.dayXp) || 0);
    const sideQuestXp = Math.max(0, Number(side.dayXp) || 0);
    return {
      id: `session-${startedAt}`,
      startedAt,
      endedAt,
      durationMs: Math.max(0, endedAt - startedAt),
      completed: Array.isArray(main.completed) ? main.completed : [],
      feedback: main.feedback && typeof main.feedback === 'object' ? main.feedback : {},
      taskXp,
      sideQuestXp,
      dayXp: taskXp + sideQuestXp,
      sideQuestDone: sideQuestDoneCount(side)
    };
  }

  function selectedFeelings(feedback) {
    return Array.isArray(feedback?.feelings) ? feedback.feelings.filter(Boolean) : [];
  }

  function makeSummaryText(session, { current = false } = {}) {
    if (!session) return '';
    const firstName = (localStorage.getItem(FIRST_NAME_KEY) || '').trim();
    const heading = firstName ? `${firstName} Homeoffice` : 'Homeoffice';
    const tasks = Array.isArray(session.completed) ? session.completed : [];
    const feedback = session.feedback || {};
    const feelings = selectedFeelings(feedback);
    const lines = [
      `${heading} · ${fmtDate(session.endedAt || session.startedAt)}`,
      `⏱ ${fmtDuration(session.durationMs)} · ✅ ${tasks.length} Tasks · ⭐ ${Math.max(0, Number(session.dayXp) || 0)} XP`
    ];

    if (current && Number.isFinite(session.sideQuestDone)) {
      lines[1] += ` · 🎯 ${session.sideQuestDone} Nebenquests`;
    } else if (Number(session.sideQuestXp) > 0) {
      lines.push(`🎯 Nebenquests +${Number(session.sideQuestXp)} XP`);
    }

    if (tasks.length) lines.push(`Tasks: ${tasks.map(t => `${t.icon || '✓'} ${t.title || 'Task'}`).join(' · ')}`);
    if (feelings.length) lines.push(`Gefühl: ${feelings.join(' · ')}`);
    if (String(feedback.feelingText || '').trim()) lines.push(`Notiz: ${String(feedback.feelingText).trim()}`);
    if (String(feedback.goodText || '').trim()) lines.push(`Gut: ${String(feedback.goodText).trim()}`);
    if (String(feedback.hardText || '').trim()) lines.push(`Schwierig: ${String(feedback.hardText).trim()}`);
    if (String(feedback.nextText || '').trim()) lines.push(`Nächstes Mal: ${String(feedback.nextText).trim()}`);
    return lines.join('\n');
  }

  async function copyText(text, button) {
    if (!text) return;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const area = document.createElement('textarea');
        area.value = text;
        area.style.position = 'fixed';
        area.style.opacity = '0';
        document.body.appendChild(area);
        area.select();
        document.execCommand('copy');
        area.remove();
      }
      if (button) {
        const old = button.textContent;
        button.textContent = '✓ Kopiert';
        setTimeout(() => { if (button.isConnected) button.textContent = old; }, 1200);
      }
    } catch {
      window.alert('Kopieren nicht möglich.');
    }
  }

  function ensureFinalSummary() {
    const final = $('finalScreen');
    if (!final || $('p2FinalSummary')) return;
    const card = document.createElement('section');
    card.id = 'p2FinalSummary';
    card.className = 'p2-final-summary';
    const heading = final.querySelector('h2');
    heading?.insertAdjacentElement('afterend', card);
    document.body.classList.add('p2-summary-ready');

    card.addEventListener('click', event => {
      const button = event.target.closest('[data-copy-current-summary]');
      if (!button) return;
      copyText(makeSummaryText(currentSession(), { current: true }), button);
    });
  }

  function renderFinalSummary() {
    ensureFinalSummary();
    const card = $('p2FinalSummary');
    if (!card) return;
    const session = currentSession();
    if (!session) {
      card.innerHTML = '';
      card.hidden = true;
      return;
    }
    card.hidden = false;
    const feelings = selectedFeelings(session.feedback);
    const note = String(session.feedback?.feelingText || '').trim();
    card.innerHTML = `
      <div class="p2-summary-top">
        <div><span>Tagesabschluss</span><strong>${fmtDate(session.endedAt)}</strong></div>
        <button type="button" class="p2-copy-btn" data-copy-current-summary>⧉ Kopieren</button>
      </div>
      <div class="p2-summary-grid">
        <div class="p2-summary-metric"><span>Zeit</span><strong>${fmtDuration(session.durationMs)}</strong></div>
        <div class="p2-summary-metric"><span>Tasks</span><strong>${session.completed.length}</strong></div>
        <div class="p2-summary-metric"><span>XP</span><strong>+${session.dayXp}</strong></div>
        <div class="p2-summary-metric"><span>Nebenquests</span><strong>${session.sideQuestDone}</strong></div>
      </div>
      ${feelings.length ? `<div class="p2-summary-feelings">${feelings.map(item => `<span>${escapeHtml(item)}</span>`).join('')}</div>` : ''}
      ${note ? `<p class="p2-summary-note">${escapeHtml(note)}</p>` : ''}`;
  }

  function localDaySerial(value) {
    const d = value instanceof Date ? value : new Date(value);
    return Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 86400000);
  }

  function streakInfo(history) {
    const days = [...new Set(history.map(item => Number(item?.endedAt) || Number(item?.startedAt) || 0).filter(Boolean).map(localDaySerial))].sort((a, b) => b - a);
    if (!days.length) return { count: 0, active: false };
    let count = 1;
    for (let i = 1; i < days.length; i++) {
      if (days[i - 1] - days[i] === 1) count += 1;
      else break;
    }
    const today = localDaySerial(new Date());
    return { count, active: today - days[0] <= 1 };
  }

  function weekSessions(history) {
    const cutoff = Date.now() - 7 * 86400000;
    return history.filter(item => (Number(item?.endedAt) || 0) >= cutoff);
  }

  function maxBy(list, getter) {
    return list.reduce((best, item) => !best || getter(item) > getter(best) ? item : best, null);
  }

  function renderArchiveInsights() {
    const host = $('p2ArchiveInsights');
    if (!host) return;
    const history = readHistory();
    const streak = streakInfo(history);
    const week = weekSessions(history);
    const longest = maxBy(week, item => Number(item?.durationMs) || 0);
    const mostTasks = maxBy(week, item => Array.isArray(item?.completed) ? item.completed.length : 0);
    const mostXp = maxBy(week, item => Number(item?.dayXp) || 0);

    const streakText = !streak.count
      ? '🔥 Noch keine Serie'
      : streak.active
        ? `🔥 ${streak.count} ${streak.count === 1 ? 'Tag' : 'Tage'} in Folge`
        : `🔥 Letzte Serie: ${streak.count} ${streak.count === 1 ? 'Tag' : 'Tage'}`;

    host.innerHTML = `
      <div class="p2-streak"><strong>${streakText}</strong><small>abgeschlossene Tage</small></div>
      <div class="p2-best-grid">
        <div class="p2-best-item"><span>🏆 Längster · 7 Tage</span><strong>${longest ? fmtDuration(longest.durationMs) : '–'}</strong></div>
        <div class="p2-best-item"><span>✅ Meiste Tasks</span><strong>${mostTasks ? (Array.isArray(mostTasks.completed) ? mostTasks.completed.length : 0) : '–'}</strong></div>
        <div class="p2-best-item"><span>⭐ Höchste XP</span><strong>${mostXp ? `+${Math.max(0, Number(mostXp.dayXp) || 0)}` : '–'}</strong></div>
      </div>`;
  }

  function ensureArchiveEnhancements() {
    const body = document.querySelector('.archive-body');
    const stats = $('sessionArchiveStats');
    const days = $('sessionArchiveDays');
    if (!body || !stats || !days) return false;

    if (!$('p2ArchiveInsights')) {
      const insights = document.createElement('div');
      insights.id = 'p2ArchiveInsights';
      insights.className = 'p2-insights';
      stats.insertAdjacentElement('afterend', insights);
    }

    if (!$('p2HistoryControls')) {
      const controls = document.createElement('div');
      controls.id = 'p2HistoryControls';
      controls.className = 'p2-history-controls';
      controls.innerHTML = `
        <div class="p2-filter-row" role="group" aria-label="Verlauf filtern">
          <button type="button" class="p2-filter-btn" data-history-range="7">7 Tage</button>
          <button type="button" class="p2-filter-btn active" data-history-range="30">30 Tage</button>
          <button type="button" class="p2-filter-btn" data-history-range="all">Alle</button>
        </div>
        <div class="p2-search-row">
          <input id="p2HistorySearch" type="search" autocomplete="off" placeholder="Task oder Notiz suchen" aria-label="Verlauf durchsuchen" />
          <span class="p2-result-count" id="p2ResultCount">0</span>
        </div>
        <div class="p2-filter-empty" id="p2FilterEmpty">Keine Treffer</div>`;
      const backupTools = body.querySelector('.archive-tools');
      if (backupTools) backupTools.insertAdjacentElement('beforebegin', controls);
      else days.insertAdjacentElement('beforebegin', controls);

      controls.addEventListener('click', event => {
        const button = event.target.closest('[data-history-range]');
        if (!button) return;
        rangeFilter = button.dataset.historyRange || '30';
        controls.querySelectorAll('[data-history-range]').forEach(btn => btn.classList.toggle('active', btn === button));
        applyArchiveFilter();
      });
      $('p2HistorySearch')?.addEventListener('input', event => {
        searchTerm = String(event.target.value || '').trim().toLocaleLowerCase('de-CH');
        applyArchiveFilter();
      });
    }

    if (!days.dataset.p2Bound) {
      days.dataset.p2Bound = 'true';
      days.addEventListener('click', event => {
        const button = event.target.closest('[data-copy-session]');
        if (!button) return;
        const session = readHistory().find(item => String(item?.id || `session-${item?.startedAt}`) === button.dataset.copySession);
        if (session) copyText(makeSummaryText(session), button);
      });

      const observer = new MutationObserver(() => {
        decorateArchiveDays();
        renderArchiveInsights();
        applyArchiveFilter();
      });
      observer.observe(days, { childList: true });
    }

    renderArchiveInsights();
    decorateArchiveDays();
    applyArchiveFilter();
    return true;
  }

  function decorateArchiveDays() {
    const days = $('sessionArchiveDays');
    if (!days) return;
    const history = readHistory();
    const nodes = [...days.children].filter(node => node.classList?.contains('archive-day'));
    nodes.forEach((node, index) => {
      const session = history[index];
      if (!session) return;
      const id = String(session.id || `session-${session.startedAt}`);
      node.dataset.sessionId = id;
      const content = node.querySelector('.archive-day-content');
      if (!content || content.querySelector('[data-copy-session]')) return;
      const row = document.createElement('div');
      row.className = 'p2-archive-copy';
      row.innerHTML = `<button type="button" class="p2-copy-btn" data-copy-session="${escapeHtml(id)}">⧉ Kopieren</button>`;
      content.appendChild(row);
    });
  }

  function searchableSessionText(session) {
    const completed = Array.isArray(session?.completed) ? session.completed : [];
    const feedback = session?.feedback && typeof session.feedback === 'object' ? session.feedback : {};
    return [
      fmtDate(session?.endedAt || session?.startedAt),
      ...completed.flatMap(task => [task?.title, task?.icon]),
      ...(Array.isArray(feedback.feelings) ? feedback.feelings : []),
      feedback.feelingText, feedback.goodText, feedback.hardText, feedback.nextText
    ].filter(Boolean).join(' ').toLocaleLowerCase('de-CH');
  }

  function applyArchiveFilter() {
    const days = $('sessionArchiveDays');
    if (!days) return;
    const history = readHistory();
    const nodes = [...days.children].filter(node => node.classList?.contains('archive-day'));
    const cutoff = rangeFilter === 'all' ? 0 : Date.now() - Number(rangeFilter) * 86400000;
    let shown = 0;

    nodes.forEach((node, index) => {
      const session = history[index];
      if (!session) {
        node.hidden = true;
        return;
      }
      const inRange = !cutoff || (Number(session.endedAt) || Number(session.startedAt) || 0) >= cutoff;
      const matches = !searchTerm || searchableSessionText(session).includes(searchTerm);
      node.hidden = !(inRange && matches);
      if (!node.hidden) shown += 1;
    });

    const count = $('p2ResultCount');
    if (count) count.textContent = `${shown}/${history.length}`;
    $('p2FilterEmpty')?.classList.toggle('visible', shown === 0 && history.length > 0);
  }

  function escapeHtml(value) {
    return String(value ?? '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  ensureFinalSummary();
  renderFinalSummary();
  ensureArchiveEnhancements();

  const final = $('finalScreen');
  if (final) {
    const observer = new MutationObserver(() => {
      if (final.classList.contains('active')) setTimeout(renderFinalSummary, 0);
    });
    observer.observe(final, { attributes: true, attributeFilter: ['class'] });
  }

  document.addEventListener('click', event => {
    if (event.target.closest('#finishBtn,#completeTaskBtn,#feelings,.sidequest-sticky')) {
      setTimeout(() => {
        renderFinalSummary();
        ensureArchiveEnhancements();
      }, 0);
    }
  });
  ['feelingText', 'goodText', 'hardText', 'nextText'].forEach(id => $(id)?.addEventListener('input', () => setTimeout(renderFinalSummary, 0)));
  window.addEventListener('storage', event => {
    if ([MAIN_KEY, SIDE_KEY, HISTORY_KEY].includes(event.key)) {
      renderFinalSummary();
      ensureArchiveEnhancements();
    }
  });
})();
