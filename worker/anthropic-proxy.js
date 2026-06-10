/* ── Proxy Anthropic pour le god mode (Cloudflare Worker) ──────────
   But : garder la clé API SECRÈTE côté serveur. Eric (et toi) n'entrez
   aucune clé ; le site appelle ce worker, le worker appelle Anthropic.
   Fonctionne PC éteint (Cloudflare est toujours allumé).

   DÉPLOIEMENT (≈5 min, gratuit) :
   1. Crée un compte Cloudflare → Workers & Pages → Create → Worker.
   2. Colle ce fichier comme code du worker, Deploy.
   3. Settings → Variables and Secrets → ajoute un SECRET nommé
      ANTHROPIC_KEY = ta clé sk-ant-...  (c'est TOI qui la saisis ici,
      jamais dans le repo).
   4. Copie l'URL du worker (https://xxxx.workers.dev) dans
      site/assets/godmode.js → const PROXY_URL = 'https://xxxx.workers.dev';
   5. git push → en god mode, plus aucune clé à coller.
   ─────────────────────────────────────────────────────────────── */

const ALLOW_ORIGIN = 'https://calculment0r.github.io'; // restreint l'usage au site

export default {
  async fetch(request, env) {
    const cors = {
      'Access-Control-Allow-Origin': ALLOW_ORIGIN,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'content-type',
    };
    if (request.method === 'OPTIONS') return new Response(null, { headers: cors });
    if (request.method !== 'POST') return new Response('POST only', { status: 405, headers: cors });

    const body = await request.text(); // { model, max_tokens, system, messages }
    const upstream = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': env.ANTHROPIC_KEY,
        'anthropic-version': '2023-06-01',
      },
      body,
    });
    const text = await upstream.text();
    return new Response(text, {
      status: upstream.status,
      headers: { ...cors, 'content-type': 'application/json' },
    });
  },
};
