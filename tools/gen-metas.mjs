// Génère les 221 méta-restitutions (contexte) via le proxy Opus 4.8 → site/data/metas.json
// Usage : node tools/gen-metas.mjs
import { readFileSync, writeFileSync } from 'node:fs';

const PROXY = 'https://simulacre-proxy.luxigone.workers.dev';
const MODEL = 'claude-opus-4-8';
const CONC = 6;

const META_SYSTEM = `Tu écris une courte note de contexte pour un fragment du livre « La Société du Simulacre » (une critique de l'IA générative). En UNE à DEUX phrases — claires, directes, synthétiques, tranchantes — dis ce que ce fragment AFFIRME : de quoi il parle, ce qu'il pointe, dans l'univers du Simulacre (l'IA générative, les modèles, la pensée externalisée, l'infrastructure du calcul, le pouvoir). NE mentionne JAMAIS Debord ni « le spectacle » : on reste entièrement dans notre monde, celui du Simulacre. Pas d'aphorisme, pas de jargon : une explicitation nette qui oriente le lecteur sur le sens du fragment. Réponds uniquement par cette ou ces deux phrases.`;

const theses = JSON.parse(readFileSync('site/data/theses.json', 'utf8'));
const out = {};
const errs = [];
let idx = 0, done = 0;

async function gen(t) {
  const user = `FRAGMENT :
${t.fragment}

CE QUE LES OPÉRATEURS Y LISENT :
${(t.pourquoi || []).map((p) => '- ' + p).join('\n')}

Donne la note de contexte (1 à 2 phrases, directe et synthétique, dans l'univers du Simulacre, SANS jamais citer Debord ni le spectacle).`;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const r = await fetch(PROXY, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ model: MODEL, max_tokens: 300, system: META_SYSTEM, messages: [{ role: 'user', content: user }] }),
      });
      if (!r.ok) throw new Error('HTTP ' + r.status + ' ' + (await r.text()).slice(0, 120));
      const d = await r.json();
      const b = (d.content || []).find((x) => x.type === 'text');
      const s = (b ? b.text : '').trim().replace(/^["«»\s]+|["«»\s]+$/g, '').trim();
      if (!s) throw new Error('réponse vide');
      return s;
    } catch (e) {
      if (attempt === 2) throw e;
      await new Promise((res) => setTimeout(res, 1500 * (attempt + 1)));
    }
  }
}

async function worker() {
  while (idx < theses.length) {
    const t = theses[idx++];
    try {
      out[t.n] = await gen(t);
    } catch (e) {
      errs.push(t.n);
      console.log('ERR ' + t.n + ' : ' + e.message);
    }
    if (++done % 20 === 0) console.log(done + '/' + theses.length);
  }
}

await Promise.all(Array.from({ length: CONC }, worker));

const ordered = {};
Object.keys(out).map(Number).sort((a, b) => a - b).forEach((n) => (ordered[n] = out[n]));
writeFileSync('site/data/metas.json', JSON.stringify(ordered, null, 1));
console.log(
  'écrit metas.json : ' + Object.keys(ordered).length + '/' + theses.length +
  (errs.length ? ' — ÉCHECS : ' + errs.join(',') : ' — complet ✓')
);
