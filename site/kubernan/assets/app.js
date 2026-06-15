/* ════════════════════════════════════════════════════════════════
   KUBERNÂN, OÙ SORTIR ? — lecteur (carte)
   Rend la préface + 4 bifurcations depuis window.KUBERNAN.
   Thème Oblivion partagé (../assets/oblivion.css).
   ════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  const K = window.KUBERNAN || {};
  const BIFS = K.bifurcations || [];
  const META = K.meta || {};

  const $ = (s, r = document) => r.querySelector(s);
  const esc = (s) =>
    String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  // ── lexique en couleur (cf. BRIEF_concepts_en_couleur) ──────────
  // mot entier ; jamais dans les titres (eux passent par esc(), pas md()).
  // classe de lettres sans lookbehind (compat. Safari) : on capture la
  // frontière de gauche et on la réémet.
  const LET = 'A-Za-zÀ-ÿ';
  // noyau : chaque occurrence
  const RE_CORE = new RegExp(`(^|[^${LET}])(Simulacre|Simulation|Focus|Grand Dehors|[Kk]ubernân)(?![${LET}])`, 'g');
  // sécession : uniquement sur le chiasme (« sécession du calcul … »)
  const RE_SECESSION = new RegExp(`(^|[^${LET}])(sécession)(?= du calcul)`, 'g');
  // « sortir » : ciblé (« ne plus réformer la cité, en sortir »)
  const RE_SORTIR = /(réformer la cité, en )(sortir)/g;
  // second cercle : première occurrence seulement (par passe de rendu)
  const SECOND = [
    ['pleonexie', new RegExp(`(^|[^${LET}])(pléonexie)(?![${LET}])`)],
    ['desencastrement', new RegExp(`(^|[^${LET}])(désencastrement)(?![${LET}])`)],
    ['reencastrement', new RegExp(`(^|[^${LET}])(ré-encastrement|ré-encastré)(?![${LET}])`)],
  ];
  const seenConcepts = new Set();
  const wrap = (pre, w) => `${pre}<span class="concept">${w}</span>`;
  const concepts = (t) => {
    t = t.replace(RE_CORE, (m, pre, w) => wrap(pre, w));
    t = t.replace(RE_SECESSION, (m, pre, w) => wrap(pre, w));
    t = t.replace(RE_SORTIR, (m, pre, w) => wrap(pre, w));
    for (const [key, re] of SECOND) {
      if (seenConcepts.has(key)) continue;
      let hit = false;
      t = t.replace(re, (m, pre, w) => { hit = true; return wrap(pre, w); });
      if (hit) seenConcepts.add(key);
    }
    return t;
  };

  const md = (s) =>
    concepts(
      esc(s)
        .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
        .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    )
      .replace(/«\s/g, '«&nbsp;')
      .replace(/\s([?!:;»])/g, '&nbsp;$1');
  const paras = (arr) => (arr || []).map((p) => `<p>${md(p)}</p>`).join('');
  const bifByN = (n) => BIFS.find((b) => b.n === n);

  // ── routage ─────────────────────────────────────────────────────
  // ''/seuil · preface · b-<n> · b-<n>-<k> (focus section) · dehors
  function parseHash() {
    const h = location.hash.replace(/^#/, '');
    if (!h || h === 'seuil' || h === 'preface') return { view: 'home' };
    if (h === 'coda' || h === 'dehors') return { view: 'coda' };
    let m;
    if ((m = h.match(/^b-(\d+)(?:-(\d+|c))?$/))) {
      const n = +m[1];
      if (bifByN(n)) return { view: 'bif', n, focus: m[2] ? h : null };
    }
    return { view: 'seuil' };
  }

  const labelOf = (key) => {
    if (key === 'seuil') return 'le seuil';
    if (key === 'preface') return 'Préface';
    if (key === 'coda') return 'Enfin dehors';
    const b = bifByN(+key.split('-')[1]);
    return b ? b.titre : key;
  };

  // ── SIDEBAR ─────────────────────────────────────────────────────
  function renderSidebar(route) {
    const isBif = route.view === 'bif';

    const prefLi = `
      <li><a href="#seuil" class="${route.view === 'home' ? 'active' : ''}">
        <span class="num">00</span>
        <span class="nm">Préface</span>
        <span class="rg">le commencement</span>
      </a></li>`;

    const bifLis = BIFS.map((b) => {
      const active = isBif && route.n === b.n;
      let sub = '';
      if (active) {
        sub =
          '<ul class="subnav">' +
          b.sections
            .map(
              (s) => `<li><a href="#${s.id}" data-sub="${s.id}">
                <span class="sn-num">${esc(s.num)}</span>
                <span class="sn-nm">${esc(s.titre)}</span>
              </a></li>`
            )
            .join('') +
          `<li><a href="#${b.id}-c" data-sub="${b.id}-c">
                <span class="sn-num">↘</span>
                <span class="sn-nm">Conclusion</span>
              </a></li>` +
          '</ul>';
      }
      return `
      <li><a href="#b-${b.n}" class="${active ? 'active' : ''}" data-ch="${b.n}">
        <span class="num">${esc(b.roman)}</span>
        <span class="nm">${esc(b.titre)}<small>${esc(b.sous_titre)}</small></span>
      </a>${sub}</li>`;
    }).join('');

    const codaLi = `
      <li class="nav-sep"><span>au-delà de la passe</span></li>
      <li><a href="#coda" class="coda-nav ${route.view === 'coda' ? 'active' : ''}">
        <span class="num">∮</span>
        <span class="nm">Enfin dehors<small>la coda · une lettre</small></span>
      </a></li>`;

    $('#sidebar').innerHTML = `
      <div class="brand">
        <a href="#seuil">
          <div class="kicker">${esc(META.serie || 'tétralogie · livre III')}</div>
          <div class="title">kubernân,<br><span class="lp">où sortir ?</span></div>
        </a>
      </div>

      <nav>
        <div class="nav-label">La traversée</div>
        <ul class="chapters">${prefLi}${bifLis}${codaLi}</ul>
      </nav>

      <div class="side-foot">
        <a href="../">← la société du simulacre</a><br>
        <span style="color:var(--dim)">tétralogie · livre III</span>
      </div>`;
  }

  // ── pages ───────────────────────────────────────────────────────
  // home = le titre + la préface (la navigation est dans la sidebar, pas de sommaire)
  function homeHTML() {
    const p = K.preface || { paras: [] };
    return `<section class="cover">
        <div class="cover-kicker">${esc(META.serie || '')}</div>
        <h1>kubernân, <span class="lp">où sortir&nbsp;?</span></h1>
        <p class="cover-here">nous sommes ici</p>
        <div class="prose lead cover-preface">${paras(p.paras)}</div>
        <div class="sig">— <span class="concept">Focus</span></div>
        <a class="suite" href="#b-1">
          <span class="suite-k">Première bifurcation</span>
          <span class="suite-t">L'Archipel <span class="arr">→</span></span>
        </a>
      </section>`;
  }

  function bifHTML(b) {
    const sections = b.sections
      .map(
        (s) => `<article class="entry" id="${s.id}">
          <div class="entry-label"><span class="sn">${esc(s.num)}</span> · ${esc(s.titre)}</div>
          <div class="prose">${paras(s.paras)}</div>
        </article>`
      )
      .join('');

    const concl = b.conclusion
      ? `<article class="entry concl" id="${b.id}-c">
          <div class="entry-label"><span class="sn">Conclusion</span> · ${esc(b.conclusion.bridge)}</div>
          <div class="prose">${paras(b.conclusion.paras)}</div>
        </article>`
      : '';

    // lien « suite » : bifurcation suivante, ou « Enfin dehors » après la IV
    const nextBif = bifByN(b.n + 1);
    let suite;
    if (nextBif) {
      suite = `<a class="suite" href="#b-${nextBif.n}">
          <span class="suite-k">Bifurcation ${esc(nextBif.roman)} · ${esc(nextBif.sous_titre)}</span>
          <span class="suite-t">${esc(nextBif.titre)} <span class="arr">→</span></span>
        </a>`;
    } else {
      suite = `<a class="suite" href="#coda">
          <span class="suite-k">La coda · au-delà de la passe</span>
          <span class="suite-t">Enfin dehors <span class="arr">→</span></span>
        </a>`;
    }

    const prevKey = b.n === 1 ? 'preface' : 'b-' + (b.n - 1);
    const prevHash = b.n === 1 ? '#preface' : '#b-' + (b.n - 1);

    return `<header class="ch-head">
        <div class="label">Bifurcation ${esc(b.roman)} — ${esc(b.titre)}</div>
        <h1>${esc(b.titre)}</h1>
        <div class="sub">${esc(b.sous_titre)}</div>
      </header>
      <div class="prose lead bif-intro">${paras(b.intro)}</div>
      ${sections}
      ${concl}
      ${suite}
      <nav class="ch-foot">
        <a class="prev" href="${prevHash}"><span class="dir">← précédent</span>${esc(labelOf(prevKey))}</a>
      </nav>`;
  }

  function codaHTML() {
    const c = K.coda || { seuil: [], lettre: { paras: [] } };
    const L = c.lettre || { paras: [] };
    return `<section class="coda">
        <a class="coda-back" href="#b-4">← retour à la carte</a>
        <div class="coda-seuil">
          <div class="coda-void" aria-hidden="true"></div>
          <div class="prose seuil-prose">${paras(c.seuil)}</div>
        </div>
        <article class="coda-letter">
          <h1>${esc(L.titre || 'Enfin dehors')}</h1>
          <div class="coda-sub">${esc(L.sous_titre || '')}</div>
          <div class="prose letter-prose">${paras(L.paras)}</div>
          <div class="coda-sig">— Nicolas</div>
        </article>
        <nav class="ch-foot">
          <a class="prev" href="#b-4"><span class="dir">← retour</span>Kubernân — la carte</a>
        </nav>
      </section>`;
  }

  // ── scroll-spy : surligne la section courante dans le sommaire ───
  let spy = null;
  function wireSpy() {
    if (spy) { spy.disconnect(); spy = null; }
    const links = [...document.querySelectorAll('.subnav a[data-sub]')];
    if (!links.length) return;
    const targets = links
      .map((a) => document.getElementById(a.dataset.sub))
      .filter(Boolean);
    const setCur = (id) =>
      links.forEach((a) => a.classList.toggle('cur', a.dataset.sub === id));
    spy = new IntersectionObserver(
      (entries) => {
        const vis = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (vis[0]) setCur(vis[0].target.id);
      },
      { rootMargin: '-12% 0px -70% 0px', threshold: 0 }
    );
    targets.forEach((t) => spy.observe(t));
  }

  // ── orchestration ───────────────────────────────────────────────
  function route() {
    const r = parseHash();
    seenConcepts.clear(); // « première occurrence » du second cercle, par passe de rendu
    renderSidebar(r);

    let html = '', titleSuffix = '';
    if (r.view === 'home') { html = homeHTML(); titleSuffix = ''; }
    else if (r.view === 'coda') { html = codaHTML(); titleSuffix = ' — Enfin dehors'; }
    else { const b = bifByN(r.n); html = bifHTML(b); titleSuffix = ` — ${b.roman}. ${b.titre}`; }

    $('#content').innerHTML = html;
    document.title = 'Kubernân, où sortir ?' + titleSuffix;
    document.body.classList.remove('nav-open');
    document.body.classList.toggle('coda-view', r.view === 'coda'); // lettre immersive, sans sidebar
    wireSpy();

    // focus d'une section précise (#b-n-k ou #b-n-c) sinon haut de page
    if (r.view === 'bif' && r.focus) {
      const el = document.getElementById(r.focus);
      if (el) { el.scrollIntoView({ block: 'start' }); return; }
    }
    window.scrollTo(0, 0);
  }

  // clics du sommaire latéral : scroll doux, sans recharger la page
  document.addEventListener('click', (e) => {
    const a = e.target.closest('.subnav a[data-sub]');
    if (!a) return;
    const el = document.getElementById(a.dataset.sub);
    if (!el) return;
    e.preventDefault();
    document.body.classList.remove('nav-open');
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    history.replaceState(null, '', '#' + a.dataset.sub);
    document.querySelectorAll('.subnav a').forEach((x) => x.classList.toggle('cur', x === a));
  });

  window.addEventListener('hashchange', route);

  // barre de progression
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

  // bouton menu (mobile)
  const mb = $('#menuBtn');
  if (mb) mb.addEventListener('click', () => document.body.classList.toggle('nav-open'));

  // bouton bascule de thème
  const tb = $('#themeBtn');
  if (tb) tb.addEventListener('click', () => {
    const dark = document.body.classList.toggle('theme-dark');
    try { localStorage.setItem('kubernan-theme', dark ? 'dark' : 'light'); } catch (e) {}
  });

  if (!BIFS.length) {
    $('#content').innerHTML =
      '<p style="font-family:var(--mono);color:var(--red)">Données absentes : data/book.js introuvable.</p>';
    return;
  }
  route();
})();
