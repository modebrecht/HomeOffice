(() => {
  const tasks = [
    {
      id: 1,
      icon: "🎨",
      title: "Game-Figur entwickeln",
      time: "30–60 Minuten",
      type: "focus",
      body: `
        <p>Erfinde eine Figur für ein mögliches Game. Mensch, Tier, Roboter, Fantasiewesen – alles ist erlaubt.</p>
        <ul>
          <li>Wer oder was ist die Figur?</li>
          <li>Wo lebt sie und was ist ihr Dasein in dieser Welt?</li>
          <li>Was will sie erreichen – und warum?</li>
          <li>Welche Fähigkeiten besitzt sie oder könnte sie später lernen?</li>
          <li>Welche Quest könnte sie bekommen?</li>
          <li>Welches Genre passt dazu?</li>
        </ul>
        <div class="hint">Du musst noch kein fertiges Spiel bauen. Heute geht es darum, dass eine Idee Form bekommt.</div>`
    },
    {
      id: 2,
      icon: "🌿",
      title: "Bewusste Pause",
      time: "10 Minuten",
      type: "light",
      body: `
        <p>Mach innerlich Pause. Einfach für dich sein.</p>
        <ul>
          <li>Kein Auftrag.</li>
          <li>Kein schlechtes Gewissen.</li>
          <li>Kein „Ich müsste noch schnell …“.</li>
        </ul>
        <div class="hint">Du hast dir diese Pause verdient.</div>`
    },
    {
      id: 3,
      icon: "🧹",
      title: "Haushalt",
      time: "20–60 Minuten",
      type: "focus",
      body: `
        <p>Mach etwas im Haushalt: Küche, Geschirr, Staubsaugen, Oberflächen, Bad, Wäsche oder Dinge versorgen.</p>
        <div class="hint">Ziel: Danach soll etwas sichtbar sauberer sein als vorher. Bonus: blitzblank. ✨</div>`
    },
    {
      id: 4,
      icon: "🛏️",
      title: "Zimmer aufräumen",
      time: "20–45 Minuten",
      type: "focus",
      body: `
        <p>Räume dein Zimmer oder deinen persönlichen Bereich auf.</p>
        <p>Konzentriere dich besonders auf Dinge, die dich schon länger stören.</p>
        <div class="hint">Ziel: Beim nächsten Betreten soll es sich einfach besser anfühlen.</div>`
    },
    {
      id: 5,
      icon: "❤️",
      title: "Dankbarkeit",
      time: "10–15 Minuten",
      type: "light",
      body: `
        <p>Nenne drei Dinge, für die du <b>heute</b> dankbar bist.</p>
        <p>Schreibe zu jedem Punkt auch auf: <b>Warum ist mir genau das heute wichtig?</b></p>
        <div class="hint">Es müssen keine grossen Dinge sein. Kleine Dinge zählen genauso.</div>`
    },
    {
      id: 6,
      icon: "📖",
      title: "Game-Story schreiben",
      time: "30–60 Minuten",
      type: "focus",
      body: `
        <p>Schreibe den Anfang einer Story, die später der Einstieg in ein Game werden könnte.</p>
        <ul>
          <li>Wo beginnt die Geschichte?</li>
          <li>Wer ist die Hauptfigur?</li>
          <li>Was passiert plötzlich?</li>
          <li>Was stimmt in dieser Welt nicht?</li>
          <li>Warum muss die Figur handeln?</li>
          <li>Was möchte man danach unbedingt herausfinden?</li>
        </ul>
        <div class="hint">Du musst die Geschichte nicht fertig schreiben. Ein Anfang, der neugierig macht, reicht.</div>`
    },
    {
      id: 7,
      icon: "📚",
      title: "Let Them lesen",
      time: "15–30 Minuten",
      type: "light",
      body: `
        <p>Öffne <a href="https://let-them.vercel.app" target="_blank" rel="noopener" style="color:#b9c4ff">let-them.vercel.app</a> und lies eine Kapitelzusammenfassung.</p>
        <p>Danach: Welcher Gedanke ist dir besonders aufgefallen – und warum könnte er für dein eigenes Leben wichtig sein?</p>
        <div class="hint">Du musst nicht mit allem einverstanden sein. Ein Gedanke zum Mitnehmen reicht.</div>`
    },
    {
      id: 8,
      icon: "💡",
      title: "Drei Game- oder App-Konzepte",
      time: "60–180 Minuten",
      type: "focus",
      body: `
        <p>Entwickle <b>drei verschiedene Konzepte</b>. Inspiration aus Google Play, App Store oder Steam ist erlaubt – jedes Konzept braucht aber mindestens einen eigenen Twist.</p>

        <h4>Für jedes Konzept</h4>
        <ul>
          <li><b>Grundidee:</b> Was passiert?</li>
          <li><b>Kernmechanik:</b> Was macht der Spieler immer wieder?</li>
          <li><b>Ziel:</b> Was möchte man erreichen?</li>
          <li><b>Eigener Twist:</b> Was macht die Idee anders?</li>
        </ul>

        <h4>Welche Elemente sind zwingend?</h4>
        <p>Wähle bewusst nur die Systeme, die dein Konzept wirklich braucht. Zum Beispiel:</p>
        <ul>
          <li><b>Progression:</b> Wird der Charakter stärker, schneller oder erhält bessere Werkzeuge?</li>
          <li><b>Items & Ausrüstung:</b> Kleidung, Waffen, Werkzeuge, kosmetische oder starke Items?</li>
          <li><b>Talentbaum:</b> Kann man unterschiedliche Entwicklungswege wählen?</li>
          <li><b>Fähigkeiten:</b> Dash, Doppelsprung, Magie, Grappling Hook, Schild, Spezialaktionen?</li>
          <li><b>Levelauswahl / Gebiete:</b> Einzelne Level, offene Welt, Wald, Schnee, Stadt, Weltraum?</li>
          <li><b>Freischaltungen:</b> Charaktere, Skins, Gebiete, Spielmodi, Gebäude?</li>
          <li><b>Ascend / Prestige:</b> Fortschritt teilweise zurücksetzen und dafür dauerhaft stärker werden?</li>
          <li><b>Idle:</b> Produziert oder sammelt etwas weiter, während man nicht spielt?</li>
          <li><b>Wirtschaft:</b> Coins, Ressourcen, Materialien – und wofür braucht man sie?</li>
          <li><b>Quests:</b> Hauptquests, Nebenquests oder kleine Herausforderungen?</li>
          <li><b>Belohnungen:</b> Warum fühlt sich Fortschritt gut an?</li>
          <li><b>Wiederspielwert:</b> Warum öffnet jemand das Game morgen wieder?</li>
        </ul>

        <h4>Optional visualisieren</h4>
        <p>Wenn du testen möchtest, wie eine Figur, Welt oder App wirken könnte, nutze eine Image-Arena oder ein Bildgenerierungs-Tool und vergleiche verschiedene Beschreibungen.</p>

        <h4>Am Schluss</h4>
        <p>Wähle einen Favoriten und notiere die <b>drei wichtigsten Elemente</b>, ohne die dieses Konzept nicht funktionieren würde.</p>

        <div class="hint">Mehr Systeme machen ein Game nicht automatisch besser. Entscheidend ist: Was braucht genau diese Idee?</div>`
    },
    {
      id: 9,
      icon: "🚶",
      title: "Bewegung & frische Luft",
      time: "15–30 Minuten",
      type: "light",
      body: `
        <p>Verlasse deinen Arbeitsplatz und geh kurz nach draussen.</p>
        <p>Spazieren, etwas holen oder einfach ein paar Minuten frische Luft.</p>
        <div class="hint">Kein Arbeitsauftrag. Dein Gehirn darf etwas anderes sehen als den Bildschirm.</div>`
    },
    {
      id: 10,
      icon: "☕",
      title: "Tee- oder Getränkepause",
      time: "10 Minuten",
      type: "light",
      body: `
        <p>Mach dir einen Tee, Kaffee oder ein anderes Getränk.</p>
        <p>Setz dich kurz hin und trink bewusst. Nicht nebenbei arbeiten.</p>
        <div class="hint">Diese zehn Minuten müssen nichts produzieren.</div>`
    },
    {
      id: 11,
      icon: "🧘",
      title: "Meditation / Ruhe",
      time: "5–10 Minuten",
      type: "light",
      body: `
        <p>Setz oder leg dich bequem hin. Augen offen oder geschlossen – beides ist okay.</p>
        <p>Beobachte deinen Atem oder die Geräusche um dich herum. Wenn Gedanken kommen, musst du nichts damit machen.</p>
        <div class="hint">Es gibt nichts zu erreichen. Einfach kurz da sein.</div>`
    },
    {
      id: 12,
      icon: "📘",
      title: "Buch lesen",
      time: "10–20 Minuten",
      type: "light",
      body: `
        <p>Nimm ein Buch, das dich interessiert, und lies ein paar Seiten.</p>
        <p>Kein Lernziel, keine Zusammenfassung und kein Pflichtpensum.</p>
        <div class="hint">Einfach lesen, bis die Zeit vorbei ist – oder bis es sich nach genug anfühlt.</div>`
    }
  ];

  const els = {
    startScreen: document.getElementById("startScreen"),
    randomScreen: document.getElementById("randomScreen"),
    finalScreen: document.getElementById("finalScreen"),
    startBtn: document.getElementById("startBtn"),
    rollBtn: document.getElementById("rollBtn"),
    doneBtn: document.getElementById("doneBtn"),
    finishBtn: document.getElementById("finishBtn"),
    resetBtn: document.getElementById("resetBtn"),
    cube: document.getElementById("cube"),
    cubeShadow: document.getElementById("cubeShadow"),
    rollLabel: document.getElementById("rollLabel"),
    taskCard: document.getElementById("taskCard"),
    taskIcon: document.getElementById("taskIcon"),
    taskTitle: document.getElementById("taskTitle"),
    taskTime: document.getElementById("taskTime"),
    taskCategory: document.getElementById("taskCategory"),
    taskBody: document.getElementById("taskBody"),
    timer: document.getElementById("timer"),
    timerSub: document.getElementById("timerSub"),
    statusPill: document.getElementById("statusPill"),
    history: document.getElementById("history"),
    weightText: document.getElementById("weightText"),
    weightBar: document.getElementById("weightBar"),
    bonusText: document.getElementById("bonusText"),
    finalStart: document.getElementById("finalStart"),
    finalEnd: document.getElementById("finalEnd"),
    finalDuration: document.getElementById("finalDuration"),
    finalTasks: document.getElementById("finalTasks"),
    startTimePreview: document.getElementById("startTimePreview")
  };

  let startedAt = null;
  let endedAt = null;
  let timerHandle = null;
  let currentTask = null;
  let lastCompletedType = null;
  let completed = [];
  let rolling = false;

  const fmtClock = date => date.toLocaleTimeString("de-CH", {hour:"2-digit", minute:"2-digit"});
  const fmtDuration = ms => {
    const sec = Math.max(0, Math.floor(ms / 1000));
    const h = String(Math.floor(sec / 3600)).padStart(2,"0");
    const m = String(Math.floor((sec % 3600) / 60)).padStart(2,"0");
    const s = String(sec % 60).padStart(2,"0");
    return `${h}:${m}:${s}`;
  };

  function showScreen(name){
    [els.startScreen, els.randomScreen, els.finalScreen].forEach(s => s.classList.remove("active"));
    els[name].classList.add("active");
  }

  function startTimer(){
    startedAt = new Date();
    endedAt = null;
    els.startTimePreview.textContent = fmtClock(startedAt);
    els.statusPill.textContent = "Homeoffice läuft";
    els.timerSub.textContent = `Gestartet um ${fmtClock(startedAt)}`;
    els.finishBtn.disabled = false;
    updateTimer();
    timerHandle = setInterval(updateTimer, 1000);
    showScreen("randomScreen");
  }

  function updateTimer(){
    if(!startedAt) return;
    const end = endedAt || new Date();
    els.timer.textContent = fmtDuration(end - startedAt);
  }

  function currentLightBonus(){
    return lastCompletedType === "focus" ? 0.40 : 0;
  }

  function updateBalance(){
    const bonus = currentLightBonus();
    els.bonusText.textContent = bonus ? "+40 %" : "0 %";
    els.weightText.textContent = bonus
      ? "Der letzte erledigte Task war Arbeit / Creative. Lightweight wird beim nächsten Wurf um 40 % höher gewichtet."
      : "Normaler Mix aus Focus und Lightweight.";
    els.weightBar.style.width = bonus ? "72%" : "50%";
  }

  function chooseWeightedTask(){
    const bonus = currentLightBonus();
    const pool = tasks.filter(t => !currentTask || t.id !== currentTask.id);
    const weighted = pool.map(task => ({
      task,
      weight: task.type === "light" ? 1 * (1 + bonus) : 1
    }));

    const total = weighted.reduce((sum, item) => sum + item.weight, 0);
    let r = Math.random() * total;

    for (const item of weighted){
      r -= item.weight;
      if(r <= 0) return item.task;
    }
    return weighted.at(-1).task;
  }

  function renderTask(task){
    currentTask = task;
    els.taskIcon.textContent = task.icon;
    els.taskTitle.textContent = `Task ${task.id} · ${task.title}`;
    els.taskTime.textContent = `Zeit: ${task.time}`;
    els.taskCategory.textContent = task.type === "light" ? "Lightweight" : "Work / Creative";
    els.taskCategory.classList.toggle("focus", task.type === "focus");
    els.taskBody.innerHTML = task.body;
    els.taskCard.classList.remove("hidden");
    els.doneBtn.disabled = false;
    els.rollBtn.disabled = true;
    els.rollLabel.textContent = `${task.icon} ${task.title}`;
  }

  function roll(){
    if(rolling || !startedAt) return;
    rolling = true;
    els.rollBtn.disabled = true;
    els.doneBtn.disabled = true;
    els.taskCard.classList.add("hidden");
    els.rollLabel.textContent = "Der Würfel entscheidet …";
    els.cube.classList.remove("rolling");
    void els.cube.offsetWidth;
    els.cube.classList.add("rolling");
    els.cubeShadow.style.transform = "translateY(148px) scale(.72)";
    els.cubeShadow.style.opacity = ".55";

    const chosen = chooseWeightedTask();

    setTimeout(() => {
      els.cubeShadow.style.transform = "translateY(148px) scale(1)";
      els.cubeShadow.style.opacity = "1";
      renderTask(chosen);
      rolling = false;
    }, 1750);
  }

  function markDone(){
    if(!currentTask) return;
    completed.push({
      id: currentTask.id,
      title: currentTask.title,
      icon: currentTask.icon,
      type: currentTask.type,
      at: new Date()
    });
    lastCompletedType = currentTask.type;
    renderHistory();
    updateBalance();
    els.doneBtn.disabled = true;
    els.rollBtn.disabled = false;
    els.taskCard.classList.add("hidden");
    els.rollLabel.textContent = "Erledigt. Wenn du weitermachen möchtest: neu würfeln.";
    currentTask = null;
  }

  function renderHistory(){
    if(!completed.length){
      els.history.innerHTML = `<li><span class="n">–</span><span>Noch kein Random-Task erledigt.</span></li>`;
      return;
    }
    els.history.innerHTML = completed.map((item, i) =>
      `<li><span class="n">${i+1}</span><span>${item.icon} ${item.title}</span></li>`
    ).join("");
  }

  function finish(){
    if(!startedAt) return;
    endedAt = new Date();
    clearInterval(timerHandle);
    updateTimer();

    els.finalStart.textContent = fmtClock(startedAt);
    els.finalEnd.textContent = fmtClock(endedAt);
    els.finalDuration.textContent = fmtDuration(endedAt - startedAt);
    els.finalTasks.innerHTML = completed.length
      ? completed.map((t,i) => `${i+1}. ${t.icon} ${t.title}`).join("<br>")
      : "Keine Random-Tasks als erledigt markiert.";

    els.statusPill.textContent = "Feierabend";
    els.finishBtn.disabled = true;
    showScreen("finalScreen");
    window.scrollTo({top:0, behavior:"smooth"});
  }

  function resetDay(){
    clearInterval(timerHandle);
    startedAt = null;
    endedAt = null;
    currentTask = null;
    lastCompletedType = null;
    completed = [];
    rolling = false;

    els.timer.textContent = "00:00:00";
    els.timerSub.textContent = "Noch nicht gestartet.";
    els.statusPill.textContent = "Noch nicht gestartet";
    els.startTimePreview.textContent = "–";
    els.finishBtn.disabled = true;
    els.rollBtn.disabled = false;
    els.doneBtn.disabled = true;
    els.taskCard.classList.add("hidden");
    els.rollLabel.textContent = "Bereit?";
    renderHistory();
    updateBalance();

    document.querySelectorAll("textarea").forEach(t => t.value = "");
    document.querySelectorAll(".feel").forEach(f => f.classList.remove("selected"));

    showScreen("startScreen");
    window.scrollTo({top:0, behavior:"smooth"});
  }

  document.getElementById("feelings").addEventListener("click", e => {
    const btn = e.target.closest(".feel");
    if(!btn) return;
    btn.classList.toggle("selected");
  });

  els.startBtn.addEventListener("click", startTimer);
  els.rollBtn.addEventListener("click", roll);
  els.doneBtn.addEventListener("click", markDone);
  els.finishBtn.addEventListener("click", finish);
  els.resetBtn.addEventListener("click", resetDay);

  updateBalance();
})();
