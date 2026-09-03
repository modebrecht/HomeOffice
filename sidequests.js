(() => {
  const KEY = "andrin-homeoffice:sidequests:v1";
  const MAIN_KEY = "andrin-homeoffice:v2";

  if (!document.getElementById("sideQuestBar")) {
    const style = document.createElement("style");
    style.textContent = `
      .sidequest-sticky{position:relative;z-index:1;margin:0;padding:0;pointer-events:none}
      .sidequest-inner{width:100%;display:grid;grid-template-columns:1fr 1fr;gap:8px;align-items:stretch;padding:8px;border:1px solid rgba(255,255,255,.13);border-radius:18px;background:rgba(8,13,29,.92);box-shadow:0 12px 34px rgba(0,0,0,.28);backdrop-filter:blur(20px);pointer-events:auto}
      .sidequest-label{grid-column:1/-1;display:flex;align-items:center;padding:0 4px;color:#aeb8d5;font-size:.7rem;font-weight:900;letter-spacing:.11em;text-transform:uppercase;white-space:nowrap}
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
      .meds-toggle,.custom-sq-toggle{display:inline-flex;align-items:center;gap:7px;padding:6px 8px;border-radius:999px;border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.06);color:#aeb8d5;font-size:.7rem;font-weight:850;white-space:nowrap}
      .meds-track{width:32px;height:18px;border-radius:999px;background:rgba(255,255,255,.14);padding:2px;display:inline-flex;align-items:center;transition:.2s}
      .meds-knob{width:14px;height:14px;border-radius:50%;background:#fff;display:block;transition:transform .2s;box-shadow:0 1px 4px rgba(0,0,0,.28)}
      .meds-toggle.on,.custom-sq-toggle.on{color:#b9f7ea;border-color:rgba(112,225,200,.3);background:rgba(112,225,200,.09)}
      .meds-toggle.on .meds-track,.custom-sq-toggle.on .meds-track{background:rgba(112,225,200,.6)}
      .meds-toggle.on .meds-knob,.custom-sq-toggle.on .meds-knob{transform:translateX(14px)}
      .sq-xp{font-size:.65rem;color:#ffe0ad;font-weight:900;white-space:nowrap}
      .custom-sidequest-grid{grid-column:1/-1;display:grid;grid-template-columns:1fr 1fr;gap:8px}
      .sidequest-actions{grid-column:1/-1;display:grid;grid-template-columns:1fr 1fr;gap:7px}
      .sidequest-action-btn{min-height:34px;padding:7px 9px;border-radius:10px;border:1px solid rgba(255,255,255,.10);background:rgba(255,255,255,.055);color:#dce3f8;font-size:.72rem;font-weight:850}
      .sidequest-action-btn.active{border-color:rgba(142,162,255,.34);background:rgba(142,162,255,.11);color:#f5f7ff}
      .sidequest-panel{grid-column:1/-1;padding:9px;border:1px solid rgba(255,255,255,.08);border-radius:12px;background:rgba(255,255,255,.035)}
      .sidequest-panel.hidden{display:none}
      .sidequest-add-form{display:flex;gap:6px}
      .sidequest-add-form input{min-width:0;flex:1;min-height:36px;padding:8px 10px;border:1px solid rgba(255,255,255,.12);border-radius:10px;background:rgba(255,255,255,.06);color:#f5f7ff;outline:none}
      .sidequest-add-form button{min-height:36px;padding:7px 10px;border-radius:10px;background:rgba(112,225,200,.12);border:1px solid rgba(112,225,200,.25);color:#b9f7ea;font-size:.72rem;font-weight:900}
      .sidequest-manager{display:grid;gap:6px}
      .sidequest-manage-row{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:7px 8px;border-radius:10px;background:rgba(255,255,255,.045)}
      .sidequest-manage-row span{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:.75rem}
      .sidequest-manage-row small{color:#7f8bad;font-size:.65rem;white-space:nowrap}
      .sidequest-delete{width:28px;height:28px;display:grid;place-items:center;border-radius:8px;border:1px solid rgba(255,141,156,.18);background:rgba(255,141,156,.07);color:#ffc3cc;font-size:1rem}
      @media(max-width:620px){
        .sidequest-inner{padding:6px;gap:6px;border-radius:15px}
        .sidequest-label{padding:1px 5px;font-size:.62rem}
        .sidequest{padding:8px;gap:6px}
        .sidequest-icon{display:none}
        .water-controls{gap:3px}
        .sq-step-btn{width:25px;height:25px}
        .water-segments{min-width:54px;gap:2px}
      }
      @media(max-width:450px){
        .sidequest-label{display:none}
        .sidequest{padding:7px 9px}
        .sidequest-status{margin-top:2px}
        .custom-sidequest-grid{grid-template-columns:1fr}
        .sidequest-action-btn{font-size:.68rem;padding:6px 7px}
      }
    `;
    document.head.appendChild(style);

    const side = document.querySelector(".side");
    if (!side) return;

    side.insertAdjacentHTML("afterbegin", `
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
                <span class="sidequest-title">Medikamente</span>
                <span class="sq-xp">+10 XP</span>
              </div>
              <button class="meds-toggle" id="medsToggle" type="button" aria-pressed="false">
                <span class="meds-track"><span class="meds-knob"></span></span>
                <span id="medsStatus">Offen</span>
              </button>
            </div>
          </div>

          <div class="custom-sidequest-grid" id="customSideQuestList"></div>

          <div class="sidequest-actions">
            <button class="sidequest-action-btn" id="addSideQuestBtn" type="button">＋ Nebenquest</button>
            <button class="sidequest-action-btn" id="manageSideQuestsBtn" type="button">⚙ Verwalten</button>
          </div>

          <div class="sidequest-panel hidden" id="sideQuestAddPanel">
            <form class="sidequest-add-form" id="sideQuestAddForm">
              <input id="sideQuestTitle" maxlength="60" autocomplete="off" placeholder="Titel" required />
              <button type="submit">Hinzufügen</button>
            </form>
          </div>

          <div class="sidequest-panel hidden" id="sideQuestManagePanel">
            <div class="sidequest-manager" id="sideQuestManager"></div>
          </div>
        </div>
      </div>
    `);
  }

  const $ = id => document.getElementById(id);
  const els = {
    waterMinus: $("waterMinus"), waterPlus: $("waterPlus"), waterValue: $("waterValue"),
    waterSegments: $("waterSegments"), waterStatus: $("waterStatus"),
    medsToggle: $("medsToggle"), medsStatus: $("medsStatus"), resetBtn: $("resetBtn"),
    customSideQuestList: $("customSideQuestList"), addSideQuestBtn: $("addSideQuestBtn"),
    manageSideQuestsBtn: $("manageSideQuestsBtn"), sideQuestAddPanel: $("sideQuestAddPanel"),
    sideQuestManagePanel: $("sideQuestManagePanel"), sideQuestAddForm: $("sideQuestAddForm"),
    sideQuestTitle: $("sideQuestTitle"), sideQuestManager: $("sideQuestManager")
  };

  const todayKey = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
  };

  const normalizeCustom = quest => ({
    id: String(quest.id || `sq-${Date.now()}-${Math.random().toString(36).slice(2,7)}`),
    title: String(quest.title || "Nebenquest").slice(0, 60),
    done: Boolean(quest.done),
    awarded: Boolean(quest.awarded)
  });

  const defaults = () => ({
    dayKey: todayKey(), waterSteps: 0, waterAwarded: false,
    medsTaken: false, medsAwarded: false, xpTotal: 0, dayXp: 0,
    customSideQuests: []
  });

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      const parsed = raw ? JSON.parse(raw) : {};
      const stored = { ...defaults(), ...parsed };
      stored.customSideQuests = Array.isArray(parsed.customSideQuests)
        ? parsed.customSideQuests.map(normalizeCustom)
        : [];
      if (stored.dayKey !== todayKey()) {
        const lifetime = Number(stored.xpTotal) || 0;
        const customSideQuests = stored.customSideQuests.map(q => ({ ...q, done:false, awarded:false }));
        Object.assign(stored, defaults(), { xpTotal: lifetime, customSideQuests });
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

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function renderWater() {
    els.waterValue.textContent = `${(state.waterSteps * .5).toFixed(1)} / 2.5 L`;
    els.waterMinus.disabled = state.waterSteps <= 0;
    els.waterPlus.disabled = state.waterSteps >= 5;
    els.waterSegments.innerHTML = Array.from({length:5},(_,i) =>
      `<button type="button" class="water-segment ${i < state.waterSteps ? "filled" : ""}" data-water-step="${i+1}" aria-label="${(i+1)*.5} Liter"></button>`
    ).join("");
    els.waterStatus.textContent = state.waterSteps >= 5 ? "Erledigt · +10 XP" : `${5-state.waterSteps} × 0.5 L`;
    els.waterStatus.classList.toggle("done", state.waterSteps >= 5);
  }

  function renderMeds() {
    els.medsToggle.classList.toggle("on", state.medsTaken);
    els.medsToggle.setAttribute("aria-pressed", String(state.medsTaken));
    els.medsStatus.textContent = state.medsTaken ? "Erledigt · +10 XP" : "Offen";
  }

  function renderCustomSideQuests() {
    if (!state.customSideQuests.length) {
      els.customSideQuestList.innerHTML = "";
    } else {
      els.customSideQuestList.innerHTML = state.customSideQuests.map(q => `
        <div class="sidequest">
          <div class="sidequest-main">
            <div class="sidequest-top">
              <span class="sidequest-title">${escapeHtml(q.title)}</span>
              <span class="sq-xp">+10 XP</span>
            </div>
            <button class="custom-sq-toggle ${q.done ? "on" : ""}" type="button" data-toggle-sidequest="${escapeHtml(q.id)}" aria-pressed="${String(q.done)}">
              <span class="meds-track"><span class="meds-knob"></span></span>
              <span>${q.done ? "Erledigt" : "Offen"}</span>
            </button>
          </div>
        </div>`).join("");
    }

    els.sideQuestManager.innerHTML = `
      <div class="sidequest-manage-row"><span>💧 2.5 L trinken</span><small>Standard</small></div>
      <div class="sidequest-manage-row"><span>💊 Medikamente</span><small>Standard</small></div>
      ${state.customSideQuests.map(q => `
        <div class="sidequest-manage-row">
          <span>${escapeHtml(q.title)}</span>
          <button class="sidequest-delete" type="button" data-delete-sidequest="${escapeHtml(q.id)}" aria-label="${escapeHtml(q.title)} löschen">×</button>
        </div>`).join("")}`;
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

  function persistAndRender() {
    save();
    renderWater();
    renderMeds();
    renderCustomSideQuests();
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

  function toggleCustomSideQuest(id) {
    const quest = state.customSideQuests.find(q => q.id === id);
    if (!quest) return;
    quest.done = !quest.done;
    if (quest.done && !quest.awarded) {
      quest.awarded = true;
      state.xpTotal += 10;
      state.dayXp += 10;
    }
    persistAndRender();
  }

  function addCustomSideQuest(event) {
    event.preventDefault();
    const title = els.sideQuestTitle.value.trim();
    if (!title) return;
    state.customSideQuests.push(normalizeCustom({
      id:`sq-${Date.now()}-${Math.random().toString(36).slice(2,7)}`,
      title,
      done:false,
      awarded:false
    }));
    els.sideQuestTitle.value = "";
    save();
    renderCustomSideQuests();
  }

  function deleteCustomSideQuest(id) {
    state.customSideQuests = state.customSideQuests.filter(q => q.id !== id);
    save();
    renderCustomSideQuests();
  }

  function togglePanel(which) {
    const add = which === "add";
    const panel = add ? els.sideQuestAddPanel : els.sideQuestManagePanel;
    const button = add ? els.addSideQuestBtn : els.manageSideQuestsBtn;
    const otherPanel = add ? els.sideQuestManagePanel : els.sideQuestAddPanel;
    const otherButton = add ? els.manageSideQuestsBtn : els.addSideQuestBtn;
    const willOpen = panel.classList.contains("hidden");
    panel.classList.toggle("hidden", !willOpen);
    otherPanel.classList.add("hidden");
    button.classList.toggle("active", willOpen);
    otherButton.classList.remove("active");
    if (willOpen && add) setTimeout(() => els.sideQuestTitle.focus(), 0);
  }

  function resetDailySideQuests() {
    const lifetime = state.xpTotal;
    const customSideQuests = state.customSideQuests.map(q => ({ ...q, done:false, awarded:false }));
    state = defaults();
    state.xpTotal = lifetime;
    state.customSideQuests = customSideQuests;
    save();
    renderWater();
    renderMeds();
    renderCustomSideQuests();
    setTimeout(syncXpUi, 0);
  }

  els.waterMinus.addEventListener("click", () => setWaterSteps(state.waterSteps - 1));
  els.waterPlus.addEventListener("click", () => setWaterSteps(state.waterSteps + 1));
  els.waterSegments.addEventListener("click", e => {
    const btn = e.target.closest("[data-water-step]");
    if (btn) setWaterSteps(Number(btn.dataset.waterStep));
  });
  els.medsToggle.addEventListener("click", toggleMeds);
  els.addSideQuestBtn.addEventListener("click", () => togglePanel("add"));
  els.manageSideQuestsBtn.addEventListener("click", () => togglePanel("manage"));
  els.sideQuestAddForm.addEventListener("submit", addCustomSideQuest);
  els.customSideQuestList.addEventListener("click", e => {
    const btn = e.target.closest("[data-toggle-sidequest]");
    if (btn) toggleCustomSideQuest(btn.dataset.toggleSidequest);
  });
  els.sideQuestManager.addEventListener("click", e => {
    const btn = e.target.closest("[data-delete-sidequest]");
    if (btn) deleteCustomSideQuest(btn.dataset.deleteSidequest);
  });
  if (els.resetBtn) els.resetBtn.addEventListener("click", resetDailySideQuests);

  save();
  renderWater();
  renderMeds();
  renderCustomSideQuests();
  syncXpUi();
  setInterval(syncXpUi, 750);
})();