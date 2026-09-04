(() => {
  const KEY = "andrin-homeoffice:sidequests:v1";
  const MAIN_KEY = "andrin-homeoffice:v2";
  const COUNTER_MIN = 2;
  const COUNTER_MAX = 10;

  if (!document.getElementById("sideQuestBar")) {
    const style = document.createElement("style");
    style.textContent = `
      .sidequest-sticky{position:relative;z-index:1;margin:0;padding:0;pointer-events:none}
      .sidequest-inner{width:100%;display:grid;grid-template-columns:1fr;gap:8px;align-items:stretch;padding:8px;border:1px solid rgba(255,255,255,.13);border-radius:18px;background:rgba(8,13,29,.92);box-shadow:0 12px 34px rgba(0,0,0,.28);backdrop-filter:blur(20px);pointer-events:auto}
      .sidequest-label{display:flex;align-items:center;padding:0 4px;color:#aeb8d5;font-size:.7rem;font-weight:900;letter-spacing:.11em;text-transform:uppercase;white-space:nowrap}
      .sidequest-grid{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:8px;align-items:stretch}
      .custom-sidequest-grid{display:contents}
      .sidequest{min-width:0;display:flex;align-items:center;gap:10px;padding:9px 11px;border-radius:13px;background:rgba(255,255,255,.055);border:1px solid rgba(255,255,255,.08);grid-column:auto}
      .sidequest.full-row{grid-column:1/-1}
      .sidequest-icon{font-size:1.25rem;flex:0 0 auto}
      .sidequest-main{min-width:0;flex:1}
      .sidequest-top{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:5px}
      .sidequest-title{font-size:.83rem;font-weight:850;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      .sidequest-value{font-size:.78rem;color:#f5f7ff;font-weight:850;white-space:nowrap}
      .sidequest-status{font-size:.67rem;color:#aeb8d5;margin-top:4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      .sidequest-status.done{color:#aaf3e4}
      .sq-counter-controls{display:flex;align-items:center;gap:5px;min-width:0}
      .sq-step-btn{width:29px;height:29px;min-width:29px;border-radius:9px;display:grid;place-items:center;border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.07);color:#f5f7ff;font-weight:900;padding:0}
      .sq-step-btn:disabled{opacity:.28}
      .sq-segments{display:flex;gap:4px;min-width:56px;flex:1}
      .sq-segment{height:7px;flex:1;min-width:5px;border:0;border-radius:999px;background:rgba(255,255,255,.11);padding:0}
      .sq-segment.filled{background:linear-gradient(90deg,#70e1c8,#8ea2ff);box-shadow:0 0 10px rgba(112,225,200,.2)}
      .meds-toggle,.custom-sq-toggle{display:inline-flex;align-items:center;gap:7px;padding:6px 8px;border-radius:999px;border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.06);color:#aeb8d5;font-size:.7rem;font-weight:850;white-space:nowrap}
      .meds-track{width:32px;height:18px;border-radius:999px;background:rgba(255,255,255,.14);padding:2px;display:inline-flex;align-items:center;transition:.2s}
      .meds-knob{width:14px;height:14px;border-radius:50%;background:#fff;display:block;transition:transform .2s;box-shadow:0 1px 4px rgba(0,0,0,.28)}
      .meds-toggle.on,.custom-sq-toggle.on{color:#b9f7ea;border-color:rgba(112,225,200,.3);background:rgba(112,225,200,.09)}
      .meds-toggle.on .meds-track,.custom-sq-toggle.on .meds-track{background:rgba(112,225,200,.6)}
      .meds-toggle.on .meds-knob,.custom-sq-toggle.on .meds-knob{transform:translateX(14px)}
      .sq-xp{font-size:.65rem;color:#ffe0ad;font-weight:900;white-space:nowrap}
      .sidequest-actions{display:grid;grid-template-columns:1fr 1fr;gap:7px}
      .sidequest-action-btn{min-height:34px;padding:7px 9px;border-radius:10px;border:1px solid rgba(255,255,255,.10);background:rgba(255,255,255,.055);color:#dce3f8;font-size:.72rem;font-weight:850}
      .sidequest-action-btn.active{border-color:rgba(142,162,255,.34);background:rgba(142,162,255,.11);color:#f5f7ff}
      .sidequest-panel{padding:9px;border:1px solid rgba(255,255,255,.08);border-radius:12px;background:rgba(255,255,255,.035)}
      .sidequest-panel.hidden{display:none}
      .sidequest-add-form{display:grid;grid-template-columns:minmax(0,1fr) auto auto auto;gap:6px;align-items:end}
      .sidequest-add-field{display:grid;gap:4px;min-width:0}
      .sidequest-add-field label{color:#8f9ab8;font-size:.58rem;font-weight:850;text-transform:uppercase;letter-spacing:.06em}
      .sidequest-add-form input,.sidequest-add-form select{min-width:0;min-height:36px;padding:8px 10px;border:1px solid rgba(255,255,255,.12);border-radius:10px;background:rgba(255,255,255,.06);color:#f5f7ff;outline:none}
      .sidequest-add-form select option{background:#11182b;color:#f5f7ff}
      .sidequest-add-form button{min-height:36px;padding:7px 10px;border-radius:10px;background:rgba(112,225,200,.12);border:1px solid rgba(112,225,200,.25);color:#b9f7ea;font-size:.72rem;font-weight:900}
      .sidequest-target.hidden{display:none}
      .sidequest-target input{width:72px}
      .sidequest-manager{display:grid;gap:6px}
      .sidequest-manage-row{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:7px 8px;border-radius:10px;background:rgba(255,255,255,.045)}
      .sidequest-manage-main{min-width:0;display:flex;flex:1;align-items:center;justify-content:space-between;gap:8px}
      .sidequest-manage-row span{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:.75rem}
      .sidequest-manage-row small{color:#7f8bad;font-size:.65rem;white-space:nowrap}
      .sidequest-delete{width:28px;height:28px;display:grid;place-items:center;border-radius:8px;border:1px solid rgba(255,141,156,.18);background:rgba(255,141,156,.07);color:#ffc3cc;font-size:1rem}
      @media(max-width:620px){
        .sidequest-inner{padding:6px;gap:6px;border-radius:15px}
        .sidequest-label{padding:1px 5px;font-size:.62rem}
        .sidequest{padding:8px;gap:6px}
        .sidequest-icon{display:none}
        .sq-counter-controls{gap:3px}
        .sq-step-btn{width:25px;height:25px;min-width:25px}
        .sq-segments{min-width:38px;gap:2px}
        .sidequest-add-form{grid-template-columns:1fr 1fr}
        .sidequest-add-title{grid-column:1/-1}
        .sidequest-add-form>button{grid-column:1/-1}
        .sidequest-target input{width:100%}
      }
      @media(max-width:450px){
        .sidequest-label{display:none}
        .sidequest{padding:7px 8px}
        .sidequest-status{margin-top:2px}
        .sidequest-action-btn{font-size:.68rem;padding:6px 7px}
        .sidequest-title{font-size:.7rem}
        .sidequest-value{font-size:.65rem}
        .sq-xp{display:none}
      }
    `;
    document.head.appendChild(style);

    const side = document.querySelector(".side");
    if (!side) return;

    side.insertAdjacentHTML("afterbegin", `
      <div class="sidequest-sticky" id="sideQuestBar">
        <div class="sidequest-inner">
          <div class="sidequest-label">Nebenquests</div>

          <div class="sidequest-grid" id="sideQuestGrid">
            <div class="sidequest" id="waterSideQuest">
              <div class="sidequest-icon">💧</div>
              <div class="sidequest-main">
                <div class="sidequest-top">
                  <span class="sidequest-title">2.5 L trinken</span>
                  <span class="sidequest-value" id="waterValue">0.0 / 2.5 L</span>
                </div>
                <div class="sq-counter-controls">
                  <button class="sq-step-btn" id="waterMinus" type="button" aria-label="0.5 Liter zurück">−</button>
                  <div class="sq-segments" id="waterSegments" aria-label="Wasserfortschritt"></div>
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
          </div>

          <div class="sidequest-actions">
            <button class="sidequest-action-btn" id="addSideQuestBtn" type="button">＋ Nebenquest</button>
            <button class="sidequest-action-btn" id="manageSideQuestsBtn" type="button">⚙ Verwalten</button>
          </div>

          <div class="sidequest-panel hidden" id="sideQuestAddPanel">
            <form class="sidequest-add-form" id="sideQuestAddForm">
              <div class="sidequest-add-field sidequest-add-title">
                <label for="sideQuestTitle">Titel</label>
                <input id="sideQuestTitle" maxlength="60" autocomplete="off" placeholder="Nebenquest" required />
              </div>
              <div class="sidequest-add-field">
                <label for="sideQuestType">Typ</label>
                <select id="sideQuestType">
                  <option value="switch" selected>Switch</option>
                  <option value="counter">Zähler</option>
                </select>
              </div>
              <div class="sidequest-add-field sidequest-target hidden" id="sideQuestTargetWrap">
                <label for="sideQuestTarget">Ziel</label>
                <input id="sideQuestTarget" type="number" min="${COUNTER_MIN}" max="${COUNTER_MAX}" step="1" inputmode="numeric" value="5" />
              </div>
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
  const clamp = (value, min, max) => Math.max(min, Math.min(max, Number(value) || 0));
  const els = {
    waterMinus: $("waterMinus"), waterPlus: $("waterPlus"), waterValue: $("waterValue"),
    waterSegments: $("waterSegments"), waterStatus: $("waterStatus"),
    medsToggle: $("medsToggle"), medsStatus: $("medsStatus"), resetBtn: $("resetBtn"),
    sideQuestGrid: $("sideQuestGrid"), customSideQuestList: $("customSideQuestList"), addSideQuestBtn: $("addSideQuestBtn"),
    manageSideQuestsBtn: $("manageSideQuestsBtn"), sideQuestAddPanel: $("sideQuestAddPanel"),
    sideQuestManagePanel: $("sideQuestManagePanel"), sideQuestAddForm: $("sideQuestAddForm"),
    sideQuestTitle: $("sideQuestTitle"), sideQuestType: $("sideQuestType"), sideQuestTarget: $("sideQuestTarget"),
    sideQuestTargetWrap: $("sideQuestTargetWrap"), sideQuestManager: $("sideQuestManager")
  };

  const todayKey = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
  };

  const normalizeCustom = quest => {
    const type = quest.type === "counter" ? "counter" : "switch";
    const target = type === "counter" ? clamp(quest.target || 5, COUNTER_MIN, COUNTER_MAX) : 1;
    const legacyDone = Boolean(quest.done);
    const rawCount = quest.count ?? (legacyDone ? target : 0);
    const count = type === "counter" ? clamp(rawCount, 0, target) : (legacyDone ? 1 : 0);
    return {
      id: String(quest.id || `sq-${Date.now()}-${Math.random().toString(36).slice(2,7)}`),
      title: String(quest.title || "Nebenquest").slice(0, 60),
      type,
      target,
      count,
      done: type === "counter" ? count >= target : legacyDone,
      awarded: Boolean(quest.awarded)
    };
  };

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
        const customSideQuests = stored.customSideQuests.map(q => ({ ...q, count:0, done:false, awarded:false }));
        Object.assign(stored, defaults(), { xpTotal: lifetime, customSideQuests });
      }
      stored.waterSteps = clamp(stored.waterSteps, 0, 5);
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

  function awardCustom(quest) {
    if (!quest || quest.awarded) return;
    quest.awarded = true;
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

  function renderSegments(count, target, id) {
    return Array.from({length:target}, (_, i) =>
      `<button type="button" class="sq-segment ${i < count ? "filled" : ""}" data-counter-step="${i+1}" data-counter-id="${escapeHtml(id)}" aria-label="${i+1} von ${target}"></button>`
    ).join("");
  }

  function renderWater() {
    els.waterValue.textContent = `${(state.waterSteps * .5).toFixed(1)} / 2.5 L`;
    els.waterMinus.disabled = state.waterSteps <= 0;
    els.waterPlus.disabled = state.waterSteps >= 5;
    els.waterSegments.innerHTML = Array.from({length:5},(_,i) =>
      `<button type="button" class="sq-segment ${i < state.waterSteps ? "filled" : ""}" data-water-step="${i+1}" aria-label="${(i+1)*.5} Liter"></button>`
    ).join("");
    els.waterStatus.textContent = state.waterSteps >= 5 ? "Erledigt · +10 XP" : `${5-state.waterSteps} × 0.5 L übrig`;
    els.waterStatus.classList.toggle("done", state.waterSteps >= 5);
  }

  function renderMeds() {
    els.medsToggle.classList.toggle("on", state.medsTaken);
    els.medsToggle.setAttribute("aria-pressed", String(state.medsTaken));
    els.medsStatus.textContent = state.medsTaken ? "Erledigt · +10 XP" : "Offen";
  }

  function applyRowLayout() {
    const cards = [...els.sideQuestGrid.querySelectorAll(":scope > .sidequest, :scope > .custom-sidequest-grid > .sidequest")];
    cards.forEach(card => card.classList.remove("full-row"));
    if (cards.length % 2 === 1) cards.at(-1)?.classList.add("full-row");
  }

  function renderCustomSideQuests() {
    els.customSideQuestList.innerHTML = state.customSideQuests.map(q => {
      if (q.type === "counter") {
        return `
          <div class="sidequest" data-sidequest-id="${escapeHtml(q.id)}">
            <div class="sidequest-main">
              <div class="sidequest-top">
                <span class="sidequest-title">${escapeHtml(q.title)}</span>
                <span class="sidequest-value">${q.count}/${q.target}</span>
              </div>
              <div class="sq-counter-controls">
                <button class="sq-step-btn" type="button" data-counter-minus="${escapeHtml(q.id)}" aria-label="${escapeHtml(q.title)} minus" ${q.count <= 0 ? "disabled" : ""}>−</button>
                <div class="sq-segments">${renderSegments(q.count, q.target, q.id)}</div>
                <button class="sq-step-btn" type="button" data-counter-plus="${escapeHtml(q.id)}" aria-label="${escapeHtml(q.title)} plus" ${q.count >= q.target ? "disabled" : ""}>+</button>
                <span class="sq-xp">+10 XP</span>
              </div>
              <div class="sidequest-status ${q.done ? "done" : ""}">${q.done ? "Erledigt · +10 XP" : `${q.target-q.count} übrig`}</div>
            </div>
          </div>`;
      }
      return `
        <div class="sidequest" data-sidequest-id="${escapeHtml(q.id)}">
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
        </div>`;
    }).join("");

    els.sideQuestManager.innerHTML = `
      <div class="sidequest-manage-row"><div class="sidequest-manage-main"><span>💧 2.5 L trinken</span><small>Zähler · 5</small></div></div>
      <div class="sidequest-manage-row"><div class="sidequest-manage-main"><span>💊 Medikamente</span><small>Switch</small></div></div>
      ${state.customSideQuests.map(q => `
        <div class="sidequest-manage-row">
          <div class="sidequest-manage-main">
            <span>${escapeHtml(q.title)}</span>
            <small>${q.type === "counter" ? `Zähler · ${q.target}` : "Switch"}</small>
          </div>
          <button class="sidequest-delete" type="button" data-delete-sidequest="${escapeHtml(q.id)}" aria-label="${escapeHtml(q.title)} löschen">×</button>
        </div>`).join("")}`;
    applyRowLayout();
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
    state.waterSteps = clamp(steps, 0, 5);
    if (previous < 5 && state.waterSteps === 5) award("water");
    persistAndRender();
  }

  function toggleMeds() {
    state.medsTaken = !state.medsTaken;
    if (state.medsTaken) award("meds");
    persistAndRender();
  }

  function toggleCustomSideQuest(id) {
    const quest = state.customSideQuests.find(q => q.id === id && q.type === "switch");
    if (!quest) return;
    quest.done = !quest.done;
    quest.count = quest.done ? 1 : 0;
    if (quest.done) awardCustom(quest);
    persistAndRender();
  }

  function setCustomCounter(id, value) {
    const quest = state.customSideQuests.find(q => q.id === id && q.type === "counter");
    if (!quest) return;
    const wasDone = quest.done;
    quest.count = clamp(value, 0, quest.target);
    quest.done = quest.count >= quest.target;
    if (!wasDone && quest.done) awardCustom(quest);
    persistAndRender();
  }

  function syncAddTypeUi() {
    const counter = els.sideQuestType.value === "counter";
    els.sideQuestTargetWrap.classList.toggle("hidden", !counter);
    els.sideQuestTarget.disabled = !counter;
  }

  function addCustomSideQuest(event) {
    event.preventDefault();
    const title = els.sideQuestTitle.value.trim();
    if (!title) return;
    const type = els.sideQuestType.value === "counter" ? "counter" : "switch";
    const target = type === "counter" ? clamp(els.sideQuestTarget.value || 5, COUNTER_MIN, COUNTER_MAX) : 1;
    state.customSideQuests.push(normalizeCustom({
      id:`sq-${Date.now()}-${Math.random().toString(36).slice(2,7)}`,
      title,
      type,
      target,
      count:0,
      done:false,
      awarded:false
    }));
    els.sideQuestTitle.value = "";
    els.sideQuestType.value = "switch";
    els.sideQuestTarget.value = "5";
    syncAddTypeUi();
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
    const customSideQuests = state.customSideQuests.map(q => ({ ...q, count:0, done:false, awarded:false }));
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
  els.sideQuestType.addEventListener("change", syncAddTypeUi);
  els.sideQuestAddForm.addEventListener("submit", addCustomSideQuest);
  els.customSideQuestList.addEventListener("click", e => {
    const toggle = e.target.closest("[data-toggle-sidequest]");
    if (toggle) return toggleCustomSideQuest(toggle.dataset.toggleSidequest);
    const minus = e.target.closest("[data-counter-minus]");
    if (minus) {
      const quest = state.customSideQuests.find(q => q.id === minus.dataset.counterMinus);
      if (quest) setCustomCounter(quest.id, quest.count - 1);
      return;
    }
    const plus = e.target.closest("[data-counter-plus]");
    if (plus) {
      const quest = state.customSideQuests.find(q => q.id === plus.dataset.counterPlus);
      if (quest) setCustomCounter(quest.id, quest.count + 1);
      return;
    }
    const step = e.target.closest("[data-counter-step][data-counter-id]");
    if (step) setCustomCounter(step.dataset.counterId, Number(step.dataset.counterStep));
  });
  els.sideQuestManager.addEventListener("click", e => {
    const btn = e.target.closest("[data-delete-sidequest]");
    if (btn) deleteCustomSideQuest(btn.dataset.deleteSidequest);
  });
  if (els.resetBtn) els.resetBtn.addEventListener("click", resetDailySideQuests);

  syncAddTypeUi();
  save();
  renderWater();
  renderMeds();
  renderCustomSideQuests();
  syncXpUi();
  setInterval(syncXpUi, 750);
})();