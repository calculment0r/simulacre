// Génère les 221 méta-restitutions (contexte) via le proxy Opus 4.8 → site/data/metas.json
// Usage : node tools/gen-metas.mjs
import { readFileSync, writeFileSync } from 'node:fs';

const PROXY = 'https://simulacre-proxy.luxigone.workers.dev';
const MODEL = 'claude-opus-4-8';
const CONC = 6;

const META_SYSTEM = `Tu restitues en UNE seule phrase simple et claire ce dont parle l'analyse d'une thèse du livre « La Société du Simulacre » selon ses auteurs de référence. Style neutre, informatif, synthétique : PAS d'aphorisme, PAS le style Tiqqun, pas de minuscules obligatoires, pas de jargon académique. La phrase dit simplement de quoi ça parle, pour orienter le lecteur. Réponds uniquement par cette phrase.`;

const theses = JSON.parse(readFileSync('site/data/theses.json', 'utf8'));
const out = {};
const errs = [];
let idx = 0, done = 0;

async function gen(t) {
  const user = `Sens de la thèse : ${t.sens_pour_debord}

Ce que les auteurs en disent :
${(t.pourquoi || []).map((p) => '- ' + p).join('\n')}

Donne la phrase de méta-restitution (une seule phrase, simple et claire).`;
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
