(() => {
  const STORAGE_KEY = "andrin-homeoffice:v2";
  const baseTasks = window.HOME_TASKS || [];

  const emptyFeedback = () => ({
    feelingText: "",
    goodText: "",
    hardText: "",
    nextText: "",
    feelings: []
  });

  const defaults = () => ({
    startedAt: null,
    endedAt: null,
    screen: "start",
    currentTaskId: null,
    taskStartedAt: null,
    taskFinishedToggle: false,
    lastCompletedType: null,
    completed: [],
    xpTotal: 0,
    dayXp: 0,
    customTasks: [],
    customDraft: {
      title: "",
      duration: "",
      type: "focus",
      repeatable: true
    },
    feedback: emptyFeedback()
  });

  let state = loadState();
  let rolling = false;
  let tickHandle = null;

  const $ = id => document.getElementById(id);
  const els = {
    startScreen: $("startScreen"),
    randomScreen: $("randomScreen"),
    finalScreen: $("finalScreen"),
    startBtn: $("startBtn"),
    rollBtn: $("rollBtn"),
    finishBtn: $("finishBtn"),
    resetBtn: $("resetBtn"),
    cube: $("cube"),
    cubeShadow: $("cubeShadow"),
    rollLabel: $("rollLabel"),
    dicePanel: $("dicePanel"),
    taskCard: $("taskCard"),
    taskIcon: $("taskIcon"),
    taskTitle: $("taskTitle"),
    taskTime: $("taskTime"),
    taskCategory: $("taskCategory"),
    taskBody: $("taskBody"),
    taskTimer: $("taskTimer"),
    taskXpPreview: $("taskXpPreview"),
    taskStartBtn: $("taskStartBtn"),
    taskFinishZone: $("taskFinishZone"),
    finishToggle: $("finishToggle"),
    finishToggleText: $("finishToggleText"),
    completeTaskBtn: $("completeTaskBtn"),
    timer: $("timer"),
    timerSub: $("timerSub"),
    statusPill: $("statusPill"),
    history: $("history"),
    weightText: $("weightText"),
    weightBar: $("weightBar"),
    bonusText: $("bonusText"),
    xpTotal: $("xpTotal"),
    dayXp: $("dayXp"),
    headerXp: $("headerXp"),
    finalStart: $("finalStart"),
    finalEnd: $("finalEnd"),
    finalDuration: $("finalDuration"),
    finalTasks: $("finalTasks"),
    finalXp: $("finalXp"),
    startTimePreview: $("startTimePreview"),
    feelingText: $("feelingText"),
    goodText: $("goodText"),
    hardText: $("hardText"),
    nextText: $("nextText"),
    feelings: $("feelings"),
    customTaskForm: $("customTaskForm"),
    customTitle: $("customTitle"),
    customDuration: $("customDuration"),
    customType: $("customType"),
    repeatHelp: $("repeatHelp"),
    customCount: $("customCount"),
    customTaskList: $("customTaskList")
  };

  function normalizeCustomTask(task) {
    return {
      id: String(task.id || `custom-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`),
      icon: task.icon || "🧩",
      title: String(task.title || "Custom Quest"),
      time: task.duration ? `${Number(task.duration)} Minuten` : "ohne Zeitvorgabe",
      duration: task.duration ? Number(task.duration) : null,
      type: task.type === "light" ? "light" : "focus",
      repeatable: task.repeatable !== false,
      custom: true,
      body: `<p>Deine eigene Quest.</p>${task.duration ? `<div class="hint">Geplante Dauer: ${Number(task.duration)} Minuten.</div>` : `<div class="hint">Keine feste Dauer. Entscheide selbst, wann die Aufgabe fertig ist.</div>`}`
    };
  }

  function allTasks() {
    return [...baseTasks, ...state.customTasks.map(normalizeCustomTask)];
  }

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return defaults();
      const parsed = JSON.parse(raw);
      const next = {
        ...defaults(),
        ...parsed,
        customTasks: Array.isArray(parsed.customTasks) ? parsed.customTasks : [],
        customDraft: { ...defaults().customDraft, ...(parsed.customDraft || {}) },
        feedback: { ...emptyFeedback(), ...(parsed.feedback || {}) }
      };
      const available = [...baseTasks, ...next.customTasks.map(normalizeCustomTask)];
      if (next.currentTaskId !== null && !available.some(t => String(t.id) === String(next.currentTaskId))) {
        next.currentTaskId = null;
        next.taskStartedAt = null;
        next.taskFinishedToggle = false;
      }
      return next;
    } catch {
      return defaults();
    }
  }

  function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function fmtClock(value) {
    if (!value) return "–";
    return new Date(value).toLocaleTimeString("de-CH", { hour: "2-digit", minute: "2-digit" });
  }

  function fmtDuration(ms) {
    const sec = Math.max(0, Math.floor(ms / 1000));
    const h = String(Math.floor(sec / 3600)).padStart(2, "0");
    const m = String(Math.floor((sec % 3600) / 60)).padStart(2, "0");
    const s = String(sec % 60).padStart(2, "0");
    return `${h}:${m}:${s}`;
  }

  function fmtShortDuration(ms) {
    const min = Math.max(1, Math.round(ms / 60000));
    if (min < 60) return `${min} Min.`;
    const h = Math.floor(min / 60);
    const rest = min % 60;
    return rest ? `${h} h ${rest} Min.` : `${h} h`;
  }

  function currentTask() {
    return allTasks().find(t => String(t.id) === String(state.currentTaskId)) || null;
  }

  function taskElapsed() {
    return state.taskStartedAt ? Date.now() - state.taskStartedAt : 0;
  }

  function xpForTask(task, elapsedMs) {
    if (!task) return 0;
    if (task.type === "light") return 10;
    const blocks = Math.max(1, Math.floor(elapsedMs / (30 * 60 * 1000)));
    return Math.min(50, blocks * 10);
  }

  function showScreen(name) {
    [els.startScreen, els.randomScreen, els.finalScreen].forEach(s => s.classList.remove("active"));
    const target = name === "final" ? els.finalScreen : name === "random" ? els.randomScreen : els.startScreen;
    target.classList.add("active");
    state.screen = name;
  }

  function currentLightBonus() {
    return state.lastCompletedType === "focus" ? 0.40 : 0;
  }

  function updateBalance() {
    const bonus = currentLightBonus();
    els.bonusText.textContent = bonus ? "+40 %" : "0 %";
    els.weightText.textContent = bonus
      ? "Der letzte erledigte Task war Arbeit / Creative. Lightweight wird beim nächsten Wurf um 40 % höher gewichtet."
      : "Normaler Mix aus Focus und Lightweight.";
    els.weightBar.style.width = bonus ? "72%" : "50%";
  }

  function updateXp() {
    els.xpTotal.textContent = `${state.xpTotal} XP`;
    els.headerXp.textContent = `${state.xpTotal} XP`;
    els.dayXp.textContent = `Heute: +${state.dayXp} XP`;
    els.finalXp.textContent = `${state.dayXp} XP`;
  }

  function updateHomeTimer() {
    if (!state.startedAt) {
      els.timer.textContent = "00:00:00";
      els.timerSub.textContent = "Noch nicht gestartet.";
      return;
    }
    const end = state.endedAt || Date.now();
    els.timer.textContent = fmtDuration(end - state.startedAt);
    els.timerSub.textContent = state.endedAt ? "Homeoffice beendet." : `Gestartet um ${fmtClock(state.startedAt)}`;
  }

  function updateTaskTimer() {
    const task = currentTask();
    if (!task || !state.taskStartedAt) {
      els.taskTimer.textContent = "00:00:00";
      els.taskXpPreview.textContent = task ? `+${xpForTask(task, 0)} XP` : "+10 XP";
      return;
    }
    const elapsed = taskElapsed();
    els.taskTimer.textContent = fmtDuration(elapsed);
    els.taskXpPreview.textContent = `+${xpForTask(task, elapsed)} XP`;
  }

  function tick() {
    updateHomeTimer();
    updateTaskTimer();
  }

  function startTicker() {
    clearInterval(tickHandle);
    tick();
    tickHandle = setInterval(tick, 1000);
  }

  function chooseWeightedTask() {
    const bonus = currentLightBonus();
    const pool = allTasks().filter(t => String(t.id) !== String(state.currentTaskId));
    if (!pool.length) return null;

    const weighted = pool.map(task => ({
      task,
      weight: task.type === "light" ? 1 + bonus : 1
    }));
    const total = weighted.reduce((sum, item) => sum + item.weight, 0);
    let r = Math.random() * total;

    for (const item of weighted) {
      r -= item.weight;
      if (r <= 0) return item.task;
    }
    return weighted.at(-1).task;
  }

  function renderTask() {
    const task = currentTask();
    if (!task) {
      els.taskCard.classList.add("hidden");
      els.dicePanel.classList.remove("hidden");
      els.rollBtn.disabled = false;
      return;
    }

    els.taskIcon.textContent = task.icon;
    els.taskTitle.textContent = task.custom ? `Custom · ${task.title}` : `Quest ${task.id} · ${task.title}`;
    els.taskTime.textContent = `Empfohlene Zeit: ${task.time}`;
    const repeatLabel = task.custom ? (task.repeatable ? " · wiederholbar" : " · nur heute") : "";
    els.taskCategory.textContent =
      task.type === "light"
        ? `Lightweight · +10 XP${repeatLabel}`
        : `Work / Creative · bis +50 XP${repeatLabel}`;
    els.taskCategory.classList.toggle("focus", task.type === "focus");
    els.taskBody.innerHTML = task.body;
    els.taskCard.classList.remove("hidden");
    els.dicePanel.classList.add("hidden");
    els.rollBtn.disabled = true;

    const started = Boolean(state.taskStartedAt);
    els.taskStartBtn.classList.toggle("hidden", started);
    els.taskFinishZone.classList.toggle("hidden", !started);
    setFinishToggle(state.taskFinishedToggle, false);
    updateTaskTimer();
  }

  function setFinishToggle(on, persist = true) {
    state.taskFinishedToggle = Boolean(on);
    els.finishToggle.classList.toggle("on", state.taskFinishedToggle);
    els.finishToggle.setAttribute("aria-pressed", String(state.taskFinishedToggle));
    els.finishToggleText.textContent = state.taskFinishedToggle ? "Task fertig? AN" : "Task fertig? AUS";
    els.completeTaskBtn.classList.toggle("hidden", !state.taskFinishedToggle);
    if (persist) saveState();
  }

  function renderHistory() {
    if (!state.completed.length) {
      els.history.innerHTML = `<li><span class="n">–</span><span>Noch kein Random-Task erledigt.</span></li>`;
      return;
    }
    els.history.innerHTML = state.completed.map((item, i) => `
      <li>
        <span class="n">${i + 1}</span>
        <span class="history-main">
          <span>${item.icon} ${escapeHtml(item.title)}<br><span class="history-meta">${fmtShortDuration(item.durationMs)}</span></span>
          <span class="history-xp">+${item.xp} XP</span>
        </span>
      </li>`).join("");
  }

  function renderFeedback() {
    els.feelingText.value = state.feedback.feelingText || "";
    els.goodText.value = state.feedback.goodText || "";
    els.hardText.value = state.feedback.hardText || "";
    els.nextText.value = state.feedback.nextText || "";
    [...els.feelings.querySelectorAll(".feel")].forEach(btn => {
      btn.classList.toggle("selected", state.feedback.feelings.includes(btn.textContent.trim()));
    });
  }

  function renderFinal() {
    els.finalStart.textContent = fmtClock(state.startedAt);
    els.finalEnd.textContent = fmtClock(state.endedAt);
    els.finalDuration.textContent =
      state.startedAt && state.endedAt ? fmtDuration(state.endedAt - state.startedAt) : "–";
    els.finalTasks.innerHTML = state.completed.length
      ? state.completed.map((t, i) =>
          `${i + 1}. ${t.icon} ${escapeHtml(t.title)} · ${fmtShortDuration(t.durationMs)} · <b>+${t.xp} XP</b>`
        ).join("<br>")
      : "Keine Random-Tasks abgeschlossen.";
    renderFeedback();
  }

  function renderCustomDraft() {
    const draft = state.customDraft || defaults().customDraft;
    els.customTitle.value = draft.title || "";
    els.customDuration.value = draft.duration || "";
    els.customType.value = draft.type === "light" ? "light" : "focus";
    setRepeatChoice(draft.repeatable !== false, false);
  }

  function renderCustomList() {
    const list = state.customTasks || [];
    els.customCount.textContent = list.length;
    if (!list.length) {
      els.customTaskList.innerHTML = `<div class="tiny">Noch keine Custom Quests.</div>`;
      return;
    }

    els.customTaskList.innerHTML = list.map(raw => {
      const task = normalizeCustomTask(raw);
      const meta = [
        task.type === "light" ? "Lightweight" : "Work / Creative",
        task.duration ? `${task.duration} Min.` : "ohne Dauer",
        task.repeatable ? "dauerhaft" : "nur heute"
      ].join(" · ");
      const running = String(state.currentTaskId) === String(task.id);
      return `
        <div class="custom-task-row">
          <div class="custom-task-info">
            <strong>🧩 ${escapeHtml(task.title)}</strong>
            <span>${meta}</span>
          </div>
          <button class="custom-delete" type="button" data-delete-custom="${escapeHtml(task.id)}" ${running ? "disabled" : ""} aria-label="${escapeHtml(task.title)} löschen">×</button>
        </div>`;
    }).join("");
  }

  function renderAll() {
    els.startTimePreview.textContent = fmtClock(state.startedAt);
    els.statusPill.textContent = state.endedAt ? "Feierabend" : state.startedAt ? "Homeoffice läuft" : "Noch nicht gestartet";
    els.finishBtn.disabled = !state.startedAt || Boolean(state.endedAt);
    showScreen(state.screen || (state.endedAt ? "final" : state.startedAt ? "random" : "start"));
    updateBalance();
    updateXp();
    renderHistory();
    renderTask();
    renderFinal();
    renderCustomDraft();
    renderCustomList();
    tick();
  }

  function startDay() {
    if (state.startedAt && !state.endedAt) return;
    state.customTasks = state.customTasks.filter(t => t.repeatable !== false);
    state.startedAt = Date.now();
    state.endedAt = null;
    state.screen = "random";
    state.currentTaskId = null;
    state.taskStartedAt = null;
    state.taskFinishedToggle = false;
    state.lastCompletedType = null;
    state.completed = [];
    state.dayXp = 0;
    state.feedback = emptyFeedback();
    saveState();
    renderAll();
  }

  function roll() {
    if (rolling || !state.startedAt || state.endedAt || state.currentTaskId !== null) return;
    const chosen = chooseWeightedTask();
    if (!chosen) return;

    rolling = true;
    els.rollBtn.disabled = true;
    els.rollLabel.textContent = "Der Würfel entscheidet …";
    els.cube.classList.remove("rolling");
    void els.cube.offsetWidth;
    els.cube.classList.add("rolling");
    els.cubeShadow.style.transform = "translateY(148px) scale(.72)";
    els.cubeShadow.style.opacity = ".55";

    setTimeout(() => {
      state.currentTaskId = chosen.id;
      state.taskStartedAt = null;
      state.taskFinishedToggle = false;
      els.rollLabel.textContent = `${chosen.icon} ${chosen.title}`;
      els.cubeShadow.style.transform = "translateY(148px) scale(1)";
      els.cubeShadow.style.opacity = "1";
      rolling = false;
      saveState();
      renderTask();
      renderCustomList();
    }, 1750);
  }

  function startTask() {
    if (!currentTask() || state.taskStartedAt) return;
    state.taskStartedAt = Date.now();
    state.taskFinishedToggle = false;
    saveState();
    renderTask();
    tick();
  }

  function completeTask() {
    const task = currentTask();
    if (!task || !state.taskStartedAt || !state.taskFinishedToggle) return;

    const durationMs = Math.max(1000, Date.now() - state.taskStartedAt);
    const xp = xpForTask(task, durationMs);

    state.completed.push({
      id: task.id,
      title: task.title,
      icon: task.icon,
      type: task.type,
      custom: Boolean(task.custom),
      durationMs,
      xp,
      completedAt: Date.now()
    });

    state.xpTotal += xp;
    state.dayXp += xp;
    state.lastCompletedType = task.type;

    if (task.custom && !task.repeatable) {
      state.customTasks = state.customTasks.filter(t => String(t.id) !== String(task.id));
    }

    state.currentTaskId = null;
    state.taskStartedAt = null;
    state.taskFinishedToggle = false;
    saveState();

    els.rollLabel.textContent = `Quest abgeschlossen · +${xp} XP. Bereit für den nächsten Wurf?`;
    renderTask();
    renderHistory();
    renderCustomList();
    updateBalance();
    updateXp();
  }

  function finishDay() {
    if (!state.startedAt || state.endedAt) return;
    if (state.currentTaskId !== null) {
      const ok = window.confirm("Der aktuelle Task ist noch nicht abgeschlossen. Homeoffice trotzdem beenden? Für diesen Task gibt es dann keine XP.");
      if (!ok) return;
      state.currentTaskId = null;
      state.taskStartedAt = null;
      state.taskFinishedToggle = false;
    }
    state.endedAt = Date.now();
    state.screen = "final";
    saveFeedback();
    saveState();
    renderAll();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function resetDay() {
    const lifetimeXp = state.xpTotal;
    const repeatableCustom = state.customTasks.filter(t => t.repeatable !== false);
    const draft = { ...state.customDraft };
    state = defaults();
    state.xpTotal = lifetimeXp;
    state.customTasks = repeatableCustom;
    state.customDraft = draft;
    saveState();
    renderAll();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function saveFeedback() {
    state.feedback.feelingText = els.feelingText.value;
    state.feedback.goodText = els.goodText.value;
    state.feedback.hardText = els.hardText.value;
    state.feedback.nextText = els.nextText.value;
    state.feedback.feelings = [...els.feelings.querySelectorAll(".feel.selected")].map(btn => btn.textContent.trim());
    saveState();
  }

  function setRepeatChoice(repeatable, persist = true) {
    state.customDraft.repeatable = Boolean(repeatable);
    document.querySelectorAll(".repeat-option").forEach(btn => {
      btn.classList.toggle("active", (btn.dataset.repeat === "yes") === state.customDraft.repeatable);
    });
    els.repeatHelp.textContent = state.customDraft.repeatable
      ? "Bleibt auch nach dem Abschluss und an neuen Tagen im Random-Pool."
      : "Bleibt heute im Random-Pool, bis die Quest erledigt ist. Danach wird sie entfernt.";
    if (persist) saveState();
  }

  function saveCustomDraftFromInputs() {
    state.customDraft.title = els.customTitle.value;
    state.customDraft.duration = els.customDuration.value;
    state.customDraft.type = els.customType.value === "light" ? "light" : "focus";
    saveState();
  }

  function addCustomTask(event) {
    event.preventDefault();
    const title = els.customTitle.value.trim();
    if (!title) {
      els.customTitle.focus();
      return;
    }

    const durationRaw = els.customDuration.value.trim();
    const duration = durationRaw ? Math.max(1, Math.min(480, Number(durationRaw))) : null;
    const repeatable = state.customDraft.repeatable !== false;

    state.customTasks.push({
      id: `custom-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      title,
      duration,
      type: els.customType.value === "light" ? "light" : "focus",
      repeatable,
      createdAt: Date.now()
    });

    state.customDraft = {
      title: "",
      duration: "",
      type: els.customType.value === "light" ? "light" : "focus",
      repeatable
    };

    saveState();
    renderCustomDraft();
    renderCustomList();
  }

  function deleteCustomTask(id) {
    if (String(state.currentTaskId) === String(id)) {
      window.alert("Die laufende Quest kann nicht gelöscht werden.");
      return;
    }
    state.customTasks = state.customTasks.filter(t => String(t.id) !== String(id));
    saveState();
    renderCustomList();
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  els.startBtn.addEventListener("click", startDay);
  els.rollBtn.addEventListener("click", roll);
  els.taskStartBtn.addEventListener("click", startTask);
  els.finishToggle.addEventListener("click", () => setFinishToggle(!state.taskFinishedToggle));
  els.completeTaskBtn.addEventListener("click", completeTask);
  els.finishBtn.addEventListener("click", finishDay);
  els.resetBtn.addEventListener("click", resetDay);

  els.feelings.addEventListener("click", event => {
    const btn = event.target.closest(".feel");
    if (!btn) return;
    btn.classList.toggle("selected");
    saveFeedback();
  });

  [els.feelingText, els.goodText, els.hardText, els.nextText].forEach(input => {
    input.addEventListener("input", saveFeedback);
  });

  els.customTaskForm.addEventListener("submit", addCustomTask);
  [els.customTitle, els.customDuration].forEach(input => input.addEventListener("input", saveCustomDraftFromInputs));
  els.customType.addEventListener("change", saveCustomDraftFromInputs);

  document.querySelectorAll(".repeat-option").forEach(btn => {
    btn.addEventListener("click", () => setRepeatChoice(btn.dataset.repeat === "yes"));
  });

  els.customTaskList.addEventListener("click", event => {
    const btn = event.target.closest("[data-delete-custom]");
    if (!btn || btn.disabled) return;
    deleteCustomTask(btn.dataset.deleteCustom);
  });

  renderAll();
  startTicker();
})();
