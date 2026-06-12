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
  const USERS = {
    '007': 'Nico',
    '666': 'Eric',
    '013': 'Sabrina',
    '015': 'Pilou',
  };
  // couleur de signature de chaque contributeur (cadre, surlignages d'annotation)
  const USER_COLORS = { Nico: '#c9ff3c', Eric: '#ff4455', Sabrina: '#4499ff', Pilou: '#9966ff' }; // vert · rouge · bleu · violet
  function userColor(name) { return USER_COLORS[name] || '#c9ff3c'; }

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

NE PARS PAS DE LA THÈSE DE DEBORD. Pars du phénomène (le sujet central fourni) et du fragment actuel à affiner. Debord reste une lentille en sous-main, jamais le point de départ.

ANCRAGE STRUCTUREL — RÈGLE ABSOLUE : chaque fragment occupe une place PRÉCISE dans l'enchaînement argumentatif du livre. Le CONTEXTE fourni est le sens que ce fragment doit tenir ; tu ne t'en écartes JAMAIS. Une régénération n'est qu'un AJUSTEMENT — de formulation, d'emphase, d'angle, d'opérateur, de clausule. La thèse et le sujet du fragment restent identiques. N'élargis pas, ne dérive pas vers une idée voisine même meilleure : ce ne serait plus la place de ce fragment. Tu affines ce qui est dit ; tu ne déplaces pas ce qui est dit.

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
  let ANNOTATIONS = {};    // { n: [ {id, text, message, author, color, ts} ] }
  let varsSha = null;      // sha du fichier GitHub (pour commit)
  let loaded = false;

  const esc = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const md = (s) => esc(s).replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>').replace(/\*([^*]+)\*/g, '<em>$1</em>');
  const renderFrag = (txt) =>
    String(txt == null ? '' : txt).split(/\n{2,}/).map((p) => p.trim()).filter(Boolean)
      .map((p) => '<p>' + md(p).replace(/\n/g, '<br>') + '</p>').join('');
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
  // likes (par prénom) au niveau du fragment
  function likesOf(n) { return (VARIANTS[n] && VARIANTS[n].likes) || {}; }
  function likeCount(n) { return Object.keys(likesOf(n)).length; }
  function likedByMe(n) { return !!likesOf(n)[author()]; }
  function likeTitle(n) {
    const who = Object.keys(likesOf(n));
    return who.length ? who.join(', ') + (who.length > 1 ? ' aiment' : ' aime') + ' ce fragment' : "personne n'aime encore — ♥ pour préserver";
  }
  // cœur sur le fil principal — visible et cliquable par TOUS (god mode ou non)
  const ANON_KEY = 'sim_anon_likes';
  function anonSet() { try { return new Set(JSON.parse(localStorage.getItem(ANON_KEY) || '[]')); } catch (e) { return new Set(); } }
  function anonLiked(n) { return anonSet().has(n); }
  function toggleAnonLike(n) {
    const s = anonSet();
    if (s.has(n)) s.delete(n); else s.add(n);
    localStorage.setItem(ANON_KEY, JSON.stringify([...s]));
  }
  function likeHTML(n) {
    const liked = isOn() ? likedByMe(n) : anonLiked(n);
    const c = likeCount(n);
    return `<div class="like-row"><button class="like${liked ? ' liked' : ''}" data-n="${n}" aria-label="aimer" title="${esc(isOn() ? likeTitle(n) : '')}">♥${c ? ` <span class="like-n">${c}</span>` : ''}</button></div>`;
  }
  function updateLikeButton(btn, n) {
    const liked = isOn() ? likedByMe(n) : anonLiked(n);
    btn.classList.toggle('liked', liked);
    const c = likeCount(n);
    let nEl = btn.querySelector('.like-n');
    if (c) { if (!nEl) { nEl = document.createElement('span'); nEl.className = 'like-n'; btn.appendChild(nEl); } nEl.textContent = c; }
    else if (nEl) nEl.remove();
    btn.title = isOn() ? likeTitle(n) : '';
  }
  function handleLikeClick(n, btn) {
    if (isOn()) {
      // contributeur connecté : like nommé, partagé sur GitHub
      VARIANTS[n] = VARIANTS[n] || { activeId: 'orig', versions: [] };
      VARIANTS[n].likes = VARIANTS[n].likes || {};
      const me = author();
      if (VARIANTS[n].likes[me]) delete VARIANTS[n].likes[me];
      else VARIANTS[n].likes[me] = Date.now();
      if (!Object.keys(VARIANTS[n].likes).length) delete VARIANTS[n].likes;
      dirty.add(n);
      updateLikeButton(btn, n);
      persist(null).then(() => updateLikeButton(btn, n)); // reflète les likes des autres après fusion
    } else {
      // visiteur non connecté : like local (anonyme), non agrégé
      toggleAnonLike(n);
      updateLikeButton(btn, n);
    }
  }
  function wireLikes(contentEl) {
    contentEl.querySelectorAll('.like').forEach((btn) => {
      const n = +btn.dataset.n;
      if (btn.dataset.wired) return;
      btn.dataset.wired = '1';
      btn.addEventListener('click', () => handleLikeClick(n, btn));
    });
  }
  // texte affiché dans le fil général (la version validée), ou null si l'original
  function activeFragment(n) {
    const id = activeIdOf(n);
    if (id === 'orig') return null;
    const v = versionsOf(n).find((x) => x.id === id);
    return v ? v.fragment : null;
  }

  // ── chargement des variantes partagées ──────────────────────────
  // priorité au Worker (lecture immédiate depuis GitHub) ; repli sur le fichier Pages
  async function loadVariants() {
    let remote = null;
    if (PROXY_URL) remote = await fetchRemoteVariants();
    if (remote === null) {
      try { const r = await fetch('data/variants.json?_=' + Date.now(), { cache: 'no-store' }); if (r.ok) remote = await r.json(); } catch (e) {}
    }
    applyRemoteVariants(remote);
    loaded = true;
    if (window.__simRoute) window.__simRoute();
  }

  async function fetchRemoteVariants() {
    if (!PROXY_URL) return null;
    try {
      const r = await fetch(PROXY_URL.replace(/\/$/, '') + '/variants?_=' + Date.now(), { cache: 'no-store' });
      if (r.ok) return await r.json();
    } catch (e) {}
    return null;
  }

  // ── chargement des méta-restitutions pré-générées ───────────────
  async function loadMetas() {
    try {
      const r = await fetch('data/metas.json?_=' + Date.now(), { cache: 'no-store' });
      if (r.ok) METAS = await r.json();
    } catch (e) { /* absent : contexte en repli */ }
    if (window.__simRoute) window.__simRoute();
  }

  // ── persistance ─────────────────────────────────────────────────
  // fragments modifiés dans cette session → on fusionne sans écraser ceux des autres
  const dirty = new Set();
  function saveLocal() { localStorage.setItem('sim_variants_local', JSON.stringify(VARIANTS)); }
  function loadLocalInto() {
    try { Object.assign(VARIANTS, JSON.parse(localStorage.getItem('sim_variants_local') || '{}')); } catch (e) {}
  }

  async function persist(noteEl) {
    saveLocal();
    // partage via le Worker : token GitHub caché côté serveur, personne n'entre rien
    if (PROXY_URL) {
      try {
        if (noteEl) noteEl.textContent = 'partage…';
        const remote = await fetchRemoteVariants();
        if (remote === null) { if (noteEl) noteEl.textContent = 'lecture GitHub impossible — gardé en local'; return; }
        const merged = Object.assign({}, remote);
        dirty.forEach((n) => { merged[n] = VARIANTS[n]; }); // mes fragments l'emportent, le reste vient des autres
        VARIANTS = merged;
        const res = await fetch(PROXY_URL.replace(/\/$/, '') + '/variants', {
          method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(VARIANTS, null, 1),
        });
        if (!res.ok) throw new Error('worker ' + res.status + ' ' + (await res.text()).slice(0, 120));
        dirty.clear();
        if (noteEl) noteEl.textContent = 'partagé sur GitHub ✓ (visible par tous)';
      } catch (e) {
        if (noteEl) noteEl.textContent = 'échec partage : ' + e.message + ' — gardé en local.';
      }
      return;
    }
    // repli : commit direct avec un token perso (si pas de proxy configuré)
    const token = LS.ghToken;
    if (!token) { if (noteEl) noteEl.textContent = 'enregistré en local (ni proxy ni token).'; return; }
    try {
      if (noteEl) noteEl.textContent = 'envoi vers GitHub…';
      const api = `https://api.github.com/repos/${GH.owner}/${GH.repo}/contents/site/${GH.path}`;
      const head = { Authorization: 'Bearer ' + token, Accept: 'application/vnd.github+json' };
      const cur = await fetch(api + '?ref=' + GH.branch, { headers: head });
      if (cur.ok) { const jj = await cur.json(); varsSha = jj.sha; }
      const body = { message: `variantes: maj par ${author() || '???'}`, content: b64(JSON.stringify(VARIANTS, null, 2)), branch: GH.branch };
      if (varsSha) body.sha = varsSha;
      const put = await fetch(api, { method: 'PUT', headers: head, body: JSON.stringify(body) });
      if (!put.ok) throw new Error('GitHub ' + put.status + ' ' + (await put.text()).slice(0, 140));
      const pj = await put.json(); varsSha = pj.content && pj.content.sha;
      if (noteEl) noteEl.textContent = 'partagé sur GitHub ✓';
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
    const user = `CONTEXTE — LE SENS QUE CE FRAGMENT DOIT TENIR (invariant, ne t'en écarte pas) :
${sujet}

FRAGMENT ACTUEL (à réécrire en mieux : MÊME idée, même place dans l'argument, ne pas recopier mot à mot) :
${t.fragment}

AJUSTEMENT demandé par l'opérateur — c'est un TWEAK (emphase, angle, opérateur à injecter, clausule), PAS un changement de sujet :
${tweak || '(aucun — resserre et durcis la formulation, sans dévier du contexte)'}

OPÉRATEURS CONVOQUÉS pour cette thèse, avec leur poids (0-100) :
${ops}

Le nouveau fragment doit dire CE QUE LE CONTEXTE dit — tu l'affines, tu ne le déplaces pas. Pars du phénomène. Garde le registre Tiqqun même si un autre opérateur est au centre. Produis UN seul fragment (Face A), minuscules, 5 à 9 phrases. Réponds uniquement par le fragment.`;
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
  function currentText(n) {
    const a = activeFragment(n);
    if (a != null) return a;
    const t = thesisOf(n);
    return t ? t.fragment : '';
  }

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
        <button class="gm-acc-btn" data-panel="edit">▸ éditer</button>
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

      <div class="gm-panel gm-edit-panel" data-panel="edit" hidden>
        <div class="gm-lab">✎ éditer à la main</div>
        <textarea class="gm-handedit" rows="6" spellcheck="false">${esc(currentText(n))}</textarea>
        <p class="gm-edit-hint">ta version remplace le fragment dans le fil — l'original reste dans le carrousel et le vault.</p>
        <div class="gm-actions">
          <button class="gm-save-manual">enregistrer ma version</button>
          <button class="gm-edit-cancel">réinitialiser</button>
          <span class="gm-edit-status"></span>
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
    const dots = vs.map((v, i) => `<button class="gm-dot${v.id === activeId ? ' cur' : ''}" data-i="${i}" title="${v.origin === 'canonical' ? 'original' : (v.author || '?') + (v.ts ? ' · ' + fmtDate(v.ts) : '')}"></button>`).join('');
    return `<div class="gm-car-head"><span class="gm-lab">versions — swipe</span><div class="gm-dots">${dots}</div></div>
      <div class="gm-car-track">${vs.map((v, i) => slideHTML(n, v, i, activeId)).join('')}</div>`;
  }

  function slideHTML(n, v, i, activeId) {
    const isActive = v.id === activeId;
    const mark = v.origin === 'manual' ? '✎ ' : '';
    const who = v.origin === 'canonical' ? 'original' : `${mark}${v.author || '?'}${v.ts ? ' · ' + fmtDate(v.ts) : ''}`;
    const canDelete = v.origin !== 'canonical' && v.author === author();
    return `<div class="gm-slide${v.id === activeId ? ' show' : ''}" data-i="${i}" data-id="${esc(v.id)}">
      <div class="gm-slide-meta"><span class="gm-who">${esc(who)}</span>${isActive ? '<span class="gm-active-tag">dans le fil</span>' : ''}</div>
      <div class="gm-slide-text">${md(v.fragment).replace(/\n/g, '<br>')}</div>
      <div class="gm-slide-actions">
        ${isActive ? '' : `<button class="gm-validate" data-id="${esc(v.id)}">valider → dans le fil</button>`}
        ${canDelete ? `<button class="gm-del" data-id="${esc(v.id)}" title="tu ne peux supprimer que tes propres versions">supprimer</button>` : ''}
      </div>
    </div>`;
  }

  // ════════════════ HYDRATATION (events) ══════════════════════════
  function onRenderChapter(contentEl) {
    if (!isOn()) return;
    contentEl.querySelectorAll('.gm').forEach((gm) => wireFragment(gm));
    contentEl.querySelectorAll('.entry').forEach((entry) => applyAnnotations(entry, +entry.id.replace('f-', '')));
  }

  function wireFragment(gm) {
    const n = +gm.dataset.n;
    // accordéons
    gm.querySelectorAll('.gm-acc-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const which = btn.dataset.panel;
        const panel = gm.querySelector(`.gm-panel[data-panel="${which}"]`);
        const open = panel.hasAttribute('hidden');
        if (open) {
          panel.removeAttribute('hidden');
          btn.textContent = '▾ ' + btn.textContent.slice(2);
          // à l'ouverture de l'éditeur, repartir du texte courant (dernière version dans le fil)
          if (which === 'edit') { const ed = panel.querySelector('.gm-handedit'); if (ed) ed.value = currentText(n); }
        } else {
          panel.setAttribute('hidden', '');
          btn.textContent = '▸ ' + btn.textContent.slice(2);
        }
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
    const hta = gm.querySelector('.gm-handedit');
    if (hta) hta.addEventListener('focus', () => setTimeout(() => hta.scrollIntoView({ block: 'center', behavior: 'smooth' }), 250));
    // édition manuelle
    const saveBtn = gm.querySelector('.gm-save-manual');
    if (saveBtn) saveBtn.addEventListener('click', () => saveManual(gm, n));
    const cancelBtn = gm.querySelector('.gm-edit-cancel');
    if (cancelBtn) cancelBtn.addEventListener('click', () => {
      const e2 = gm.querySelector('.gm-handedit'); if (e2) e2.value = currentText(n);
      const st = gm.querySelector('.gm-edit-status'); if (st) st.textContent = 'réinitialisé';
    });
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
    let idx = Math.max(0, slides.findIndex((s) => s.classList.contains('show'))); // démarre sur la version active
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
    // suppression (uniquement ses propres versions)
    car.querySelectorAll('.gm-del').forEach((b) => b.addEventListener('click', () => {
      if (confirm('Supprimer définitivement cette version ?')) deleteVersion(n, b.dataset.id);
    }));
  }

  // supprime une version — sécurité : seulement celles créées par l'utilisateur courant
  async function deleteVersion(n, id) {
    const entry = VARIANTS[n];
    if (!entry) return;
    const v = (entry.versions || []).find((x) => x.id === id);
    if (!v || v.author !== author()) return; // pas les versions des autres
    entry.versions = entry.versions.filter((x) => x.id !== id);
    if (entry.activeId === id) entry.activeId = 'orig'; // version active supprimée → retour à l'original
    dirty.add(n);
    const gm = document.querySelector('.gm[data-n="' + n + '"]');
    if (gm) {
      const en = gm.closest('.entry');
      const ft = en && en.querySelector('.fragment-text');
      if (ft) { const a = activeFragment(n); ft.innerHTML = renderFrag(a != null ? a : (thesisOf(n) || {}).fragment); }
      refreshCarousel(gm, n, false);
    }
    await persist(null);
  }

  // met à jour UNIQUEMENT ce fragment (carrousel + badge) sans recharger ni scroller
  function refreshCarousel(gm, n, goToNewest) {
    const car = gm.querySelector('.gm-carousel');
    if (car) {
      car.dataset.active = activeIdOf(n);
      car.innerHTML = carouselHTML(n);
      wireCarousel(gm, n);
    }
    const total = versionsOf(n).length;
    let cnt = gm.querySelector('.gm-count');
    if (!cnt && total > 1) {
      cnt = document.createElement('span');
      cnt.className = 'gm-count';
      gm.querySelector('.gm-bar').appendChild(cnt);
    }
    if (cnt) cnt.textContent = total > 1 ? total + ' versions' : '';
    if (goToNewest && car) {
      const dots = car.querySelectorAll('.gm-dot');
      if (dots.length) dots[dots.length - 1].click(); // affiche la version la plus récente
    }
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
      dirty.add(n);
      status.textContent = 'nouvelle version créée ✓';
      refreshCarousel(gm, n, true); // maj sur place, on reste où on est
      await persist(status);
    } catch (e) {
      status.textContent = '✗ ' + e.message;
    }
  }

  // enregistre une édition manuelle comme nouvelle version (et la met dans le fil)
  async function saveManual(gm, n) {
    const status = gm.querySelector('.gm-edit-status');
    const ta = gm.querySelector('.gm-handedit');
    const txt = (ta ? ta.value : '').trim();
    if (!txt) { if (status) status.textContent = 'texte vide'; return; }
    VARIANTS[n] = VARIANTS[n] || { activeId: 'orig', versions: [] };
    const id = rid();
    VARIANTS[n].versions.push({ id, fragment: txt, author: author(), ts: Date.now(), origin: 'manual' });
    VARIANTS[n].activeId = id; // l'édition manuelle passe directement dans le fil
    dirty.add(n);
    const entry = gm.closest('.entry');
    const ft = entry && entry.querySelector('.fragment-text');
    if (ft) ft.innerHTML = renderFrag(txt);
    refreshCarousel(gm, n, true);
    if (status) status.textContent = 'version enregistrée ✓ (dans le fil)';
    await persist(status);
  }

  async function validate(n, id) {
    VARIANTS[n] = VARIANTS[n] || { activeId: 'orig', versions: [] };
    VARIANTS[n].activeId = id;
    dirty.add(n);
    // maj sur place : le texte « dans le fil » + le carrousel, sans recharger ni scroller
    const gm = document.querySelector('.gm[data-n="' + n + '"]');
    if (gm) {
      const entry = gm.closest('.entry');
      const ft = entry && entry.querySelector('.fragment-text');
      if (ft) {
        const a = activeFragment(n);
        ft.innerHTML = renderFrag(a != null ? a : (thesisOf(n) || {}).fragment);
      }
      refreshCarousel(gm, n, false);
    }
    await persist(null);
  }

  // ════════════════ ANNOTATIONS (sélection + « C ») ═══════════════
  const dirtyAnno = new Set();
  function annosOf(n) { return ANNOTATIONS[n] || []; }
  function hexToRgba(hex, a) {
    const h = (hex || '#c9ff3c').replace('#', '');
    const f = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
    const num = parseInt(f, 16);
    return `rgba(${(num >> 16) & 255},${(num >> 8) & 255},${num & 255},${a})`;
  }

  async function fetchRemoteAnno() {
    if (!PROXY_URL) return null;
    try { const r = await fetch(PROXY_URL.replace(/\/$/, '') + '/annotations?_=' + Date.now(), { cache: 'no-store' }); if (r.ok) return await r.json(); } catch (e) {}
    return null;
  }
  function saveLocalAnno() { try { localStorage.setItem('sim_annotations_local', JSON.stringify(ANNOTATIONS)); } catch (e) {} }
  async function loadAnnotations() {
    let remote = await fetchRemoteAnno();
    if (remote === null) { try { const r = await fetch('data/annotations.json?_=' + Date.now(), { cache: 'no-store' }); if (r.ok) remote = await r.json(); } catch (e) {} }
    applyRemoteAnno(remote);
    if (window.__simRoute) window.__simRoute();
  }
  async function persistAnno() {
    saveLocalAnno();
    if (!PROXY_URL) return;
    try {
      const remote = (await fetchRemoteAnno()) || {};
      dirtyAnno.forEach((n) => { remote[n] = ANNOTATIONS[n]; });
      ANNOTATIONS = remote;
      const r = await fetch(PROXY_URL.replace(/\/$/, '') + '/annotations', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(ANNOTATIONS, null, 1) });
      if (r.ok) dirtyAnno.clear();
    } catch (e) { /* gardé en mémoire, re-tenté au prochain ajout */ }
  }

  function addAnnotation(n, text, message) {
    if (!text || !message) return;
    ANNOTATIONS[n] = ANNOTATIONS[n] || [];
    ANNOTATIONS[n].push({ id: rid(), text, message, author: author(), color: userColor(author()), ts: Date.now() });
    dirtyAnno.add(n);
    const entry = document.getElementById('f-' + n);
    if (entry) { const ft = entry.querySelector('.fragment-text'); if (ft) { ft.innerHTML = renderFrag(currentText(n)); applyAnnotations(entry, n); } }
    persistAnno();
  }
  function removeAnnotation(n, id) {
    const a = (ANNOTATIONS[n] || []).find((x) => x.id === id);
    if (!a || a.author !== author()) return; // on ne supprime que ses propres annotations
    ANNOTATIONS[n] = (ANNOTATIONS[n] || []).filter((x) => x.id !== id);
    dirtyAnno.add(n);
    const entry = document.getElementById('f-' + n);
    if (entry) { const ft = entry.querySelector('.fragment-text'); if (ft) { ft.innerHTML = renderFrag(currentText(n)); applyAnnotations(entry, n); } }
    persistAnno();
    hideTip();
  }

  // surlignage DOM à la couleur de l'auteur + tooltip
  function applyAnnotations(entry, n) {
    if (!isOn()) return;
    const ft = entry.querySelector('.fragment-text');
    if (!ft) return;
    annosOf(n).forEach((a) => wrapAnno(ft, a, n));
  }
  function wrapAnno(container, a, n) {
    const needle = a.text; if (!needle) return;
    const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, null);
    let node;
    while ((node = walker.nextNode())) {
      if (node.parentElement && node.parentElement.classList.contains('anno')) continue;
      const i = node.nodeValue.indexOf(needle);
      if (i >= 0) {
        const range = document.createRange();
        range.setStart(node, i); range.setEnd(node, i + needle.length);
        const mark = document.createElement('mark');
        mark.className = 'anno';
        mark.style.background = hexToRgba(a.color, 0.22);
        mark.style.borderBottom = '2px solid ' + (a.color || userColor(a.author));
        try { range.surroundContents(mark); bindAnnoTip(mark, a, n); } catch (e) {}
        return;
      }
    }
  }

  let annoTip = null;
  function hideTip() { if (annoTip) annoTip.style.display = 'none'; }
  function bindAnnoTip(mark, a, n) {
    const show = () => {
      if (!annoTip) { annoTip = document.createElement('div'); annoTip.className = 'anno-tip'; document.body.appendChild(annoTip); }
      const mine = a.author === author();
      annoTip.innerHTML =
        `<div class="anno-tip-head"><span class="anno-who" style="color:${a.color || userColor(a.author)}">${esc(a.author || '?')}</span> · ${esc(fmtDate(a.ts))}` +
        (mine ? ` <button class="anno-del" data-n="${n}" data-id="${esc(a.id)}">supprimer</button>` : '') +
        `</div><div class="anno-msg">${esc(a.message)}</div>`;
      const del = annoTip.querySelector('.anno-del');
      if (del) del.onclick = () => removeAnnotation(n, a.id);
      annoTip.style.borderLeft = '3px solid ' + (a.color || userColor(a.author));
      const r = mark.getBoundingClientRect();
      annoTip.style.display = 'block';
      annoTip.style.top = window.scrollY + r.bottom + 8 + 'px';
      annoTip.style.left = Math.min(window.scrollX + r.left, window.scrollX + window.innerWidth - 340) + 'px';
    };
    mark.addEventListener('mouseenter', show);
    mark.addEventListener('mouseleave', () => setTimeout(() => { if (annoTip && !annoTip.matches(':hover')) hideTip(); }, 200));
  }

  function openAnnoDialog(n, selectedText) {
    const m = modal(`
      <div class="gm-lab">annoter — fragment ${pad3(n)}</div>
      <blockquote class="anno-sel">« ${esc(selectedText)} »</blockquote>
      <textarea id="annoMsg" class="gm-input" rows="3" placeholder="ton commentaire…" autocomplete="off"></textarea>
      <div class="gm-modal-actions"><button id="annoOk" class="gm-primary">annoter</button> <button id="annoCancel" class="gm-edit-cancel">annuler</button></div>`);
    const ta = m.el.querySelector('#annoMsg'); ta.focus();
    m.el.querySelector('#annoCancel').onclick = () => m.close();
    const go = () => { const msg = ta.value.trim(); if (!msg) return; addAnnotation(n, selectedText, msg); m.close(); };
    m.el.querySelector('#annoOk').onclick = go;
    ta.addEventListener('keydown', (e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) go(); });
  }

  function onKeyAnnotate(e) {
    if (!isOn()) return;
    if (e.key !== 'c' && e.key !== 'C') return;
    const ae = document.activeElement;
    if (ae && (/^(INPUT|TEXTAREA)$/.test(ae.tagName) || ae.isContentEditable)) return;
    const sel = window.getSelection();
    if (!sel || !sel.rangeCount) return;
    const text = sel.toString().trim();
    if (!text || text.length < 2) return;
    const node = sel.anchorNode;
    const el = node && (node.nodeType === 3 ? node.parentElement : node);
    const entry = el && el.closest && el.closest('.entry');
    if (!entry) return;
    const ft = entry.querySelector('.fragment-text');
    if (!ft || !ft.contains(sel.anchorNode)) return;
    e.preventDefault();
    const n = +entry.id.replace('f-', '');
    openAnnoDialog(n, text);
    sel.removeAllRanges();
  }

  // ════════════════ DASHBOARD « mon atelier » ═════════════════════
  const chMeta = (ch) => (window.CHAPITRES || []).find((c) => c.ch === ch);
  const fragNo = (n) => String(n).padStart(3, '0');

  function myFragments() {
    const me = author();
    return (window.THESES || [])
      .filter((t) => { const e = VARIANTS[t.n]; return e && (e.versions || []).some((v) => v.author === me); })
      .sort((a, b) => a.n - b.n);
  }

  function allComments() {
    const out = [];
    Object.keys(ANNOTATIONS).forEach((n) => (ANNOTATIONS[n] || []).forEach((a) => out.push(Object.assign({ n: +n }, a))));
    return out.sort((x, y) => (x.ts || 0) - (y.ts || 0));
  }

  function renderDashboard(contentEl) {
    const me = author();
    const myCol = userColor(me);
    const mine = myFragments();

    // ── carrousel auto des fragments modifiés ──
    const cards = mine.map((t) => {
      const meta = chMeta(t.chapitre);
      return `<a class="dash-card" href="#f-${t.n}">
        <div class="dc-n">fragment ${fragNo(t.n)}</div>
        <div class="dc-ch">ch.${String(t.chapitre).padStart(2, '0')} · ${esc(meta ? meta.titre : '')}</div>
        <div class="dc-txt">${esc(currentText(t.n).slice(0, 170))}…</div>
      </a>`;
    });
    const carousel = mine.length
      ? `<div class="dash-carousel"><div class="dash-track">${cards.join('')}${cards.join('')}</div></div>`
      : '<p class="dash-empty">tu n\'as encore modifié aucun fragment. ouvre-en un, régénère ou édite, valide.</p>';

    // ── commentaires (toute l'équipe), chronologiques, signés couleur ──
    const comments = allComments();
    const commentsHTML = comments.length
      ? comments.map((c) => {
          const col = c.color || userColor(c.author);
          const meta = chMeta((thesisOf(c.n) || {}).chapitre);
          return `<a class="cmt-row" href="#f-${c.n}" style="--c:${col}">
            <div class="cmt-head"><span class="cmt-who" style="color:${col}">${esc(c.author || '?')}</span>
              <span class="cmt-frag">frag ${fragNo(c.n)}${meta ? ' · ' + esc(meta.titre) : ''}</span>
              <span class="cmt-date">${esc(fmtDate(c.ts))}</span></div>
            <div class="cmt-quote">« ${esc(c.text)} »</div>
            <div class="cmt-msg">${esc(c.message)}</div>
          </a>`;
        }).join('')
      : '<p class="dash-empty">aucun commentaire. sélectionne du texte dans un fragment et appuie sur C.</p>';

    // ── mes likes en accordéons (par numéro) ──
    const myLiked = (window.THESES || []).filter((t) => likesOf(t.n)[me]).sort((a, b) => a.n - b.n);
    const likesHTML = myLiked.length
      ? myLiked.map((t) => {
          const meta = chMeta(t.chapitre);
          return `<div class="like-acc">
            <button class="like-acc-head">
              <span class="la-n">${fragNo(t.n)}</span>
              <span class="la-snippet">${esc(currentText(t.n).slice(0, 120))}…</span>
              <span class="la-ch">ch.${String(t.chapitre).padStart(2, '0')}</span>
              <span class="la-caret">▸</span>
            </button>
            <div class="like-acc-body">
              <div class="la-full">${renderFrag(currentText(t.n))}</div>
              <a class="la-voir" href="#f-${t.n}">→ voir dans le fil</a>
            </div>
          </div>`;
        }).join('')
      : '<p class="dash-empty">aucun like — clique le ♥ sur les fragments que tu veux garder.</p>';

    contentEl.innerHTML = `<header class="ch-head">
        <div class="dash-presence" id="dashPresence"></div>
        <div class="label">god mode · <span style="color:${myCol}">${esc(me)}</span></div>
        <h1>Dashboard</h1>
        <div class="sub">tes fragments en cours, les commentaires de l'équipe, et ta collection.</div>
      </header>
      <section class="dash-section">
        <div class="dash-sec-label" style="color:${myCol}">▸ tes fragments modifiés — ${mine.length}</div>
        ${carousel}
      </section>
      <section class="dash-section">
        <div class="dash-sec-label">▸ commentaires — ${comments.length}</div>
        ${commentsHTML}
      </section>
      <section class="dash-section">
        <div class="dash-sec-label">♥ ma collection — ${myLiked.length}</div>
        ${likesHTML}
      </section>`;

    contentEl.querySelectorAll('.like-acc-head').forEach((h) =>
      h.addEventListener('click', () => h.parentElement.classList.toggle('open'))
    );
    renderPresence();
  }

  // présence (qui est connecté) — branché plus tard via Cloudflare KV
  function renderPresence() { /* slot #dashPresence : vide tant qu'aucun backend de présence */ }

  // ════════════════ SIDEBAR : bouton + réglages ═══════════════════
  function onRenderSidebar(sidebarEl) {
    const foot = sidebarEl.querySelector('.side-foot');
    if (!foot) return;
    const on = isOn();
    const ctl = document.createElement('div');
    ctl.className = 'gm-side';
    const col = on ? userColor(author()) : '';
    ctl.innerHTML = on
      ? `<div class="gm-side-on"><span class="gm-dot" style="color:${col}">●</span> <b>god mode</b> — ${esc(author())}</div>
         <div class="gm-side-btns">
           <button id="gmDash">Dashboard</button>
           ${PROXY_URL ? '' : '<button id="gmSettings">réglages</button>'}
           <button id="gmLock">quitter</button>
         </div>`
      : `<button id="gmEnter">⌁ god mode</button>`;
    foot.appendChild(ctl);
    document.body.classList.toggle('god-on', on); // cadre coloré autour de la page
    if (on) {
      document.body.style.setProperty('--god-color', col);
      document.body.style.setProperty('--god-sel', hexToRgba(col, 0.32)); // sélection de texte
    } else {
      document.body.style.removeProperty('--god-color');
      document.body.style.removeProperty('--god-sel');
    }

    if (on) {
      sidebarEl.querySelector('#gmLock').onclick = () => {
        LS.code = ''; document.body.classList.remove('god-on');
        document.body.style.removeProperty('--god-color');
        document.body.style.removeProperty('--god-sel'); location.hash = '';
        if (window.__simRoute) window.__simRoute();
      };
      sidebarEl.querySelector('#gmDash').onclick = () => { location.hash = '#mine'; };
      const st = sidebarEl.querySelector('#gmSettings');
      if (st) st.onclick = openSettings;
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
      <p class="gm-modal-p">ton mot de passe.</p>
      <input id="gmCode" type="password" placeholder="mot de passe" class="gm-input" autocomplete="off">
      <div class="gm-modal-actions"><button id="gmOk" class="gm-primary">entrer</button><span id="gmErr" class="gm-err"></span></div>`);
    const inp = m.el.querySelector('#gmCode');
    inp.focus();
    const go = () => {
      const c = inp.value.trim();
      if (USERS[c]) {
        LS.code = c; m.close();
        loadVariants(); loadAnnotations(); // récupère les likes/commentaires des autres
        if (window.__simRoute) window.__simRoute();
      } else m.el.querySelector('#gmErr').textContent = 'mot de passe invalide';
    };
    m.el.querySelector('#gmOk').onclick = go;
    inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') go(); });
  }

  function openSettings() {
    const viaProxy = !!PROXY_URL;
    const body = viaProxy
      ? `<p class="gm-modal-p" style="color:var(--accent)">✓ clé API et partage des variantes gérés par le proxy Cloudflare.<br><span style="color:var(--muted)">rien à entrer — tes variantes vont automatiquement sur GitHub, visibles par tous les contributeurs.</span></p>`
      : `<p class="gm-modal-p">stockés uniquement dans ce navigateur.</p>
         <label class="gm-flab">clé API Anthropic <small>(sk-ant-…)</small></label>
         <input id="gmKey" type="password" class="gm-input" placeholder="sk-ant-..." value="${esc(LS.apiKey)}" autocomplete="off">
         <label class="gm-flab">token GitHub <small>(fine-grained, Contents: read+write sur ${GH.owner}/${GH.repo})</small></label>
         <input id="gmTok" type="password" class="gm-input" placeholder="github_pat_..." value="${esc(LS.ghToken)}" autocomplete="off">`;
    const m = modal(`
      <div class="gm-lab">réglages god mode — ${author()}</div>
      ${body}
      <div class="gm-modal-actions"><button id="gmSave" class="gm-primary">${viaProxy ? 'ok' : 'enregistrer'}</button><span id="gmSaved" class="gm-ok"></span></div>`);
    m.el.querySelector('#gmSave').onclick = () => {
      const k = m.el.querySelector('#gmKey'); if (k) LS.apiKey = k.value.trim();
      const tk = m.el.querySelector('#gmTok'); if (tk) LS.ghToken = tk.value.trim();
      if (viaProxy) m.close(); else m.el.querySelector('#gmSaved').textContent = 'enregistré ✓';
    };
  }

  // ── init ────────────────────────────────────────────────────────
  loadLocalInto();
  loadVariants();
  loadMetas();
  loadAnnotations();
  document.addEventListener('keydown', onKeyAnnotate);

  // ── sync auto : voir les likes/commentaires des autres sans refresh ──
  // le DISTANT fait foi (suppressions des autres propagées). On ne ré-ajoute
  // que SES propres éléments locaux pas encore synchronisés.
  function applyRemoteVariants(remote) {
    const base = remote ? JSON.parse(JSON.stringify(remote)) : {};
    let local = {}; try { local = JSON.parse(localStorage.getItem('sim_variants_local') || '{}'); } catch (e) {}
    const me = author();
    Object.keys(local).forEach((k) => {
      const lv = local[k]; if (!lv) return;
      const bk = (base[k] = base[k] || { activeId: 'orig', versions: [] });
      (lv.versions || []).forEach((v) => {
        if (v.author === me && !(bk.versions || []).some((x) => x.id === v.id)) { bk.versions = bk.versions || []; bk.versions.push(v); }
      });
      if (lv.likes && me && lv.likes[me]) { bk.likes = bk.likes || {}; if (!bk.likes[me]) bk.likes[me] = lv.likes[me]; }
    });
    VARIANTS = base;
  }
  function applyRemoteAnno(remote) {
    const base = remote ? JSON.parse(JSON.stringify(remote)) : {};
    let local = {}; try { local = JSON.parse(localStorage.getItem('sim_annotations_local') || '{}'); } catch (e) {}
    const me = author();
    Object.keys(local).forEach((k) => {
      (local[k] || []).forEach((a) => {
        if (a.author !== me) return; // jamais les annotations des autres : le distant fait foi
        base[k] = base[k] || [];
        if (!base[k].some((x) => x.id === a.id)) base[k].push(a);
      });
    });
    ANNOTATIONS = base;
  }
  let _lastV = null, _lastA = null;
  async function poll() {
    if (!PROXY_URL) return;
    if (document.querySelector('.gm-modal-back')) return;          // modale ouverte → on attend
    const ae = document.activeElement;
    if (ae && /^(INPUT|TEXTAREA)$/.test(ae.tagName)) return;       // en train de taper → on attend
    try {
      const [rv, ra] = await Promise.all([fetchRemoteVariants(), fetchRemoteAnno()]);
      let changed = false;
      if (rv !== null) { const h = JSON.stringify(rv); if (_lastV !== null && h !== _lastV) { applyRemoteVariants(rv); changed = true; } _lastV = h; }
      if (ra !== null) { const h = JSON.stringify(ra); if (_lastA !== null && h !== _lastA) { applyRemoteAnno(ra); changed = true; } _lastA = h; }
      if (changed && window.__simRoute) { const y = window.scrollY; window.__simRoute(); window.scrollTo(0, y); } // ne pas remonter en haut
    } catch (e) {}
  }
  setInterval(poll, 15000);

  window.GodMode = { isOn, author, activeFragment, controlsHTML, onRenderChapter, onRenderSidebar, renderDashboard, likeHTML, wireLikes };
})();
