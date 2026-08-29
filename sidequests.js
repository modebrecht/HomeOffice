(() => {
  const KEY = "andrin-homeoffice:sidequests:v1";
  const MAIN_KEY = "andrin-homeoffice:v2";

  const $ = id => document.getElementById(id);
  const els = {
    waterMinus: $("waterMinus"),
    waterPlus: $("waterPlus"),
    waterValue: $("waterValue"),
    waterSegments: $("waterSegments"),
    waterStatus: $("waterStatus"),
    medsToggle: $("medsToggle"),
    medsStatus: $("medsStatus"),
    resetBtn: $("resetBtn")
  };

  if (!els.waterPlus || !els.medsToggle) return;

  const todayKey = () => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  const defaults = () => ({
    dayKey: todayKey(),
    waterSteps: 0,
    waterAwarded: false,
    medsTaken: false,
    medsAwarded: false,
    xpTotal: 0,
    dayXp: 0
  });

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      const stored = raw ? { ...defaults(), ...JSON.parse(raw) } : defaults();
      if (stored.dayKey !== todayKey()) {
        stored.dayKey = todayKey();
        stored.waterSteps = 0;
        stored.waterAwarded = false;
        stored.medsTaken = false;
        stored.medsAwarded = false;
        stored.dayXp = 0;
      }
      stored.waterSteps = Math.max(0, Math.min(5, Number(stored.waterSteps) || 0));
      return stored;
    } catch {
      return defaults();
    }
  }

  let state = load();

  function save() {
    localStorage.setItem(KEY, JSON.stringify(state));
  }

  function award(kind) {
    const flag = kind === "water" ? "waterAwarded" : "medsAwarded";
    if (state[flag]) return;
    state[flag] = true;
    state.xpTotal += 10;
    state.dayXp += 10;
  }

  function renderWater() {
    const litres = (state.waterSteps * 0.5).toFixed(1);
    els.waterValue.textContent = `${litres} / 2.5 L`;
    els.waterMinus.disabled = state.waterSteps <= 0;
    els.waterPlus.disabled = state.waterSteps >= 5;
    els.waterSegments.innerHTML = Array.from({ length: 5 }, (_, i) =>
      `<button type="button" class="water-segment ${i < state.waterSteps ? "filled" : ""}" data-water-step="${i + 1}" aria-label="${(i + 1) * 0.5} Liter"></button>`
    ).join("");
    els.waterStatus.textContent = state.waterSteps >= 5
      ? (state.waterAwarded ? "Geschafft · +10 XP ✓" : "Geschafft")
      : `${5 - state.waterSteps} × 0.5 L übrig`;
    els.waterStatus.classList.toggle("done", state.waterSteps >= 5);
  }

  function renderMeds() {
    els.medsToggle.classList.toggle("on", state.medsTaken);
    els.medsToggle.setAttribute("aria-pressed", String(state.medsTaken));
    els.medsStatus.textContent = state.medsTaken
      ? (state.medsAwarded ? "Genommen · +10 XP ✓" : "Genommen")
      : "Noch offen";
    els.medsStatus.classList.toggle("done", state.medsTaken);
  }

  function readMainXp() {
    try {
      const parsed = JSON.parse(localStorage.getItem(MAIN_KEY) || "{}");
      return {
        total: Number(parsed.xpTotal) || 0,
        day: Number(parsed.dayXp) || 0
      };
    } catch {
      return { total: 0, day: 0 };
    }
  }

  function syncXpUi() {
    const main = readMainXp();
    const total = main.total + state.xpTotal;
    const day = main.day + state.dayXp;
    const totalEls = [$("xpTotal"), $("headerXp")];
    totalEls.forEach(el => { if (el) el.textContent = `${total} XP`; });
    const dayEl = $("dayXp");
    if (dayEl) dayEl.textContent = `Heute: +${day} XP`;
    const finalEl = $("finalXp");
    if (finalEl) finalEl.textContent = `${day} XP`;
  }

  function persistAndRender() {
    save();
    renderWater();
    renderMeds();
    syncXpUi();
  }

  function setWaterSteps(steps) {
    const previous = state.waterSteps;
    state.waterSteps = Math.max(0, Math.min(5, Number(steps) || 0));
    if (previous < 5 && state.waterSteps === 5) award("water");
    persistAndRender();
  }

  function toggleMeds() {
    state.medsTaken = !state.medsTaken;
    if (state.medsTaken) award("meds");
    persistAndRender();
  }

  function resetDailySideQuests() {
    const lifetime = state.xpTotal;
    state = defaults();
    state.xpTotal = lifetime;
    save();
    renderWater();
    renderMeds();
    setTimeout(syncXpUi, 0);
  }

  els.waterMinus.addEventListener("click", () => setWaterSteps(state.waterSteps - 1));
  els.waterPlus.addEventListener("click", () => setWaterSteps(state.waterSteps + 1));
  els.waterSegments.addEventListener("click", event => {
    const btn = event.target.closest("[data-water-step]");
    if (!btn) return;
    setWaterSteps(Number(btn.dataset.waterStep));
  });
  els.medsToggle.addEventListener("click", toggleMeds);
  if (els.resetBtn) els.resetBtn.addEventListener("click", resetDailySideQuests);

  save();
  renderWater();
  renderMeds();
  syncXpUi();

  // app.js verwaltet seine XP separat. Diese kleine Synchronisierung addiert
  // Sidequest-XP nach Task-Abschlüssen oder UI-Neurendering wieder sichtbar dazu.
  setInterval(syncXpUi, 750);
})();