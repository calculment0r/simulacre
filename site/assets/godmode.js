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

  // ── identités ───────────────────────────────────────────────────
  const USERS = { '007': 'Cal', '666': 'Eric' };

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
  let varsSha = null;      // sha du fichier GitHub (pour commit)
  let loaded = false;

  const esc = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const md = (s) => esc(s).replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>').replace(/\*([^*]+)\*/g, '<em>$1</em>');
  const pad3 = (n) => String(n).padStart(2, '0');
  const rid = () => 'v_' + Math.abs(Date.now() % 1e9).toString(36) + '_' + (VARIANTS.__c = (VARIANTS.__c || 0) + 1);
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

  // ── appel Claude Opus 4.8 (depuis le navigateur) ────────────────
  async function regenerate(n, tweak, weights) {
    const key = LS.apiKey;
    if (!key) throw new Error('clé API Anthropic manquante (réglages god mode)');
    const t = thesisOf(n);
    const ops = OPERATORS
      .map(([name]) => `${name}: ${weights[name] != null ? weights[name] : 50}`)
      .join(' · ');
    const user = `THÈSE DEBORD (provocation de départ) :
${t.debord_these}

SUJET CENTRAL (ce dont le fragment doit parler) :
${t.sens_pour_debord}

FRAGMENT ACTUEL (à renverser autrement, ne pas recopier) :
${t.fragment}

DIRECTION / MOTS-CLEFS injectés par l'opérateur :
${tweak || '(aucune — propose un renversement neuf et plus tranchant)'}

PONDÉRATION DES OPÉRATEURS à faire jouer en sous-main (0-100) :
${ops}

Produis UN nouveau fragment (Face A), minuscules, 5 à 9 phrases, selon la méthode. Réponds uniquement par le fragment.`;

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': key,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 1600,
        system: SYSTEM,
        messages: [{ role: 'user', content: user }],
      }),
    });
    if (!res.ok) {
      const txt = await res.text();
      throw new Error('API ' + res.status + ' : ' + txt.slice(0, 200));
    }
    const data = await res.json();
    const block = (data.content || []).find((b) => b.type === 'text');
    let out = (block ? block.text : '').trim();
    out = out.replace(/^["«»\s]+|["«»\s]+$/g, '').toLowerCase();
    return out;
  }

  // ════════════════ RENDU DES CONTRÔLES (par fragment) ════════════
  function controlsHTML(t) {
    const n = t.n;
    const vs = versionsOf(n);
    const activeId = activeIdOf(n);
    const ops = OPERATORS.map(([name, desc]) => {
      const w = defaultWeight(t, name);
      return `<div class="gm-slider">
        <label title="${esc(desc)}">${esc(name)} <span class="gm-val" data-op="${esc(name)}">${w}</span></label>
        <input type="range" min="0" max="100" value="${w}" data-op="${esc(name)}">
      </div>`;
    }).join('');

    return `<div class="gm" data-n="${n}">
      <div class="gm-bar">
        <button class="gm-acc-btn" data-panel="ctx">▸ contexte</button>
        <button class="gm-acc-btn" data-panel="tweak">▸ tweak</button>
        ${vs.length > 1 ? `<span class="gm-count">${vs.length} versions</span>` : ''}
      </div>

      <div class="gm-panel" data-panel="ctx" hidden>
        <div class="gm-ctx-block"><div class="gm-lab">sujet central</div><p>${md(t.sens_pour_debord)}</p></div>
        <div class="gm-ctx-block"><div class="gm-lab">thèse Debord</div><p class="gm-italic">${md(t.debord_these)}</p></div>
        <div class="gm-ctx-block"><div class="gm-lab">analyse — opérateurs</div>
          <ul>${(t.pourquoi || []).map((p) => `<li>${md(p)}</li>`).join('')}</ul>
        </div>
      </div>

      <div class="gm-panel" data-panel="tweak" hidden>
        <div class="gm-lab">direction / mots-clefs</div>
        <textarea class="gm-tweak" rows="3" placeholder="ex. accentuer l'axe corrélationniste ; insister sur le cutoff ; clausule plus froide…"></textarea>
        <div class="gm-lab" style="margin-top:14px">poids des opérateurs</div>
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
    // pré-règle les sliders selon les auteurs déjà convoqués par la thèse
    const set = (t.auteurs || []).map((a) => a.toLowerCase());
    const nm = name.toLowerCase();
    if (set.some((a) => a.includes(nm) || nm.includes(a.split(' ')[0]))) return 75;
    if (['debord', 'tiqqun', 'meillassoux'].includes(nm)) return 55; // axes maîtres
    return 25;
  }

  function carouselHTML(n) {
    const vs = versionsOf(n);
    if (vs.length <= 1) return '';
    const activeId = activeIdOf(n);
    const dots = vs.map((v, i) => `<button class="gm-dot${i === 0 ? ' cur' : ''}" data-i="${i}" title="${v.origin === 'canonical' ? 'original' : (v.author || '?') + ' · variante'}"></button>`).join('');
    return `<div class="gm-car-head"><span class="gm-lab">versions — swipe</span><div class="gm-dots">${dots}</div></div>
      <div class="gm-car-track">${vs.map((v, i) => slideHTML(n, v, i, activeId)).join('')}</div>`;
  }

  function slideHTML(n, v, i, activeId) {
    const isActive = v.id === activeId;
    const who = v.origin === 'canonical' ? 'original' : `${v.author || '?'}${v.ts ? ' · ' + new Date(v.ts).toLocaleDateString('fr-FR') : ''}`;
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

  window.GodMode = { isOn, author, activeFragment, controlsHTML, onRenderChapter, onRenderSidebar };
})();
