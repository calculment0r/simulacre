// Parser : MANUSCRIT_KUBERNAN.md → site/kubernan/data/book.js (window.KUBERNAN)
// Usage : node tools/parse-kubernan.mjs
// Le manuscrit est la SOURCE DE VÉRITÉ — on ne réécrit pas le texte, on le structure.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const SRC = join(ROOT, 'KUBERNAN', 'doc input', 'MANUSCRIT_KUBERNAN.md');
const OUTDIR = join(ROOT, 'site', 'kubernan', 'data');

const RX_ROMAN = '(IV|III|II|I)';
const ROMAN2N = { I: 1, II: 2, III: 3, IV: 4 };

const reTitle = /^#\s+(.+?)\s*$/;
const reBif = new RegExp(`^Bifurcation\\s+${RX_ROMAN}\\s+—\\s+(.+?)\\s*$`);
const reSub = new RegExp(`^${RX_ROMAN}\\.(\\d+)\\s+—\\s+(.+?)\\s*$`);
const reConcl = /^Conclusion\s+—\s+(.+?)\s*$/;
const reSommSub = new RegExp(`^-\\s+Bifurcation\\s+${RX_ROMAN}\\s+—\\s+.+?\\s+·\\s+\\*(.+?)\\*\\s*$`);

const raw = readFileSync(SRC, 'utf8').replace(/\r\n/g, '\n');
const lines = raw.split('\n');

// ── méta : titre + sous-titres en italique de tête ─────────────────────
let title = '';
const subtitleLines = [];
for (let i = 0; i < lines.length; i++) {
  const l = lines[i].trim();
  if (!title && reTitle.test(l)) { title = l.match(reTitle)[1]; continue; }
  if (title && l.startsWith('*') && l.endsWith('*')) subtitleLines.push(l.slice(1, -1).trim());
  if (l === '---') break; // fin de l'en-tête
}

// ── sous-titres nautiques (depuis le Sommaire) ─────────────────────────
const subtitles = {}; // roman -> "relever sa position"
for (const l of lines) {
  const m = l.trim().match(reSommSub);
  if (m) subtitles[m[1]] = m[2].trim();
}

