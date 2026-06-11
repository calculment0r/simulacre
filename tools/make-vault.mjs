// Régénère le vault (snapshot canonique) depuis les données courantes.
// Inclut : 221 fragments + structure des 9 chapitres (titres, catégories, LOGLINES).
// Usage : node tools/make-vault.mjs
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const theses = JSON.parse(readFileSync(join(ROOT, 'site/data/theses.json'), 'utf8'));

// les loglines vivent dans window.CHAPITRES (data/theses.js)
const js = readFileSync(join(ROOT, 'site/data/theses.js'), 'utf8');
const m = js.match(/window\.CHAPITRES = (\[[\s\S]*?\]);/);
const CH = JSON.parse(m[1]);

mkdirSync(join(ROOT, 'vault'), { recursive: true });
writeFileSync(join(ROOT, 'vault/theses.v0.json'), JSON.stringify(theses, null, 2));
writeFileSync(join(ROOT, 'vault/chapitres-v0.json'), JSON.stringify(CH, null, 2));

const byCh = {};
theses.forEach((e) => { (byCh[e.chapitre] = byCh[e.chapitre] || []).push(e); });

let md = '# VAULT — Fragments V0\n\n';
md += '> Snapshot des 221 fragments (V0) + structure des 9 chapitres : titres, catégories et **loglines**.\n';
md += '> Version originale figée avant la production V2. Ne pas éditer — régénérer avec `node tools/make-vault.mjs`.\n';
CH.forEach((c) => {
  const list = (byCh[c.ch] || []).sort((a, b) => a.n - b.n);
  md += `\n\n## Chapitre ${c.ch} — ${c.titre}  ·  ${c.cat}  ·  (${c.min}–${c.max})\n\n`;
  md += `> ${c.logline}\n`;
  list.forEach((e) => { md += `\n### Fragment ${e.n}\n\n${e.fragment}\n`; });
});
writeFileSync(join(ROOT, 'vault/fragments-v0.md'), md);

console.log(`vault régénéré : ${theses.length} fragments, ${CH.length} chapitres (titres + catégories + loglines)`);
