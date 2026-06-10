// Parser : fichiers .md des Fragments → data/theses.json + data/theses.js
// Usage : node tools/parse.mjs
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const FRAG = join(ROOT, 'Fragments');
const OUT = join(ROOT, 'site', 'data');

// ── Mapping chapitres (titres autonomes, cf. CLAUDE.md §9) ──────────────
const CHAPTERS = [
  { ch: 1, titre: 'La faculté séparée', min: 1, max: 34 },
  { ch: 2, titre: 'La cognition comme marchandise', min: 35, max: 53 },
  { ch: 3, titre: "L'unité apparente de l'intelligence", min: 54, max: 72 },
  { ch: 4, titre: "De l'utilisateur à l'opérateur", min: 73, max: 124 },
  { ch: 5, titre: 'Temps, inférence et histoire', min: 125, max: 146 },
  { ch: 6, titre: 'Le quotidien génératif', min: 147, max: 164 },
  { ch: 7, titre: "L'infrastructure du Simulacre", min: 165, max: 179 },
  { ch: 8, titre: 'La culture et la négation générée', min: 180, max: 211 },
  { ch: 9, titre: "L'idéologie opératoire", min: 212, max: 221 },
];
const chapForN = (n) => CHAPTERS.find((c) => n >= c.min && n <= c.max);

// ── Fichiers source + plage acceptée (filtre les recouvrements) ─────────
const SOURCES = [
  ['innosens_fragments_01_04.md', 1, 4],
  ['innosens_fragments_05_14.md', 5, 14],
  ['simulacre_fragments_15_24.md', 15, 24],
  ['simulacre_fragments_25_34.md', 25, 34],
  ['simulacre_fragments_35_44.md', 35, 44],
  ['simulacre_fragments_45_53.md', 45, 53],
  ['simulacre_fragments_54_63.md', 54, 63],
  ['simulacre_fragments_64_72.md', 64, 72],
  ['simulacre_fragments_73_82.md', 73, 82],
  ['simulacre_fragments_83_94_complet.md', 83, 94],
  ['simulacre_fragments_95_106_complet.md', 95, 106],
  ['simulacre_fragments_107_118_complet.md', 107, 112], // 113-118 obsolètes
  ['simulacre_fragments_113_124_complet.md', 113, 124],
  ['simulacre_fragments_125_135_complet.md', 125, 135],
  ['simulacre_fragments_136_146_complet.md', 136, 146],
  ['simulacre_fragments_147_155_complet.md', 147, 155],
  ['simulacre_fragments_156_164_complet.md', 156, 164],
  ['simulacre_fragments_165_172_complet.md', 165, 172],
  ['simulacre_fragments_173_179_complet.md', 173, 179],
  ['simulacre_fragments_180_190_complet.md', 180, 190],
  ['simulacre_fragments_191_201_complet.md', 191, 201],
  ['simulacre_fragments_202_211_complet.md', 202, 211],
  ['simulacre_fragments_212_221_complet.md', 212, 221],
];

// ── Normalisation terminologique Inno/Sens, Inno-Sens → Simulacre ───────
function normalizeTerm(s) {
  if (!s) return s;
  // formes avec article élidé : l'/L'/d'/D' + Inno[/-]Sens  (apostrophe droite ou typographique)
  s = s.replace(/([lLdD])['’]Inno[\/\-]Sens/g, (m, a) => {
    const map = { l: 'le', L: 'Le', d: 'de', D: 'De' };
    return map[a] + ' Simulacre';
  });
  // formes nues
  s = s.replace(/Inno[\/\-]Sens/g, 'Simulacre');
  // contractions résiduelles à + le / de + le
  s = s.replace(/\bà le Simulacre\b/g, 'au Simulacre');
  s = s.replace(/\bde le Simulacre\b/g, 'du Simulacre');
  return s;
}

