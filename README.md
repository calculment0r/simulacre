# La Société du Simulacre / de la Simulation

Site miroir — détournement de *La Société du Spectacle* de Guy Debord (1967) transposé à l'IA générative. 221 fragments, 9 chapitres, deux faces.

Thème visuel : **Oblivion**. Voir [`CLAUDE.md`](CLAUDE.md) pour le brief conceptuel complet.

---

## Structure

```
SIMULACRE/
├─ Fragments/              ← contenu source (.md), une entrée = une thèse
├─ site/                   ← le site statique déployable (racine web)
│  ├─ index.html           ← le lecteur des fragments (titre + citation + 221 fragments)
│  ├─ concordance.html     ← table Debord ↔ Simulacre (gardée pour plus tard, hors nav principale)
│  ├─ assets/
│  │  ├─ oblivion.css       ← thème + mise en page sidebar
│  │  └─ app.js             ← moteur du lecteur (rend tout depuis les données)
│  └─ data/
│     ├─ theses.json        ← source de vérité (221 entrées) — généré
│     └─ theses.js          ← même donnée en `window.THESES` (chargée par <script>) — généré
├─ tools/
│  ├─ parse.mjs            ← parser .md → data/theses.json + data/theses.js
│  └─ serve.mjs            ← serveur statique local pour le preview
└─ theme oblivion.html     ← HTML de référence du thème (non utilisé au runtime)
```

## Régénérer les données

Après toute modification des `.md` dans `Fragments/` :

```bash
node tools/parse.mjs
```

Le parser :
- lit les 23 fichiers source canoniques (cf. `SOURCES` dans `parse.mjs`) ;
- n'utilise que **107-112** de `…107_118_complet.md` (113-118 obsolètes) ;
- **normalise** l'ancien nom de travail `Inno/Sens` / `Inno-Sens` → **`Simulacre`** (avec articles : `l'Inno/Sens` → `le Simulacre`, `d'Inno-Sens` → `de Simulacre`) ;
- coupe les pieds de page éditoriaux (après une règle `---`) ;
- valide la numérotation **1…221 contigüe** et affiche un rapport (comptes par chapitre, résidus, avertissements).

## Prévisualiser

```bash
node tools/serve.mjs        # http://localhost:5173
```
(Le site fonctionne aussi en `file://` car les données sont chargées via `<script src="data/theses.js">`, pas par `fetch`.)

## Modèle de données (`theses.json`)

```json
{
  "n": 124,
  "chapitre": 4,
  "chapitre_titre": "Souveraineté et servitude",
  "debord_these": "…",          // thèse d'origine de Debord
  "sens_pour_debord": "…",      // ce que Debord voulait dire (graine Face B)
  "fragment": "…",              // Face A — le fragment Simulacre
  "auteurs": ["Debord", "CI", "Simondon"],
  "pourquoi": ["…", "…", "…"],  // graines Face B (puces auteurs)
  "simulation": ""              // Face B — développement rédigé (à écrire)
}
```

## Navigation / correspondance N↔N

- Routage par hash : `#ch-4` (un chapitre) et `#f-124` (focus + scroll sur le fragment 124).
- Chaque entrée porte un lien vers son pendant : Face A → « voir le développement N », Face B → « lire le fragment N ».
- Le sélecteur de face en sidebar conserve le chapitre/fragment courant.

---

## État & suite

- ✅ **Données** : 221 fragments parsés, normalisés, validés.
- ✅ **Site** : un seul lecteur de fragments (`index.html`) — titre + citation NIRVALAB en tête, sidebar (saut au n° + 9 chapitres), navigation N↔N par hash, thème Oblivion, responsive (sidebar repliable < 920px). Pas de liens « développement », pas de noms d'auteurs affichés.
- 🗂 **Concordance** : `concordance.html` conservée dans le dossier (liens repointés vers `index.html`), à finir plus tard — pas mise en avant.
- ⏳ **Face B — La Société de la Simulation** : mise de côté pour l'instant. Les données la portent toujours (champ `simulation`, vide + graines `sens_pour_debord` / `pourquoi` dans le JSON) ; le lecteur Face B a été retiré du site. À reprendre quand on rédigera les développements (cf. `CLAUDE.md` §7).
- ⏳ **Déploiement GitHub Pages** : `site/` est la racine web. Pas encore initialisé en dépôt git. Pour publier : `git init`, pousser, puis régler Pages sur le dossier `site/` (ou déplacer le contenu de `site/` à la racine / dans `docs/` selon la convention choisie).
