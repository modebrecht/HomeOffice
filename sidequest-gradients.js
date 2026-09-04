(() => {
  const THEMES = [
    { a:'#0d2a46', b:'#155e75', c:'#3b82f6' },
    { a:'#111c44', b:'#3730a3', c:'#2563eb' },
    { a:'#0b2540', b:'#1d4ed8', c:'#60a5fa' },
    { a:'#102a43', b:'#0f766e', c:'#38bdf8' },
    { a:'#172554', b:'#4338ca', c:'#818cf8' },
    { a:'#0f2942', b:'#0369a1', c:'#22d3ee' },
    { a:'#18213f', b:'#334155', c:'#4f86c6' },
    { a:'#0c2238', b:'#1e40af', c:'#67e8f9' }
  ];

  function hash(value) {
    let h = 2166136261;
    const text = String(value || 'sidequest');
    for (let i = 0; i < text.length; i += 1) {
      h ^= text.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }

  function identity(card, index) {
    return card.dataset.sidequestId || card.id || card.querySelector('.sidequest-title')?.textContent?.trim() || `sidequest-${index}`;
  }

  function applyThemes() {
    const cards = [...document.querySelectorAll('#sideQuestGrid .sidequest')];
    cards.forEach((card, index) => {
      const key = identity(card, index);
      const themeIndex = hash(key) % THEMES.length;
      const theme = THEMES[themeIndex];
      card.dataset.gradientTheme = String(themeIndex + 1);
      card.style.setProperty('--sq-g1', theme.a);
      card.style.setProperty('--sq-g2', theme.b);
      card.style.setProperty('--sq-g3', theme.c);
    });
  }

  const style = document.createElement('style');
  style.id = 'sidequestGradientStyles';
  style.textContent = `
    #sideQuestGrid .sidequest{
      position:relative;
      overflow:hidden;
      isolation:isolate;
      background:
        radial-gradient(circle at 92% -20%,color-mix(in srgb,var(--sq-g3,#60a5fa) 42%,transparent),transparent 47%),
        linear-gradient(145deg,var(--sq-g1,#0d2a46) 0%,var(--sq-g2,#155e75) 62%,color-mix(in srgb,var(--sq-g3,#3b82f6) 70%,var(--sq-g2,#155e75)) 100%) !important;
      border-color:color-mix(in srgb,var(--sq-g3,#60a5fa) 30%,rgba(255,255,255,.12)) !important;
      box-shadow:
        inset 0 1px 0 rgba(255,255,255,.10),
        inset 0 -18px 34px rgba(0,0,0,.10),
        0 9px 24px rgba(0,0,0,.20),
        0 0 22px color-mix(in srgb,var(--sq-g3,#60a5fa) 8%,transparent);
      transition:transform .18s ease,border-color .18s ease,box-shadow .18s ease;
    }
    #sideQuestGrid .sidequest::before{
      content:'';
      position:absolute;
      inset:0;
      z-index:-1;
      pointer-events:none;
      background:
        linear-gradient(115deg,rgba(255,255,255,.10),transparent 30%,transparent 72%,rgba(255,255,255,.04)),
        radial-gradient(circle at 8% 10%,rgba(255,255,255,.08),transparent 34%);
    }
    #sideQuestGrid .sidequest:hover{
      border-color:color-mix(in srgb,var(--sq-g3,#60a5fa) 48%,rgba(255,255,255,.18)) !important;
      box-shadow:
        inset 0 1px 0 rgba(255,255,255,.12),
        inset 0 -18px 34px rgba(0,0,0,.09),
        0 11px 28px rgba(0,0,0,.22),
        0 0 28px color-mix(in srgb,var(--sq-g3,#60a5fa) 12%,transparent);
    }
    #sideQuestGrid .sidequest .sidequest-title,
    #sideQuestGrid .sidequest .sidequest-value{color:#f8fbff}
    #sideQuestGrid .sidequest .sidequest-status{color:rgba(226,236,255,.78)}
    #sideQuestGrid .sidequest .sidequest-status.done{color:#d7fff6}
    @media(prefers-reduced-motion:reduce){#sideQuestGrid .sidequest{transition:none}}
  `;
  document.head.appendChild(style);

  applyThemes();
  const root = document.documentElement;
  const observer = new MutationObserver(() => applyThemes());
  observer.observe(root, { childList:true, subtree:true });
})();