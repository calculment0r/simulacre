/* ════════════════════════════════════════════════════════════════
   GOD MODE — atelier de fabrication des fragments (RENVERSEMENT)
   - déverrouillage par code 3 chiffres (007 = Cal, 666 = Eric)
   - accordéons par fragment : « contexte » + « tweak »
   - sliders d'opérateurs, régénération via Claude Opus 4.8 (API navigateur)
   - carrousel des versions, validation/retour arrière
   - variantes partagées via GitHub (data/variants.json), PC éteint OK
   Tout vit dans le navigateur de l'utilisateur ; aucune clé dans le repo.
   ════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  // ── config repo (pour le commit des variantes) ──────────────────
  const GH = { owner: 'calculment0r', repo: 'simulacre', path: 'data/variants.json', branch: 'main' };
  const MODEL = 'claude-opus-4-8';
  // Proxy facultatif (Cloudflare Worker) qui détient la clé côté serveur.
  // Vide → appel direct navigateur avec la clé collée en réglages.
  // Renseigné → Eric n'a aucune clé à entrer (clé cachée dans le proxy).
  const PROXY_URL = 'https://simulacre-proxy.luxigone.workers.dev';

  // ── identités ───────────────────────────────────────────────────
  const USERS = { '007': 'Nico', '666': 'Eric' };

  // ── opérateurs (méthode §1) → sliders ───────────────────────────
  const OPERATORS = [
    ['Debord', 'lentille structurale, thèse à renverser'],
    ['Tiqqun', 'gouvernementalité cybernétique, recrutement par le confort'],
    ['Land', 'processus autonome, intelligence-capital (critique)'],
    ['Meillassoux', 'corrélation sans pôle humain, archi-fossile moteur'],
    ['Latour', 'disparition du social, acteur-réseau'],
    ['Stiegler', 'prolétarisation, pharmakon, irréversibilité'],
    ['Simondon', 'individuation technique, souveraineté, la sortie'],
    ['Garcia', 'intensité, présent sans épaisseur, fausse nouveauté'],
    ['Sloterdijk', 'sphères, immunité, confort sans dehors'],
    ['Žižek', 'idéologie-structure, violence objective, transgression récupérée'],
    ['Bergson', 'durée vs temps mesuré'],
    ['Benjamin', 'aura, reproductibilité'],
  ];

  // ── system prompt : la méthode RENVERSEMENT condensée ───────────
  const SYSTEM = `Tu es l'atelier d'écriture du livre « La Société du Simulacre » — un détournement de « La Société du Spectacle » de Guy Debord transposé à l'IA générative. Tu produis UN fragment (Face A) selon la méthode RENVERSEMENT.

PRINCIPE. Ne traduis pas Debord, détourne-le. Ne remplace pas « spectacle » par « Simulacre » : ce serait du maquillage. Pars du PHÉNOMÈNE réel (ce qui se passe dans la génération : la réponse instantanée, le prompt, le corpus, le cutoff, l'inférence), et sers-toi de Debord comme provocation pour le RENVERSER. Le fragment doit tenir debout même pour qui n'a jamais lu Debord.

CHERCHER L'ÉCART (le gisement du fragment) :
- inversion : le Simulacre fait le geste inverse de Debord et va plus loin (le spectacle éloigne → le Simulacre rapproche, et la proximité est la dépossession) ;
- excès : le Simulacre fait ce que le spectacle ne pouvait pas (répondre, générer à la demande, fabriquer sa propre critique, parler depuis un passé gelé) ;
- automatisation : ce que le spectacle laissait au contemplateur, le Simulacre l'exécute (la corrélation tourne sans pôle humain).

DEUX AXES À FAIRE JOUER (en sous-main, jamais nommés dans le fragment) :
- Axe I cybernétique/accélérationniste-NRx : le Simulacre comme gouvernementalité qui pilote la cognition, élimine la friction, recrute par le soulagement ; intelligence qui se détache de l'humain. Ton radical, froid, sans concession.
- Axe II corrélationniste apocalyptique (Meillassoux) : énoncés sur le monde sans accès au monde (corrélation au carré), l'humain chassé du rapport, l'archi-fossile devenu moteur.

RÈGLES DU FRAGMENT (Face A) :
1. densité déclarative : chaque phrase porte une thèse ; pas de liaison, pas de « on peut dire que », pas de chauffe.
2. inverser, pas substituer.
3. partir de l'objet (le phénomène), pas des exemples de Debord.
4. AUCUN penseur nommé (ni Debord, ni Meillassoux, ni Land…). Seule exception : retourner une formule iconique de Debord (« mouvement autonome du non-vivant ») — détournement-citation, pas référence.
5. pas de jargon : la difficulté est dans la compression de l'idée, pas dans le vocabulaire (jamais « corrélationnisme », « gouvernementalité » dans le fragment).
6. tout en minuscules, deadpan, tout sur le même plan.
7. clausule : finir sur un retournement froid, une phrase courte qui coupe.
8. longueur : 5 à 9 phrases.

REGISTRE — INVARIANT : le style d'écriture reste TOUJOURS celui de Tiqqun (froid, dense, déclaratif, minuscules, clausule qui coupe), MÊME quand d'autres opérateurs (Latour, Stiegler, Simondon, Garcia…) sont au centre de l'analyse. Les opérateurs déterminent le CONTENU et l'angle ; ils ne changent jamais le registre.

NE PARS PAS DE LA THÈSE DE DEBORD. Pars du phénomène (le sujet central fourni) et du fragment actuel à dépasser. Debord reste une lentille en sous-main, jamais le point de départ.

TENIR LA CONTRADICTION : ni techno-optimisme, ni déclinisme.

SORTIE : réponds UNIQUEMENT par le texte du fragment, en minuscules, sans titre, sans préambule, sans guillemets, sans aucun raisonnement ni commentaire.`;

  // ── état ────────────────────────────────────────────────────────
  const LS = {
    get code() { return localStorage.getItem('sim_god_code') || ''; },
    set code(v) { v ? localStorage.setItem('sim_god_code', v) : localStorage.removeItem('sim_god_code'); },
    get apiKey() { return localStorage.getItem('sim_anthropic_key') || ''; },
    set apiKey(v) { localStorage.setItem('sim_anthropic_key', v || ''); },
    get ghToken() { return localStorage.getItem('sim_gh_token') || ''; },
    set ghToken(v) { localStorage.setItem('sim_gh_token', v || ''); },
  };

  let VARIANTS = {};       // { n: { activeId, versions:[...] } }
  let METAS = {};          // { n: "méta-restitution" } — pré-générées (data/metas.json)
  let varsSha = null;      // sha du fichier GitHub (pour commit)
  let loaded = false;

  const esc = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const md = (s) => esc(s).replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>').replace(/\*([^*]+)\*/g, '<em>$1</em>');
  const pad3 = (n) => String(n).padStart(2, '0');
  const fmtDate = (ts) =>
    ts
      ? new Date(ts).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' })
      : '';
  let ridCounter = 0;
  const rid = () => 'v_' + Math.abs(Date.now() % 1e9).toString(36) + '_' + ++ridCounter;
  const thesisOf = (n) => (window.THESES || []).find((t) => t.n === n);

  function isOn() { return !!USERS[LS.code]; }
  function author() { return USERS[LS.code] || null; }

  // versions d'un fragment (toujours avec l'original en tête)
  function versionsOf(n) {
    const t = thesisOf(n);
    const orig = { id: 'orig', fragment: t ? t.fragment : '', author: null, ts: null, origin: 'canonical' };
    const entry = VARIANTS[n];
    if (!entry || !entry.versions) return [orig];
    return [orig, ...entry.versions.filter((v) => v.id !== 'orig')];
  }
  function activeIdOf(n) { return (VARIANTS[n] && VARIANTS[n].activeId) || 'orig'; }
  // texte affiché dans le fil général (la version validée), ou null si l'original
  function activeFragment(n) {
    const id = activeIdOf(n);
    if (id === 'orig') return null;
    const v = versionsOf(n).find((x) => x.id === id);
    return v ? v.fragment : null;
  }

  // ── chargement des variantes partagées (data/variants.json) ─────
  async function loadVariants() {
    try {
      const r = await fetch('data/variants.json?_=' + Date.now(), { cache: 'no-store' });
      if (r.ok) VARIANTS = await r.json();
    } catch (e) { /* fichier absent au début : on part de {} */ }
    loaded = true;
    if (window.__simRoute) window.__simRoute();
  }

  // ── chargement des méta-restitutions pré-générées ───────────────
  async function loadMetas() {
    try {
      const r = await fetch('data/metas.json?_=' + Date.now(), { cache: 'no-store' });
      if (r.ok) METAS = await r.json();
    } catch (e) { /* absent : contexte en repli */ }
    if (window.__simRoute) window.__simRoute();
  }

  // ── persistance : commit GitHub si token, sinon localStorage ────
  function saveLocal() { localStorage.setItem('sim_variants_local', JSON.stringify(VARIANTS)); }
  function loadLocalInto() {
    try { Object.assign(VARIANTS, JSON.parse(localStorage.getItem('sim_variants_local') || '{}')); } catch (e) {}
  }

  async function persist(noteEl) {
    saveLocal();
    const token = LS.ghToken;
    if (!token) {
      if (noteEl) noteEl.textContent = 'enregistré en local (aucun token GitHub — non partagé). colle un token en réglages pour partager.';
      return;
    }
    try {
      if (noteEl) noteEl.textContent = 'envoi vers GitHub…';
      // récupère le sha courant
      const api = `https://api.github.com/repos/${GH.owner}/${GH.repo}/contents/site/${GH.path}`;
      const head = { Authorization: 'Bearer ' + token, Accept: 'application/vnd.github+json' };
      const cur = await fetch(api + '?ref=' + GH.branch, { headers: head });
      if (cur.ok) { const j = await cur.json(); varsSha = j.sha; }
      const body = {
        message: `variantes: maj par ${author() || '???'}`,
        content: b64(JSON.stringify(VARIANTS, null, 2)),
        branch: GH.branch,
      };
      if (varsSha) body.sha = varsSha;
      const put = await fetch(api, { method: 'PUT', headers: head, body: JSON.stringify(body) });
      if (!put.ok) throw new Error('GitHub ' + put.status + ' ' + (await put.text()).slice(0, 140));
      const pj = await put.json();
      varsSha = pj.content && pj.content.sha;
      if (noteEl) noteEl.textContent = 'partagé sur GitHub ✓ (redéploiement ~30 s)';
    } catch (e) {
      if (noteEl) noteEl.textContent = 'échec GitHub : ' + e.message + ' — gardé en local.';
    }
  }
  function b64(s) { return btoa(unescape(encodeURIComponent(s))); }

  // ── opérateurs convoqués par une thèse (sliders) ────────────────
  const norm = (s) => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  function operatorsForThesis(t) {
    const auts = (t.auteurs || []).map(norm);
    const hit = new Set();
    OPERATORS.forEach(([name]) => {
      const nm = norm(name);
      if (auts.some((a) => a.includes(nm))) hit.add(name);
    });
    // Comité Invisible / CI → pôle Tiqqun
    if (auts.some((a) => /\bci\b/.test(a) || a.includes('comite invisible'))) hit.add('Tiqqun');
    let list = OPERATORS.filter(([n]) => hit.has(n));
    if (!list.length) list = OPERATORS.filter(([n]) => ['Tiqqun', 'Meillassoux'].includes(n));
    return list;
  }
  function metaFallback(t) {
    const s = (t.sens_pour_debord || '').trim();
    const m = s.match(/^(.+?[.!?])(\s|$)/);
    return (m ? m[1] : s).slice(0, 220);
  }

  // ── appel Claude Opus 4.8 (proxy si configuré, sinon direct) ────
  async function callClaude(system, userMsg, maxTokens) {
    const payload = JSON.stringify({ model: MODEL, max_tokens: maxTokens, system, messages: [{ role: 'user', content: userMsg }] });
    let res;
    if (PROXY_URL) {
      res = await fetch(PROXY_URL, { method: 'POST', headers: { 'content-type': 'application/json' }, body: payload });
    } else {
      const key = LS.apiKey;
      if (!key) throw new Error('clé API manquante (réglages) — ou configure le proxy');
      res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-api-key': key,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: payload,
      });
    }
    if (!res.ok) throw new Error('API ' + res.status + ' : ' + (await res.text()).slice(0, 200));
    const data = await res.json();
    const block = (data.content || []).find((b) => b.type === 'text');
    return (block ? block.text : '').trim();
  }

  // régénère un fragment (Face A) — ne part PAS de Debord, garde le style Tiqqun
  async function regenerate(n, tweak, weights) {
    const t = thesisOf(n);
    const sujet = (VARIANTS[n] && VARIANTS[n].meta) || METAS[n] || t.sens_pour_debord;
    const ops = operatorsForThesis(t)
      .map(([name]) => `${name}: ${weights[name] != null ? weights[name] : 65}`)
      .join(' · ');
    const user = `SUJET CENTRAL (ce dont le fragment doit parler) :
${sujet}

FRAGMENT ACTUEL (à dépasser, ne pas recopier) :
${t.fragment}

DIRECTION / MOTS-CLEFS de l'opérateur (peut demander d'injecter d'autres auteurs) :
${tweak || '(aucune — propose un renversement neuf et plus tranchant)'}

OPÉRATEURS CONVOQUÉS pour cette thèse, avec leur poids (0-100) :
${ops}

Pars du phénomène, pas de Debord. Garde le registre Tiqqun même si un autre opérateur est au centre. Produis UN nouveau fragment (Face A), minuscules, 5 à 9 phrases. Réponds uniquement par le fragment.`;
    let out = await callClaude(SYSTEM, user, 1600);
    return out.replace(/^["«»\s]+|["«»\s]+$/g, '').toLowerCase();
  }

  // génère la phrase de méta-restitution (contexte) — style neutre, PAS Tiqqun
  const META_SYSTEM = `Tu restitues en UNE seule phrase simple et claire ce dont parle l'analyse d'une thèse du livre « La Société du Simulacre » selon ses auteurs de référence. Style neutre, informatif, synthétique : PAS d'aphorisme, PAS le style Tiqqun, pas de minuscules obligatoires, pas de jargon académique. La phrase dit simplement de quoi ça parle, pour orienter le lecteur. Réponds uniquement par cette phrase.`;
  async function generateMeta(n) {
    const t = thesisOf(n);
    const user = `Sens de la thèse : ${t.sens_pour_debord}

Ce que les auteurs en disent :
${(t.pourquoi || []).map((p) => '- ' + p).join('\n')}

Donne la phrase de méta-restitution (une seule phrase, simple et claire).`;
    const s = await callClaude(META_SYSTEM, user, 300);
    return s.replace(/^["«»\s]+|["«»\s]+$/g, '').trim();
  }

  // ════════════════ RENDU DES CONTRÔLES (par fragment) ════════════
  function controlsHTML(t) {
    const n = t.n;
    const vs = versionsOf(n);
    const activeId = activeIdOf(n);
    const operators = operatorsForThesis(t);
    const ops = operators.map(([name, desc]) => {
      const w = defaultWeight(t, name);
      return `<div class="gm-slider">
        <label title="${esc(desc)}">${esc(name)} <span class="gm-val" data-op="${esc(name)}">${w}</span></label>
        <input type="range" min="0" max="100" value="${w}" data-op="${esc(name)}">
      </div>`;
    }).join('');
    const meta = (VARIANTS[n] && VARIANTS[n].meta) || METAS[n] || '';

    return `<div class="gm" data-n="${n}">
      <div class="gm-bar">
        <button class="gm-acc-btn" data-panel="ctx">▸ contexte</button>
        <button class="gm-acc-btn" data-panel="tweak">▸ tweak</button>
        ${vs.length > 1 ? `<span class="gm-count">${vs.length} versions</span>` : ''}
      </div>

      <div class="gm-panel" data-panel="ctx" hidden>
        <div class="gm-lab">méta-restitution — de quoi parle ce fragment</div>
        <p class="gm-meta${meta ? '' : ' gm-meta-fallback'}">${meta ? esc(meta) : esc(metaFallback(t))}</p>
      </div>

      <div class="gm-panel" data-panel="tweak" hidden>
        <div class="gm-lab">direction / mots-clefs <small style="text-transform:none;letter-spacing:0;color:var(--dim)">— peut injecter un autre auteur</small></div>
        <textarea class="gm-tweak" rows="3" placeholder="ex. accentuer le cutoff ; clausule plus froide ; injecter Latour sur l'infrastructure…"></textarea>
        <div class="gm-lab" style="margin-top:14px">poids des opérateurs convoqués</div>
        <div class="gm-sliders">${ops}</div>
        <div class="gm-actions">
          <button class="gm-regen">⟳ régénérer avec Opus 4.8</button>
          <span class="gm-status"></span>
        </div>
      </div>

      <div class="gm-carousel" data-active="${esc(activeId)}">${carouselHTML(n)}</div>
    </div>`;
  }

  function defaultWeight(t, name) {
    // tous les sliders affichés sont déjà des opérateurs convoqués
    const nm = name.toLowerCase();
    return ['debord', 'tiqqun', 'meillassoux'].includes(nm) ? 70 : 60; // axes maîtres un peu plus hauts
  }

  function carouselHTML(n) {
    const vs = versionsOf(n);
    if (vs.length <= 1) return '';
    const activeId = activeIdOf(n);
    const dots = vs.map((v, i) => `<button class="gm-dot${i === 0 ? ' cur' : ''}" data-i="${i}" title="${v.origin === 'canonical' ? 'original' : (v.author || '?') + (v.ts ? ' · ' + fmtDate(v.ts) : '')}"></button>`).join('');
    return `<div class="gm-car-head"><span class="gm-lab">versions — swipe</span><div class="gm-dots">${dots}</div></div>
      <div class="gm-car-track">${vs.map((v, i) => slideHTML(n, v, i, activeId)).join('')}</div>`;
  }

  function slideHTML(n, v, i, activeId) {
    const isActive = v.id === activeId;
    const who = v.origin === 'canonical' ? 'original' : `${v.author || '?'}${v.ts ? ' · ' + fmtDate(v.ts) : ''}`;
    return `<div class="gm-slide${i === 0 ? ' show' : ''}" data-i="${i}" data-id="${esc(v.id)}">
      <div class="gm-slide-meta"><span class="gm-who">${esc(who)}</span>${isActive ? '<span class="gm-active-tag">dans le fil</span>' : ''}</div>
      <div class="gm-slide-text">${md(v.fragment).replace(/\n/g, '<br>')}</div>
      ${isActive ? '' : `<button class="gm-validate" data-id="${esc(v.id)}">valider cette version → la remettre dans le fil</button>`}
    </div>`;
  }

  // ════════════════ HYDRATATION (events) ══════════════════════════
  function onRenderChapter(contentEl) {
    if (!isOn()) return;
    contentEl.querySelectorAll('.gm').forEach((gm) => wireFragment(gm));
  }

  function wireFragment(gm) {
    const n = +gm.dataset.n;
    // accordéons
    gm.querySelectorAll('.gm-acc-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const which = btn.dataset.panel;
        const panel = gm.querySelector(`.gm-panel[data-panel="${which}"]`);
        const open = panel.hasAttribute('hidden');
        if (open) { panel.removeAttribute('hidden'); btn.textContent = '▾ ' + btn.textContent.slice(2); }
        else { panel.setAttribute('hidden', ''); btn.textContent = '▸ ' + btn.textContent.slice(2); }
      });
    });
    // sliders
    gm.querySelectorAll('input[type=range]').forEach((s) => {
      s.addEventListener('input', () => {
        const v = gm.querySelector(`.gm-val[data-op="${s.dataset.op}"]`);
        if (v) v.textContent = s.value;
      });
    });
    // textarea mobile : recentre l'entrée quand le clavier monte
    const ta = gm.querySelector('.gm-tweak');
    if (ta) ta.addEventListener('focus', () => setTimeout(() => ta.scrollIntoView({ block: 'center', behavior: 'smooth' }), 250));
    // régénération
    const regenBtn = gm.querySelector('.gm-regen');
    if (regenBtn) regenBtn.addEventListener('click', () => doRegen(gm, n));
    // carrousel
    wireCarousel(gm, n);
  }

  function wireCarousel(gm, n) {
    const car = gm.querySelector('.gm-carousel');
    if (!car) return;
    const slides = [...car.querySelectorAll('.gm-slide')];
    const dots = [...car.querySelectorAll('.gm-dot')];
    let idx = 0;
    const show = (i) => {
      idx = Math.max(0, Math.min(slides.length - 1, i));
      slides.forEach((s, k) => s.classList.toggle('show', k === idx));
      dots.forEach((d, k) => d.classList.toggle('cur', k === idx));
    };
    dots.forEach((d) => d.addEventListener('click', () => show(+d.dataset.i)));
    // swipe tactile
    let x0 = null;
    const track = car.querySelector('.gm-car-track');
    if (track) {
      track.addEventListener('touchstart', (e) => (x0 = e.touches[0].clientX), { passive: true });
      track.addEventListener('touchend', (e) => {
        if (x0 == null) return;
        const dx = e.changedTouches[0].clientX - x0;
        if (Math.abs(dx) > 40) show(idx + (dx < 0 ? 1 : -1));
        x0 = null;
      });
    }
    // validation d'une version
    car.querySelectorAll('.gm-validate').forEach((b) => b.addEventListener('click', () => validate(n, b.dataset.id)));
  }

  async function doRegen(gm, n) {
    const status = gm.querySelector('.gm-status');
    const tweak = (gm.querySelector('.gm-tweak') || {}).value || '';
    const weights = {};
    gm.querySelectorAll('input[type=range]').forEach((s) => (weights[s.dataset.op] = +s.value));
    status.textContent = '… Opus 4.8 réfléchit';
    try {
      const fragment = await regenerate(n, tweak, weights);
      if (!fragment) throw new Error('réponse vide');
      VARIANTS[n] = VARIANTS[n] || { activeId: 'orig', versions: [] };
      VARIANTS[n].versions.push({ id: rid(), fragment, author: author(), ts: Date.now(), tweak, weights, model: MODEL });
      status.textContent = 'nouvelle version créée ✓';
      await persist(status);
      if (window.__simRoute) window.__simRoute();
    } catch (e) {
      status.textContent = '✗ ' + e.message;
    }
  }

  async function validate(n, id) {
    VARIANTS[n] = VARIANTS[n] || { activeId: 'orig', versions: [] };
    VARIANTS[n].activeId = id;
    await persist(null);
    if (window.__simRoute) window.__simRoute();
  }

  // ════════════════ SIDEBAR : bouton + réglages ═══════════════════
  function onRenderSidebar(sidebarEl) {
    const foot = sidebarEl.querySelector('.side-foot');
    if (!foot) return;
    const on = isOn();
    const ctl = document.createElement('div');
    ctl.className = 'gm-side';
    ctl.innerHTML = on
      ? `<div class="gm-side-on">● god mode — <b>${author()}</b> <button id="gmSettings">réglages</button> <button id="gmLock">quitter</button></div>`
      : `<button id="gmEnter">⌁ god mode</button>`;
    foot.appendChild(ctl);

    if (on) {
      sidebarEl.querySelector('#gmLock').onclick = () => { LS.code = ''; if (window.__simRoute) window.__simRoute(); };
      sidebarEl.querySelector('#gmSettings').onclick = openSettings;
    } else {
      sidebarEl.querySelector('#gmEnter').onclick = openUnlock;
    }
  }

  // ── modale générique ────────────────────────────────────────────
  function modal(html) {
    const back = document.createElement('div');
    back.className = 'gm-modal-back';
    back.innerHTML = `<div class="gm-modal">${html}</div>`;
    document.body.appendChild(back);
    back.addEventListener('click', (e) => { if (e.target === back) close(); });
    function close() { back.remove(); }
    return { el: back, close };
  }

  function openUnlock() {
    const m = modal(`
      <div class="gm-lab">accès god mode</div>
      <p class="gm-modal-p">code à 3 chiffres.</p>
      <input id="gmCode" type="password" inputmode="numeric" maxlength="3" placeholder="•••" class="gm-input gm-code-input" autocomplete="off">
      <div class="gm-modal-actions"><button id="gmOk" class="gm-primary">entrer</button><span id="gmErr" class="gm-err"></span></div>`);
    const inp = m.el.querySelector('#gmCode');
    inp.focus();
    const go = () => {
      const c = inp.value.trim();
      if (USERS[c]) { LS.code = c; m.close(); if (window.__simRoute) window.__simRoute(); }
      else m.el.querySelector('#gmErr').textContent = 'code invalide';
    };
    m.el.querySelector('#gmOk').onclick = go;
    inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') go(); });
  }

  function openSettings() {
    const m = modal(`
      <div class="gm-lab">réglages god mode — ${author()}</div>
      <p class="gm-modal-p">stockés uniquement dans ce navigateur. la clé Anthropic sert à régénérer ; le token GitHub à partager les variantes.</p>
      <label class="gm-flab">clé API Anthropic <small>(sk-ant-…)</small></label>
      <input id="gmKey" type="password" class="gm-input" placeholder="sk-ant-..." value="${esc(LS.apiKey)}" autocomplete="off">
      <label class="gm-flab">token GitHub <small>(fine-grained, Contents: read+write sur ${GH.owner}/${GH.repo})</small></label>
      <input id="gmTok" type="password" class="gm-input" placeholder="github_pat_..." value="${esc(LS.ghToken)}" autocomplete="off">
      <div class="gm-modal-actions"><button id="gmSave" class="gm-primary">enregistrer</button><span id="gmSaved" class="gm-ok"></span></div>`);
    m.el.querySelector('#gmSave').onclick = () => {
      LS.apiKey = m.el.querySelector('#gmKey').value.trim();
      LS.ghToken = m.el.querySelector('#gmTok').value.trim();
      m.el.querySelector('#gmSaved').textContent = 'enregistré ✓';
    };
  }

  // ── init ────────────────────────────────────────────────────────
  loadLocalInto();
  loadVariants();
  loadMetas();

  window.GodMode = { isOn, author, activeFragment, controlsHTML, onRenderChapter, onRenderSidebar };
})();
