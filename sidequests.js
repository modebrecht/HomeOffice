(() => {
  const KEY = "andrin-homeoffice:sidequests:v1";
  const MAIN_KEY = "andrin-homeoffice:v2";

  if (!document.getElementById("sideQuestBar")) {
    const style = document.createElement("style");
    style.textContent = `
      .sidequest-sticky{position:sticky;top:0;z-index:1000;padding:8px 10px 0;pointer-events:none}
      .sidequest-inner{width:min(1180px,100%);margin:0 auto;display:grid;grid-template-columns:auto 1fr 1fr;gap:9px;align-items:stretch;padding:8px;border:1px solid rgba(255,255,255,.13);border-radius:18px;background:rgba(8,13,29,.86);box-shadow:0 12px 34px rgba(0,0,0,.28);backdrop-filter:blur(20px);pointer-events:auto}
      .sidequest-label{display:flex;align-items:center;padding:0 10px;color:#aeb8d5;font-size:.7rem;font-weight:900;letter-spacing:.11em;text-transform:uppercase;white-space:nowrap}
      .sidequest{min-width:0;display:flex;align-items:center;gap:10px;padding:9px 11px;border-radius:13px;background:rgba(255,255,255,.055);border:1px solid rgba(255,255,255,.08)}
      .sidequest-icon{font-size:1.25rem;flex:0 0 auto}
      .sidequest-main{min-width:0;flex:1}
      .sidequest-top{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:5px}
      .sidequest-title{font-size:.83rem;font-weight:850;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      .sidequest-value{font-size:.78rem;color:#f5f7ff;font-weight:850;white-space:nowrap}
      .sidequest-status{font-size:.67rem;color:#aeb8d5;margin-top:4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      .sidequest-status.done{color:#aaf3e4}
      .water-controls{display:flex;align-items:center;gap:5px}
      .sq-step-btn{width:29px;height:29px;border-radius:9px;display:grid;place-items:center;border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.07);color:#f5f7ff;font-weight:900;padding:0}
      .sq-step-btn:disabled{opacity:.28}
      .water-segments{display:flex;gap:4px;min-width:74px}
      .water-segment{height:7px;flex:1;min-width:10px;border:0;border-radius:999px;background:rgba(255,255,255,.11);padding:0}
      .water-segment.filled{background:linear-gradient(90deg,#70e1c8,#8ea2ff);box-shadow:0 0 10px rgba(112,225,200,.2)}
      .meds-toggle{display:inline-flex;align-items:center;gap:7px;padding:6px 8px;border-radius:999px;border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.06);color:#aeb8d5;font-size:.7rem;font-weight:850;white-space:nowrap}
      .meds-track{width:32px;height:18px;border-radius:999px;background:rgba(255,255,255,.14);padding:2px;display:inline-flex;align-items:center;transition:.2s}
      .meds-knob{width:14px;height:14px;border-radius:50%;background:#fff;display:block;transition:transform .2s;box-shadow:0 1px 4px rgba(0,0,0,.28)}
      .meds-toggle.on{color:#b9f7ea;border-color:rgba(112,225,200,.3);background:rgba(112,225,200,.09)}
      .meds-toggle.on .meds-track{background:rgba(112,225,200,.6)}
      .meds-toggle.on .meds-knob{transform:translateX(14px)}
      .sq-xp{font-size:.65rem;color:#ffe0ad;font-weight:900;white-space:nowrap}
      @media(max-width:760px){
        .sidequest-sticky{padding:5px 6px 0}
        .sidequest-inner{grid-template-columns:1fr 1fr;padding:6px;gap:6px;border-radius:15px}
        .sidequest-label{grid-column:1/-1;padding:1px 5px;font-size:.62rem}
        .sidequest{padding:8px;gap:6px}
        .sidequest-icon{display:none}
        .water-controls{gap:3px}
        .sq-step-btn{width:25px;height:25px}
        .water-segments{min-width:54px;gap:2px}
      }
      @media(max-width:450px){
        .sidequest-inner{grid-template-columns:1fr}
        .sidequest-label{display:none}
        .sidequest{padding:7px 9px}
        .sidequest-status{margin-top:2px}
      }
    `;
    document.head.appendChild(style);

    document.body.insertAdjacentHTML("afterbegin", `
      <div class="sidequest-sticky" id="sideQuestBar">
        <div class="sidequest-inner">
          <div class="sidequest-label">Nebenquests</div>

          <div class="sidequest" id="waterSideQuest">
            <div class="sidequest-icon">💧</div>
            <div class="sidequest-main">
              <div class="sidequest-top">
                <span class="sidequest-title">2.5 L trinken</span>
                <span class="sidequest-value" id="waterValue">0.0 / 2.5 L</span>
              </div>
              <div class="water-controls">
                <button class="sq-step-btn" id="waterMinus" type="button" aria-label="0.5 Liter zurück">−</button>
                <div class="water-segments" id="waterSegments" aria-label="Wasserfortschritt"></div>
                <button class="sq-step-btn" id="waterPlus" type="button" aria-label="0.5 Liter hinzufügen">+</button>
                <span class="sq-xp">+10 XP</span>
              </div>
              <div class="sidequest-status" id="waterStatus">5 × 0.5 L übrig</div>
            </div>
          </div>

          <div class="sidequest" id="medsSideQuest">
            <div class="sidequest-icon">💊</div>
            <div class="sidequest-main">
              <div class="sidequest-top">
                <span class="sidequest-title">Medikamente genommen?</span>
                <span class="sq-xp">+10 XP</span>
              </div>
              <button class="meds-toggle" id="medsToggle" type="button" aria-pressed="false">
                <span class="meds-track"><span class="meds-knob"></span></span>
                <span id="medsStatus">Noch offen</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    `);
  }

  const $ = id => document.getElementById(id);
  const els = {
    waterMinus: $("waterMinus"), waterPlus: $("waterPlus"), waterValue: $("waterValue"),
    waterSegments: $("waterSegments"), waterStatus: $("waterStatus"),
    medsToggle: $("medsToggle"), medsStatus: $("medsStatus"), resetBtn: $("resetBtn")
  };

  const todayKey = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
  };

  const defaults = () => ({
    dayKey: todayKey(), waterSteps: 0, waterAwarded: false,
    medsTaken: false, medsAwarded: false, xpTotal: 0, dayXp: 0
  });

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      const stored = raw ? { ...defaults(), ...JSON.parse(raw) } : defaults();
      if (stored.dayKey !== todayKey()) {
        const lifetime = Number(stored.xpTotal) || 0;
        Object.assign(stored, defaults(), { xpTotal: lifetime });
      }
      stored.waterSteps = Math.max(0, Math.min(5, Number(stored.waterSteps) || 0));
      return stored;
    } catch { return defaults(); }
  }

  let state = load();
  const save = () => localStorage.setItem(KEY, JSON.stringify(state));

  function award(kind) {
    const flag = kind === "water" ? "waterAwarded" : "medsAwarded";
    if (state[flag]) return;
    state[flag] = true;
    state.xpTotal += 10;
    state.dayXp += 10;
  }

  function renderWater() {
    els.waterValue.textContent = `${(state.waterSteps * .5).toFixed(1)} / 2.5 L`;
    els.waterMinus.disabled = state.waterSteps <= 0;
    els.waterPlus.disabled = state.waterSteps >= 5;
    els.waterSegments.innerHTML = Array.from({length:5},(_,i) =>
      `<button type="button" class="water-segment ${i < state.waterSteps ? "filled" : ""}" data-water-step="${i+1}" aria-label="${(i+1)*.5} Liter"></button>`
    ).join("");
    els.waterStatus.textContent = state.waterSteps >= 5 ? "Geschafft · +10 XP ✓" : `${5-state.waterSteps} × 0.5 L übrig`;
    els.waterStatus.classList.toggle("done", state.waterSteps >= 5);
  }

  function renderMeds() {
    els.medsToggle.classList.toggle("on", state.medsTaken);
    els.medsToggle.setAttribute("aria-pressed", String(state.medsTaken));
    els.medsStatus.textContent = state.medsTaken ? "Genommen · +10 XP ✓" : "Noch offen";
  }

  function readMainXp() {
    try {
      const parsed = JSON.parse(localStorage.getItem(MAIN_KEY) || "{}");
      return { total:Number(parsed.xpTotal)||0, day:Number(parsed.dayXp)||0 };
    } catch { return {total:0,day:0}; }
  }

  function syncXpUi() {
    const main = readMainXp();
    const total = main.total + state.xpTotal;
    const day = main.day + state.dayXp;
    [$("xpTotal"), $("headerXp")].forEach(el => { if(el) el.textContent = `${total} XP`; });
    if ($("dayXp")) $("dayXp").textContent = `Heute: +${day} XP`;
    if ($("finalXp")) $("finalXp").textContent = `${day} XP`;
  }

  function persistAndRender() { save(); renderWater(); renderMeds(); syncXpUi(); }

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
    save(); renderWater(); renderMeds(); setTimeout(syncXpUi, 0);
  }

  els.waterMinus.addEventListener("click", () => setWaterSteps(state.waterSteps - 1));
  els.waterPlus.addEventListener("click", () => setWaterSteps(state.waterSteps + 1));
  els.waterSegments.addEventListener("click", e => {
    const btn = e.target.closest("[data-water-step]");
    if (btn) setWaterSteps(Number(btn.dataset.waterStep));
  });
  els.medsToggle.addEventListener("click", toggleMeds);
  if (els.resetBtn) els.resetBtn.addEventListener("click", resetDailySideQuests);

  save(); renderWater(); renderMeds(); syncXpUi();
  setInterval(syncXpUi, 750);
})();