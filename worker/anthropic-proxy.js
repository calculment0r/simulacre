/* ── Proxy god mode (Cloudflare Worker) ───────────────────────────
   Trois rôles, secrets côté serveur (jamais dans le repo) :
   1) Proxy Anthropic        → POST /                 (secret ANTHROPIC_KEY)
   2) Stores partagés GitHub  → GET/POST /variants, /annotations, /chat
                                                       (secret GITHUB_TOKEN)
   Personne n'entre de clé ni de token. Tout vit dans le repo, visible par tous.

   SECRETS CLOUDFLARE (Worker → Settings → Variables and Secrets) :
   - ANTHROPIC_KEY = sk-ant-...
   - GITHUB_TOKEN  = github_pat_...  (fine-grained, Contents: read+write sur calculment0r/simulacre)
   ─────────────────────────────────────────────────────────────── */

const ALLOW_ORIGIN = 'https://calculment0r.github.io';
const REPO = 'calculment0r/simulacre';
const FILES = {
  variants: 'site/data/variants.json',
  annotations: 'site/data/annotations.json',
  chat: 'site/data/chat.json',
};

export default {
  async fetch(request, env) {
    const cors = {
      'Access-Control-Allow-Origin': ALLOW_ORIGIN,
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'content-type',
    };
    if (request.method === 'OPTIONS') return new Response(null, { headers: cors });

    const url = new URL(request.url);
    const seg = url.pathname.split('/').filter(Boolean).pop();

    // ── stores partagés (variants / annotations / chat) via GitHub ──
    if (FILES[seg]) {
      if (!env.GITHUB_TOKEN) return j(500, { error: 'GITHUB_TOKEN manquant sur le Worker' }, cors);
      const gh = {
        Authorization: 'Bearer ' + env.GITHUB_TOKEN,
        'User-Agent': 'simulacre-worker',
        Accept: 'application/vnd.github+json',
      };
      const api = `https://api.github.com/repos/${REPO}/contents/${FILES[seg]}`;

      if (request.method === 'GET') {
        const r = await fetch(api + '?ref=main', { headers: gh });
        if (r.status === 404) return new Response('{}', { status: 200, headers: { ...cors, 'content-type': 'application/json' } });
        if (!r.ok) return j(r.status, { error: (await r.text()).slice(0, 160) }, cors);
        const data = await r.json();
        const txt = decodeURIComponent(escape(atob((data.content || '').replace(/\n/g, ''))));
        return new Response(txt || '{}', { status: 200, headers: { ...cors, 'content-type': 'application/json' } });
      }

      if (request.method === 'POST') {
        const body = await request.text();
        for (let i = 0; i < 3; i++) {
          let sha;
          const cur = await fetch(api + '?ref=main', { headers: gh });
          if (cur.ok) sha = (await cur.json()).sha;
          const put = await fetch(api, {
            method: 'PUT',
            headers: gh,
            body: JSON.stringify({ message: `${seg} god mode`, content: b64(body), branch: 'main', sha }),
          });
          if (put.ok) return j(200, { ok: true }, cors);
          if (put.status !== 409) return j(put.status, { error: (await put.text()).slice(0, 160) }, cors);
        }
        return j(409, { error: 'conflit après plusieurs tentatives' }, cors);
      }
      return j(405, { error: 'méthode non supportée' }, cors);
    }

    // ── proxy Anthropic (défaut) ────────────────────────────────────
    if (request.method !== 'POST') return new Response('POST only', { status: 405, headers: cors });
    const body = await request.text();
    const upstream = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-api-key': env.ANTHROPIC_KEY, 'anthropic-version': '2023-06-01' },
      body,
    });
    const text = await upstream.text();
    return new Response(text, { status: upstream.status, headers: { ...cors, 'content-type': 'application/json' } });
  },
};

function j(status, obj, cors) {
  return new Response(JSON.stringify(obj), { status, headers: { ...cors, 'content-type': 'application/json' } });
}
function b64(s) {
  return btoa(unescape(encodeURIComponent(s)));
}