// ── Nettoyage d'un bloc de texte de champ ───────────────────────────────
function cleanField(raw) {
  let t = raw.trim();
  // retire un éventuel enrobage *...* (italique markdown) global
  if (t.startsWith('*') && t.endsWith('*') && t.length > 2) {
    const inner = t.slice(1, -1);
    if (!inner.includes('\n')) t = inner.trim();
  }
  return normalizeTerm(t).trim();
}

// ── Extraction du nom d'auteur d'une puce ───────────────────────────────
function authorOf(bullet) {
  // format **Nom** ...
  let m = bullet.match(/^\s*[-—–]\s*\*\*([^*]+)\*\*/);
  if (m) return m[1].replace(/\s*\(.*$/, '').trim();
  // format — Nom (...) : ...   ou   — Nom : ...
  m = bullet.match(/^\s*[-—–]\s*([A-ZÀ-ÿ][^:(]{1,40}?)\s*[:(]/);
  if (m) {
    const name = m[1].trim();
    // écarte les puces "méthode" sans auteur clair (phrase longue)
    if (/\s/.test(name) && name.split(/\s+/).length > 4) return null;
    return name;
  }
  return null;
}

// ── Parse un fichier → liste d'entrées {n, ...} ─────────────────────────
const FIELD_LABELS = {
  debord: /\*\*\s*Debord\s*[—–-]\s*th[èe]se\s*\d*\s*:?\s*\*\*/i,
  sens: /\*\*\s*Sens pour Debord\s*:?\s*\*\*/i,
  fragment: /\*\*\s*Notre fragment\s*:?\s*\*\*/i,
  pourquoi: /\*\*\s*Pourquoi\s*\/\s*auteurs\s*:?\s*\*\*/i,
};
// en-tête de fragment : "## FRAGMENT 12" ou "**FRAGMENT 12**"
const HEADER_RE = /^(?:#{1,6}\s*)?\*{0,2}\s*FRAGMENT\s+(\d+)\s*\*{0,2}\s*$/im;

function parseFile(text) {
  const lines = text.split(/\r?\n/);
  // repère les indices de début de chaque fragment
  const heads = [];
  lines.forEach((ln, i) => {
    const m = ln.match(/^(?:#{1,6}\s*)?\*{0,2}\s*FRAGMENT\s+(\d+)\s*\*{0,2}\s*$/i);
    if (m) heads.push({ n: parseInt(m[1], 10), i });
  });
  const entries = [];
  for (let h = 0; h < heads.length; h++) {
    const start = heads[h].i + 1;
    const end = h + 1 < heads.length ? heads[h + 1].i : lines.length;
    const block = lines.slice(start, end).join('\n');
    entries.push({ n: heads[h].n, block });
  }
  return entries;
}

// découpe un bloc selon les 4 labels, dans l'ordre d'apparition
function splitFields(block) {
  const markers = [];
  for (const [key, re] of Object.entries(FIELD_LABELS)) {
    const m = block.match(re);
    if (m) markers.push({ key, idx: m.index, len: m[0].length });
  }
  markers.sort((a, b) => a.idx - b.idx);
  const out = {};
  for (let i = 0; i < markers.length; i++) {
    const s = markers[i].idx + markers[i].len;
    const e = i + 1 < markers.length ? markers[i + 1].idx : block.length;
    out[markers[i].key] = block.slice(s, e).replace(/^\s*\n/, '').trimEnd();
  }
  return out;
}

const HR_RE = /^\s*(?:-{3,}|_{3,}|\*{3,})\s*$/; // règle horizontale markdown

function parsePourquoi(raw) {
  if (!raw) return { auteurs: [], pourquoi: [] };
  // découpe en puces : lignes commençant par - ou — (en début de ligne).
  // tout ce qui suit une règle horizontale (---) est un pied de page éditorial : on coupe.
  const lines = raw.split(/\r?\n/);
  const bullets = [];
  let cur = null;
  for (const ln of lines) {
    if (HR_RE.test(ln)) break; // fin des puces → notes d'édition ignorées
    if (/^\s*[-—–]\s+/.test(ln)) {
      if (cur) bullets.push(cur);
      cur = ln.trim();
    } else if (cur && ln.trim()) {
      cur += ' ' + ln.trim();
    }
  }
  if (cur) bullets.push(cur);
  const auteurs = [];
  const pourquoi = bullets.map((b) => {
    const a = authorOf(b);
    if (a && !auteurs.includes(a)) auteurs.push(a);
    // texte de la puce sans le tiret de tête, normalisé
    const txt = normalizeTerm(b.replace(/^\s*[-—–]\s+/, '').trim());
    return txt;
  });
  return { auteurs, pourquoi };
}

// ── Boucle principale ───────────────────────────────────────────────────
const byN = new Map();
const warnings = [];

for (const [file, lo, hi] of SOURCES) {
  let text;
  try {
    text = readFileSync(join(FRAG, file), 'utf8');
  } catch (e) {
    warnings.push(`FICHIER MANQUANT: ${file}`);
    continue;
  }
  for (const { n, block } of parseFile(text)) {
    if (n < lo || n > hi) continue; // hors plage canonique
    if (byN.has(n)) {
      warnings.push(`DOUBLON n=${n} (${file}) — ignoré`);
      continue;
    }
    const f = splitFields(block);
    const { auteurs, pourquoi } = parsePourquoi(f.pourquoi || '');
    const ch = chapForN(n);
    const entry = {
      n,
      chapitre: ch?.ch ?? null,
      chapitre_titre: ch?.titre ?? null,
      debord_these: cleanField(f.debord || ''),
      sens_pour_debord: cleanField(f.sens || ''),
      fragment: cleanField(f.fragment || ''),
      auteurs,
      pourquoi,
      simulation: '', // Face B — à rédiger
    };
    // validations souples
    if (!entry.fragment) warnings.push(`n=${n}: champ 'Notre fragment' vide`);
    if (!entry.debord_these) warnings.push(`n=${n}: champ 'Debord' vide`);
    if (!entry.pourquoi.length) warnings.push(`n=${n}: aucune puce 'Pourquoi'`);
    byN.set(n, entry);
  }
}

const theses = [...byN.values()].sort((a, b) => a.n - b.n);

// ── Validation : 221 contigus ───────────────────────────────────────────
const missing = [];
for (let n = 1; n <= 221; n++) if (!byN.has(n)) missing.push(n);

// ── Écriture ────────────────────────────────────────────────────────────
mkdirSync(OUT, { recursive: true });
const json = JSON.stringify(theses, null, 2);
writeFileSync(join(OUT, 'theses.json'), json, 'utf8');
writeFileSync(
  join(OUT, 'theses.js'),
  `// Généré par tools/parse.mjs — ne pas éditer à la main.\nwindow.THESES = ${json};\nwindow.CHAPITRES = ${JSON.stringify(
    CHAPTERS.map(({ ch, titre, min, max }) => ({ ch, titre, min, max })),
    null,
    2
  )};\n`,
  'utf8'
);

// ── Rapport ─────────────────────────────────────────────────────────────
console.log(`Fragments parsés : ${theses.length} / 221`);
if (missing.length) console.log(`MANQUANTS : ${missing.join(', ')}`);
else console.log('Aucun manquant — numérotation 1..221 complète.');
console.log('\nPar chapitre :');
for (const c of CHAPTERS) {
  const cnt = theses.filter((t) => t.chapitre === c.ch).length;
  console.log(`  Ch.${c.ch} ${c.titre} (${c.min}-${c.max}) : ${cnt}`);
}
const residual = theses.filter((t) =>
  /Inno[\/\-]Sens/.test(t.fragment + t.sens_pour_debord + t.pourquoi.join(' '))
);
if (residual.length)
  console.log(`\nRÉSIDU 'Inno/Sens' dans : ${residual.map((t) => t.n).join(', ')}`);
else console.log("\nNormalisation OK — aucun 'Inno/Sens' résiduel.");
if (warnings.length) {
  console.log(`\nAvertissements (${warnings.length}) :`);
  warnings.slice(0, 40).forEach((w) => console.log('  - ' + w));
}
console.log(`\nÉcrit : ${join(OUT, 'theses.json')}`);