// ── découpe en blocs H2 (terminés par un autre ## ou une règle ---) ────
// On collecte (heading, bodyLines[]) pour chaque ## , en ignorant le Sommaire.
// La prose libre apparue APRÈS le premier ## (sans titre) est captée comme
// bloc « __loose__ » : c'est le seuil de la coda (l'ellipse, sans titre).
const blocks = [];
let cur = null;
let started = false;
for (const line of lines) {
  const h2 = line.match(/^##\s+(.+?)\s*$/);
  if (h2) {
    started = true;
    cur = { heading: h2[1].trim(), body: [] };
    blocks.push(cur);
    continue;
  }
  if (line.trim() === '---') { cur = null; continue; } // les règles ferment le bloc courant
  if (cur) { cur.body.push(line); continue; }
  if (started && line.trim() !== '') {                 // prose libre = seuil de la coda
    cur = { heading: '__loose__', body: [line] };
    blocks.push(cur);
  }
}

// texte d'un bloc → tableau de paragraphes (split sur lignes vides)
const toParas = (bodyLines) =>
  bodyLines
    .join('\n')
    .split(/\n{2,}/)
    .map((p) => p.replace(/\s+/g, ' ').trim())
    .filter(Boolean);

// ── classification ─────────────────────────────────────────────────────
let preface = null;
const bifs = []; // {n, roman, titre, sous_titre, intro:[], sections:[], conclusion:{bridge, paras}}
let curBif = null;
let codaSeuil = null;   // prose de liaison (l'ellipse, sans titre)
let codaLettre = null;  // la lettre « Enfin dehors »

for (const b of blocks) {
  const h = b.heading;
  if (/^Sommaire$/i.test(h)) continue;
  // coda — seuil (prose libre) et lettre (## Enfin dehors)
  if (h === '__loose__') {
    codaSeuil = toParas(b.body);
    continue;
  }
  if (/^Enfin dehors$/i.test(h)) {
    const ps = toParas(b.body);
    let sous_titre = '';
    if (ps.length && /^\*.+\*$/.test(ps[0])) sous_titre = ps.shift().replace(/^\*|\*$/g, '').trim();
    codaLettre = { titre: 'Enfin dehors', sous_titre, paras: ps };
    continue;
  }
  if (/^Préface$/i.test(h)) {
    preface = { id: 'preface', titre: 'Préface', paras: toParas(b.body) };
    continue;
  }
  let m;
  if ((m = h.match(reBif))) {
    const roman = m[1];
    curBif = {
      n: ROMAN2N[roman],
      roman,
      titre: m[2].trim(),
      sous_titre: subtitles[roman] || '',
      intro: toParas(b.body),
      sections: [],
      conclusion: null,
    };
    bifs.push(curBif);
    continue;
  }
  if ((m = h.match(reSub))) {
    if (!curBif) throw new Error('sous-section hors bifurcation : ' + h);
    const roman = m[1], k = +m[2];
    curBif.sections.push({
      id: `b-${ROMAN2N[roman]}-${k}`,
      num: `${roman}.${k}`,
      titre: m[3].trim(),
      paras: toParas(b.body),
    });
    continue;
  }
  if ((m = h.match(reConcl))) {
    if (!curBif) throw new Error('conclusion hors bifurcation : ' + h);
    // le #4 est retiré : « Enfin dehors » est désormais la coda du livre
    const bridge = m[1].trim().replace(/vers le #4 \(\*?Enfin dehors\*?\)/i, 'vers Enfin dehors');
    curBif.conclusion = { bridge, paras: toParas(b.body) };
    continue;
  }
  console.warn('⚠ bloc non classé, ignoré :', h);
}

bifs.sort((a, b) => a.n - b.n);

// ── validation ─────────────────────────────────────────────────────────
const report = [];
if (!preface) throw new Error('préface introuvable');
report.push(`préface : ${preface.paras.length} §`);
if (bifs.length !== 4) throw new Error(`attendu 4 bifurcations, trouvé ${bifs.length}`);
for (const bf of bifs) {
  if (!bf.conclusion) throw new Error(`bifurcation ${bf.roman} sans conclusion`);
  if (!bf.sous_titre) console.warn(`⚠ bifurcation ${bf.roman} sans sous-titre`);
  // numérotation contigüe des sous-sections
  bf.sections.forEach((s, i) => {
    const want = `${bf.roman}.${i + 1}`;
    if (s.num !== want) console.warn(`⚠ ${bf.roman} : section ${s.num} attendue ${want}`);
  });
  report.push(
    `bifurcation ${bf.roman} — ${bf.titre} · ${bf.sous_titre} : ` +
      `${bf.intro.length} § intro, ${bf.sections.length} sections, ${bf.conclusion.paras.length} § conclusion`
  );
}

// ── coda « Enfin dehors » — au-delà de la passe (même livre) ───────────
if (!codaSeuil) console.warn('⚠ seuil de la coda introuvable');
if (!codaLettre) throw new Error('lettre « Enfin dehors » introuvable');
const coda = {
  id: 'coda',
  seuil: codaSeuil || [],
  lettre: codaLettre,
};
report.push(`coda : ${coda.seuil.length} § seuil, lettre « ${codaLettre.titre} » (${codaLettre.paras.length} §)`);

// ── sortie ─────────────────────────────────────────────────────────────
const data = {
  meta: {
    title,
    subtitle: subtitleLines,
    pacte: "Ce n'est pas un traité. C'est une carte.",
    serie: 'tétralogie · troisième bifurcation',
  },
  preface,
  bifurcations: bifs,
  coda,
};

mkdirSync(OUTDIR, { recursive: true });
const json = JSON.stringify(data, null, 2);
const js =
  '/* généré par tools/parse-kubernan.mjs — ne pas éditer à la main */\n' +
  'window.KUBERNAN = ' + json + ';\n';
writeFileSync(join(OUTDIR, 'book.js'), js, 'utf8');
writeFileSync(join(OUTDIR, 'book.json'), json + '\n', 'utf8');

console.log('✓ book.js + book.json écrits dans site/kubernan/data/');
console.log('  titre :', title);
report.forEach((r) => console.log('  ' + r));
