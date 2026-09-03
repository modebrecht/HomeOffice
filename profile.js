(() => {
  const FIRST_NAME_KEY = "homeoffice:first-name:v1";
  const titleEl = document.getElementById("brandTitle");

  let firstName = (localStorage.getItem(FIRST_NAME_KEY) || "").trim();
  if (!firstName) {
    const entered = window.prompt("Wie ist dein Vorname?");
    firstName = entered ? entered.trim() : "";
    if (firstName) localStorage.setItem(FIRST_NAME_KEY, firstName);
  }

  const appTitle = firstName ? `${firstName} Homeoffice` : "Homeoffice";
  if (titleEl) titleEl.textContent = appTitle;
  document.title = appTitle;
})();