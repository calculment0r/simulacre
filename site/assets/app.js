/* ════════════════════════════════════════════════════════════════
   LA SOCIÉTÉ DU SIMULACRE — lecteur des fragments
   Rend les 221 fragments par chapitre depuis window.THESES / window.CHAPITRES.
   ════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  const T = window.THESES || [];
  const CH = window.CHAPITRES || [];

  const EPIGRAPHE =
    "nul n'a jamais autant transformé le monde qu'en affirmant ne pas y toucher. l'innocence est la forme que prend aujourd'hui la puissance qui a cessé d'avoir besoin de se légitimer.";

  const $ = (s, r = document) => r.querySelector(s);
  const esc = (s) =>
    String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  const md = (s) =>
    esc(s)
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/\*([^*]+)\*/g, '<em>$1</em>');
  const pad = (n) => String(n).padStart(2, '0');
  const pad3 = (n) => String(n).padStart(3, '0');
  const paras = (txt) =>
    String(txt == null ? '' : txt)
      .split(/\n{2,}/)
      .map((p) => p.trim())
      .filter(Boolean)
      .map((p) => `<p>${md(p).replace(/\n/g, '<br>')}</p>`)
      .join('');

  const byChapter = (ch) => T.filter((t) => t.chapitre === ch).sort((a, b) => a.n - b.n);
  const chapterOfN = (n) => {
    const t = T.find((x) => x.n === n);
    return t ? t.chapitre : null;
  };
  const chMeta = (ch) => CH.find((c) => c.ch === ch);

  function parseHash() {
    const h = location.hash.replace(/^#/, '');
    let m;
    if ((m = h.match(/^f-(\d+)$/))) return { chapitre: chapterOfN(+m[1]) || 1, focus: +m[1] };
    if ((m = h.match(/^ch-(\d+)$/))) return { chapitre: +m[1], focus: null };
    return { chapitre: 1, focus: null };
  }

  // ── SIDEBAR ─────────────────────────────────────────────────────
  function renderSidebar(activeCh) {
    const chips = CH.map(
      (c) => `
      <li><a href="#ch-${c.ch}" class="${c.ch === activeCh ? 'active' : ''}" data-ch="${c.ch}" title="${esc(c.logline || '')}">
        <span class="num">${pad(c.ch)}</span>
        <span class="nm">${esc(c.titre)}</span>
        <span class="rg">${c.min}–${c.max}</span>
      </a></li>`
    ).join('');

    $('#sidebar').innerHTML = `
      <div class="brand">
        <a href="#ch-1">
          <div class="kicker">NIRVALAB · 2026</div>
          <div class="title">la société du <span class="lp">simulacre</span></div>
        </a>
      </div>

      <button class="theme-toggle" id="themeToggle" title="changer de thème">◐ thème <span id="themeLabel"></span></button>

      <form class="jump" id="jumpForm">
        <label for="jumpN">N°</label>
        <input id="jumpN" type="number" min="1" max="221" placeholder="1–221" inputmode="numeric">
        <button type="submit">aller</button>
      </form>

      <nav>
        <div class="nav-label">Les neuf chapitres</div>
        <ul class="chapters">${chips}</ul>
      </nav>

      <div class="side-foot">
        <span style="color:var(--dim)">NIRVALAB · 2026 · 221 fragments</span>
      </div>`;

    $('#jumpForm').addEventListener('submit', (e) => {
      e.preventDefault();
      let n = parseInt($('#jumpN').value, 10);
      if (!n || n < 1) n = 1;
      if (n > 221) n = 221;
      location.hash = 'f-' + n;
      $('#jumpN').value = '';
    });

    const tt = $('#themeToggle');
    if (tt) {
      const setLbl = () => { const l = $('#themeLabel'); if (l) l.textContent = document.documentElement.classList.contains('dark') ? 'clair' : 'sombre'; };
      setLbl();
      tt.onclick = () => {
        const dark = document.documentElement.classList.toggle('dark');
        try { localStorage.setItem('sim_theme', dark ? 'dark' : 'light'); } catch (e) {}
        setLbl();
      };
    }

    if (window.GodMode) window.GodMode.onRenderSidebar($('#sidebar'));
  }

  // ── une entrée (fragment) ───────────────────────────────────────
  function renderEntry(t) {
    const meta = chMeta(t.chapitre);
    const gm = window.GodMode;
    const text = (gm && gm.activeFragment(t.n)) || t.fragment;
    const controls = gm && gm.isOn() ? gm.controlsHTML(t) : '';
    return `<article class="entry" id="f-${t.n}">
      <div class="entry-label"><span class="n">fragment ${pad3(t.n)}</span> · ch.${pad(
      t.chapitre
    )} ${esc(meta ? meta.titre : '')}</div>
      <div class="fragment-text">${paras(text)}</div>
      ${gm && gm.likeHTML ? gm.likeHTML(t.n) : ''}
      ${controls}
    </article>`;
  }

  // ── masthead (cover) — uniquement en tête du chapitre 1 ──────────
  function masthead() {
    return `<header class="masthead">
      <h1 class="mast-title">la société du <span class="lp">simulacre</span></h1>
      <blockquote class="mast-epi">${esc(EPIGRAPHE)}<cite>— NIRVALAB, 2026</cite></blockquote>
    </header>`;
  }

  // ── rendu d'un chapitre ─────────────────────────────────────────
  function renderChapter(ch) {
    const meta = chMeta(ch);
    const list = byChapter(ch);
    const prev = chMeta(ch - 1);
    const next = chMeta(ch + 1);

    const head = `<header class="ch-head">
      <div class="label">Chapitre ${pad(ch)} · ${meta.min}–${meta.max}${meta.cat ? ' · ' + esc(meta.cat) : ''}</div>
      <h1>${esc(meta.titre)}</h1>
      <div class="sub">${esc(meta.logline || '')}</div>
    </header>`;

    const entries = list.map(renderEntry).join('');

    const foot = `<nav class="ch-foot">
      ${prev ? `<a class="prev" href="#ch-${prev.ch}"><span class="dir">← chapitre ${pad(prev.ch)}</span>${esc(prev.titre)}</a>` : '<span></span>'}
      ${next ? `<a class="next" href="#ch-${next.ch}"><span class="dir">chapitre ${pad(next.ch)} →</span>${esc(next.titre)}</a>` : ''}
    </nav>`;

    $('#content').innerHTML = (ch === 1 ? masthead() : '') + head + entries + foot;
    if (window.GodMode) {
      window.GodMode.onRenderChapter($('#content'));
      if (window.GodMode.wireLikes) window.GodMode.wireLikes($('#content')); // cœur sur le fil, tous modes
    }
  }

  // ── orchestration ───────────────────────────────────────────────
  function route() {
    // dashboard god mode « mon atelier »
    if (location.hash === '#mine' && window.GodMode && window.GodMode.isOn() && window.GodMode.renderDashboard) {
      renderSidebar(0);
      window.GodMode.renderDashboard($('#content'));
      document.body.classList.remove('nav-open');
      window.scrollTo(0, 0);
      return;
    }
    const { chapitre, focus } = parseHash();
    renderSidebar(chapitre);
    renderChapter(chapitre);
    document.body.classList.remove('nav-open');
    if (focus) {
      const el = document.getElementById('f-' + focus);
      if (el) {
        el.scrollIntoView({ behavior: 'auto', block: 'start' });
        el.style.transition = 'background 1.4s';
        el.style.background = 'rgba(201,255,60,0.05)';
        setTimeout(() => (el.style.background = 'transparent'), 1500);
      }
    } else {
      window.scrollTo(0, 0);
    }
  }

  window.addEventListener('hashchange', route);
  window.__simRoute = route; // permet à god mode de redéclencher le rendu

  const prog = $('#prog');
  if (prog)
    window.addEventListener(
      'scroll',
      () => {
        const total = document.documentElement.scrollHeight - window.innerHeight;
        prog.style.width = total > 0 ? (window.scrollY / total) * 100 + '%' : '0%';
      },
      { passive: true }
    );

  const mb = $('#menuBtn');
  if (mb) mb.addEventListener('click', () => document.body.classList.toggle('nav-open'));

  if (!T.length) {
    $('#content').innerHTML =
      '<p style="font-family:var(--mono);color:var(--red)">Données absentes : data/theses.js introuvable.</p>';
    return;
  }
  route();
})();
