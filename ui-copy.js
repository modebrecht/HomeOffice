(() => {
  const setText = (el, text) => {
    if (el && el.textContent !== text) el.textContent = text;
  };

  function cleanCopy() {
    const status = document.getElementById('statusPill');
    if (status) {
      if (status.textContent === 'Noch nicht gestartet') setText(status, 'Nicht gestartet');
      else if (status.textContent === 'Homeoffice läuft') setText(status, 'Läuft');
      else if (status.textContent === 'Feierabend') setText(status, 'Beendet');
    }

    const timerSub = document.getElementById('timerSub');
    if (timerSub) {
      if (timerSub.textContent === 'Noch nicht gestartet.') setText(timerSub, 'Nicht gestartet');
      else if (timerSub.textContent === 'Homeoffice beendet.') setText(timerSub, 'Beendet');
      else if (timerSub.textContent.startsWith('Gestartet um ')) {
        setText(timerSub, timerSub.textContent.replace('Gestartet um ', 'Start '));
      }
    }

    const weightText = document.getElementById('weightText');
    if (weightText) {
      const match = weightText.textContent.match(/(\d+)\s*%/);
      if (match) setText(weightText, `Lightweight +${match[1]} %`);
    }

    const finishToggleText = document.getElementById('finishToggleText');
    if (finishToggleText) {
      if (finishToggleText.textContent === 'Task fertig? AN') setText(finishToggleText, 'Fertig AN');
      else if (finishToggleText.textContent === 'Task fertig? AUS') setText(finishToggleText, 'Fertig AUS');
    }

    const taskTime = document.getElementById('taskTime');
    if (taskTime?.textContent.startsWith('Empfohlene Zeit: ')) {
      setText(taskTime, taskTime.textContent.replace('Empfohlene Zeit: ', 'Zeit: '));
    }

    const rollLabel = document.getElementById('rollLabel');
    if (rollLabel) {
      if (rollLabel.textContent === 'Der Würfel entscheidet …') setText(rollLabel, 'Würfeln …');
      else {
        const completed = rollLabel.textContent.match(/^Quest abgeschlossen · \+(\d+) XP\. Bereit für den nächsten Wurf\?$/);
        if (completed) setText(rollLabel, `+${completed[1]} XP`);
      }
    }

    const repeatHelp = document.getElementById('repeatHelp');
    if (repeatHelp) {
      const activeRepeat = document.querySelector('.repeat-option.active')?.dataset.repeat;
      setText(repeatHelp, activeRepeat === 'no' ? 'Nur heute' : 'Dauerhaft');
    }

    const history = document.getElementById('history');
    if (history && history.textContent.includes('Noch kein Random-Task erledigt.')) {
      history.innerHTML = '<li><span class="n">–</span><span>Keine</span></li>';
    }

    const finalTasks = document.getElementById('finalTasks');
    if (finalTasks && /Keine Random-Tasks abgeschlossen\.|Noch keine erledigten Tasks\./.test(finalTasks.textContent.trim())) {
      setText(finalTasks, 'Keine');
    }

    const customTaskList = document.getElementById('customTaskList');
    if (customTaskList && customTaskList.textContent.includes('Noch keine Custom Quests.')) {
      customTaskList.innerHTML = '<div class="tiny">Keine</div>';
    }
  }

  const observer = new MutationObserver(cleanCopy);

  if (document.body) {
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
    cleanCopy();
  } else {
    document.addEventListener('DOMContentLoaded', () => {
      observer.observe(document.body, { childList: true, subtree: true, characterData: true });
      cleanCopy();
    }, { once: true });
  }
})();
