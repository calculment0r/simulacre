# CLAUDE.md — Brief de construction
# LA SOCIÉTÉ DU SIMULACRE / LA SOCIÉTÉ DE LA SIMULATION
## Site miroir — thème Oblivion

---

## 0. État du contenu (à lire en premier)

Le contenu source est dans les fichiers `simulacre_fragments_*.md` du dossier.

**Écrit et calé (fragment N = thèse N) :** fragments 1 à 211.
**À finir :** fragments 212 à 221 (Chapitre 9 — L'idéologie matérialisée). Non encore rédigés.
**Nettoyage en attente :** quelques fichiers intermédiaires « compressés » et un fichier 107-118 dont les entrées 113-118 ont été supersédées par la version propre 125-146. Voir §4 pour la liste des fichiers à utiliser vs ignorer.

Le site peut être construit dès maintenant comme structure (scaffold) sur les 211 fragments existants ; les 10 derniers se rempliront ensuite. Ne pas bloquer le build sur les 212-221.

---

## 1. Le projet — intention et concept

Ce projet est un **détournement** de *La Société du Spectacle* de Guy Debord (1967 : 221 thèses, 9 chapitres). Debord analysait une société où les rapports sociaux étaient médiatisés par des images — le « spectacle ». Nous transposons sa structure entière à l'**IA générative** : la société où la pensée humaine accumulée s'est faite production automatique — le **Simulacre**.

Ce n'est **pas** une paraphrase ni un calque. Pour chaque thèse de Debord, on a extrait l'idée, on l'a appropriée, et on l'a transposée dans le contexte technique, sociologique et philosophique de l'IA. Le mot « spectacle » est remplacé par « Simulacre » (la pensée humaine accumulée au point de devenir génération), mais le travail est conceptuel, pas lexical.

**Le couple de titres.** Le site présente deux faces en miroir :
- **La Société du Simulacre** — les 221 fragments.
- **La Société de la Simulation** — leur développement argumenté.

Le couple *Simulacre / Simulation* fait délibérément résonner Baudrillard (*Simulacres et Simulation*, 1981) tout en détournant Debord. C'est une résonance assumée, pas une dette : Baudrillard n'est pas mobilisé dans le texte, c'est un écho de titre.

---

## 2. La structure miroir — les deux faces

### Face A — LA SOCIÉTÉ DU SIMULACRE (les fragments)
Le texte « primaire ». 221 fragments courts, **en minuscules**, denses, percutants, sans concession. Leur fonction est de **mettre en éveil** : ils frappent, ils ne démontrent pas. C'est le pendant exact des thèses de Debord — aphoristiques, tranchantes.

→ Contenu = le champ **« Notre fragment »** de chaque entrée des `.md`.

### Face B — LA SOCIÉTÉ DE LA SIMULATION (le développement)
Le texte « second », qui **explique les 221 thèses**. Pour chaque fragment, un texte **rédigé, articulé, argumenté** — plus discursif que le fragment. C'est le **développement de la partie « Pourquoi / auteurs »** de chaque entrée : là où le fragment éveille, la Simulation déploie le raisonnement, expose la généalogie philosophique, et argumente.

→ Contenu = développement rédigé à partir des champs **« Pourquoi / auteurs »** (les penseurs convoqués) **+ « Sens pour Debord »** (le sens de la thèse d'origine). Voir §7 pour la spec de rédaction. **Ce contenu est à écrire** : les `.md` n'en contiennent que la graine (les 3 puces d'auteurs).

### Le rapport entre les deux
Le fragment est l'**énoncé** ; la Simulation est sa **justification déployée**. L'un sans l'autre est incomplet : le fragment seul peut sembler péremptoire, la Simulation seule perd la force de frappe. Le site doit rendre lisible ce va-et-vient.

---

## 3. La correspondance et la page d'accueil

- **Page d'accueil** : un menu sobre donnant accès aux deux faces, avec l'épigraphe du livre et une brève note de méthode (le détournement de Debord).
- **Correspondance N ↔ N** : fragment N de la Société du Simulacre ↔ développement N de la Société de la Simulation. Depuis n'importe quel fragment, un lien « voir le développement » mène à son pendant argumenté, et inversement « voir le fragment ».
- **Navigation** : par chapitre (les 9 chapitres) et par numéro (1-221), des deux côtés, en parallèle.

### Épigraphe (page d'accueil)
> *nul n'a jamais autant transformé le monde qu'en affirmant ne pas y toucher. l'innocence est la forme que prend aujourd'hui la puissance qui a cessé d'avoir besoin de se légitimer.*
> — NIRVALAB, 2026

---

## 4. Le contenu source — fichiers et mapping

### Fichiers à utiliser (format complet, calage juste)
- `simulacre_fragments_15_24.md` … (chapitres 1-3, vérifier le format)
- `simulacre_fragments_73_82.md` (Ch.4)
- `simulacre_fragments_83_94_complet.md`
- `simulacre_fragments_95_106_complet.md`
- `simulacre_fragments_113_124_complet.md` (fin Ch.4)
- `simulacre_fragments_125_135_complet.md` (Ch.5)
- `simulacre_fragments_136_146_complet.md` (Ch.5)
- `simulacre_fragments_147_155_complet.md` (Ch.6)
- `simulacre_fragments_156_164_complet.md` (Ch.6)
- `simulacre_fragments_165_172_complet.md` (Ch.7)
- `simulacre_fragments_173_179_complet.md` (Ch.7)
- `simulacre_fragments_180_190_complet.md` (Ch.8)
- `simulacre_fragments_191_201_complet.md` (Ch.8)
- `simulacre_fragments_202_211_complet.md` (Ch.8)
- `simulacre_fragments_212_221_complet.md` (Ch.9) — **à produire**
- `simulacre_fragments_107_118_complet.md` : **n'utiliser que 107-112** ; 113-118 y sont obsolètes (remplacés par 113-124 + 125-146).

### Fichiers à ignorer (versions compressées supersédées)
`innosens_fragments_05_14.md`, `simulacre_fragments_83_112.md`, `simulacre_fragments_113_146.md`, `simulacre_fragments_147_162.md` (versions resserrées, remplacées par les `_complet`).

### Structure de chaque entrée `.md`
Chaque fragment a 4 sections :
1. **Debord — thèse N** : la thèse d'origine (paraphrase fidèle).
2. **Sens pour Debord** : ce que Debord voulait dire.
3. **Notre fragment** : la transposition (→ Face A, le fragment Simulacre).
4. **Pourquoi / auteurs** : 3 puces, quel penseur intervient et comment (→ graine de la Face B, à développer).

### Étape recommandée : parser en données
Convertir les `.md` en **un seul fichier de données structuré** (`data/theses.json`) avec, pour chaque entrée :
```json
{
  "n": 124,
  "chapitre": 4,
  "chapitre_titre": "L'opérateur comme sujet et comme représentation",
  "debord_these": "...",
  "sens_pour_debord": "...",
  "fragment": "...",          // Face A
  "auteurs": ["Debord", "CI", "Simondon"],
  "pourquoi": ["...", "...", "..."],  // graines
  "simulation": "..."         // Face B, développé (à rédiger)
}
```
Les deux faces du site se rendent à partir de ce même fichier. C'est ce qui rend la correspondance N↔N triviale.

---

## 5. La méthode du détournement (pour comprendre l'esprit)

Règles qui ont gouverné l'écriture — à respecter si tu produis du contenu (212-221, ou les développements Simulation) :

1. **Transposer, pas calquer.** On part de l'idée de Debord, on la repense dans le contexte IA. Jamais « changer un mot » de Debord.
2. **Les auteurs travaillent EN SOUS-MAIN.** Dans le **fragment** (Face A), aucun philosophe n'est nommé. Le fragment frappe seul. Les auteurs n'apparaissent que dans le **« Pourquoi / auteurs »** et donc dans la **Simulation** (Face B), où on les déploie explicitement.
3. **Portée large.** Pas seulement « agentique » ou technique : sociologique, métaphysique, politique, économique.
4. **Minuscules pour les fragments.** Style Debord aphoristique, lowercase, sans majuscule d'emphase.
5. **Tenir la contradiction.** Ni techno-optimisme, ni déclinisme. Le livre s'écrit avec le Simulacre contre le Simulacre, et l'assume (cf. fragments 196, 199, 202).

---

## 6. Les auteurs de référence (cœur du projet)

Ce sont les penseurs convoqués en sous-main. Pour la Face B (Simulation), c'est leur articulation qui constitue l'essentiel du développement. Chacun apporte un angle précis :

- **Guy Debord** — la structure détournée. Le spectacle comme rapport social médiatisé ; la séparation ; le temps pseudo-cyclique ; la récupération ; le détournement comme méthode ; les Conseils ouvriers (→ souveraineté cognitive). C'est l'ossature.

- **Quentin Meillassoux** — *Après la finitude*. Le **corrélationnisme** (on n'accède jamais au réel sans la pensée qui le vise) ; l'**archi-fossile** (le réel antérieur à toute conscience → le training cutoff, « interroger un mort très bien informé ») ; la **contingence** radicale (rien n'est nécessaire → contre la rhétorique de l'inévitable). Mobilisé sur la vérité, le temps figé, la nécessité fabriquée.

- **Bruno Latour** — théorie de l'**acteur-réseau**. Le modèle comme **acteur** dans un réseau, pas comme outil neutre ; les **points de passage obligés** (le datacenter, l'API) ; les **boîtes noires** (le pouvoir de celui qui contrôle ce qui entre dans le modèle). Mobilisé sur le pouvoir, l'infrastructure, la matérialité du « cloud ».

- **Bernard Stiegler** — *La Technique et le Temps*, *De la misère symbolique*. La **prolétarisation** (perte du savoir-faire puis du savoir-penser) ; le **pharmakon** (la technique poison et remède) ; les **rétentions** (mémoire externalisée) ; l'**individuation** par la technique. C'est l'auteur central pour tout ce qui touche à l'externalisation de la pensée et la dépossession cognitive.

- **Gilbert Simondon** — *Du mode d'existence des objets techniques*. L'**individuation** ; le **milieu associé** de l'objet technique ; la **culture technique** (comprendre la genèse de l'objet, pas seulement l'usage) ; l'**opérateur** vs l'utilisateur. Mobilisé sur la souveraineté technique, la maîtrise de la chaîne, l'outil-qui-ne-doit-pas-devenir-milieu.

- **Tristan Garcia** — *Forme et objet*, *La Vie intense*. L'**intensité** ; le **présent sans épaisseur** ; la réduction de la qualité à la quantité ; la nouveauté comme retour du même. Mobilisé sur le temps, le style moyen, la pseudo-nouveauté, l'efficacité qui tue l'intensité.

- **Le Comité Invisible** (*L'Insurrection qui vient*, *À nos amis*, *Maintenant*) et **Tiqqun** (*Théorie du Bloom*, *Premiers matériaux pour une théorie de la Jeune-Fille*) — l'**Empire** (pouvoir qui gouverne par la bienveillance et l'infrastructure) ; le **Bloom** (l'individu isolé, neutralisé) ; les **formes non-séparées** du pouvoir (autonomie, auto-organisation) ; la critique de la gestion. C'est le pôle politique : tout ce qui concerne la résistance, la souveraineté des collectifs, le refus de la délégation, l'auto-organisation matérielle.

- **Peter Sloterdijk** — *Sphères*, *Écumes*. Les **bulles** et **sphères** (espaces immunitaires) ; l'**immunité** ; la juxtaposition de bulles sans monde commun. Mobilisé sur l'isolement, la foule solitaire, l'attente ritualisée, le confort qui ne transforme pas.

- **Slavoj Žižek** — l'**idéologie** comme structure (pas comme contenu) ; la **violence objective** (inscrite dans le fonctionnement normal, invisible) ; la **transgression déjà prévue** par le système (la critique permise qui stabilise). Mobilisé sur la récupération, le réformisme, la participation, la critique interne qui désamorce.

- **Nick Land** (en sous-main, jamais frontal) — l'**accélération sans sujet** ; le processus qui s'auto-entretient et emporte ceux qui l'alimentent. Mobilisé avec prudence sur la course, la concurrence sans destination, le renversement de l'accélération. (Cal lit Land depuis ~15 ans et le critique ; ici c'est un opérateur, pas une adhésion.)

- **Henri Bergson** (en sous-main) — la **durée** vécue vs le **temps** mesuré/spatialisé. Mobilisé sur le temps homogène de l'inférence, le débit, la durée qualitative écrasée.

- **Walter Benjamin** (ponctuel) — l'**aura** et la **reproductibilité technique**, poussée jusqu'à la génération à coût nul (fragment 188).

- **Baudrillard** — résonance de titre seulement (cf. §1).

---

## 7. Face B — spec de rédaction de « La Société de la Simulation »

Pour chaque thèse N, écrire un texte rédigé (objectif : ~250-450 mots) qui :
1. **Ouvre sur la thèse de Debord** détournée (d'où l'on part, ce qu'on retourne).
2. **Déploie le fragment** : explicite ce que le fragment dit de manière aphoristique.
3. **Articule les auteurs** : développe en prose argumentée ce que les puces « Pourquoi / auteurs » donnent en germe — comment Stiegler, Meillassoux, etc. éclairent ce point précis. C'est ici qu'ils sont **nommés et déployés**.
4. **Tient la contradiction** (ni célébration, ni déploration).

Le registre : argumenté, dense, mais lisible — un essai, pas un aphorisme. C'est l'inverse stylistique du fragment, et c'est voulu : le fragment réveille, la Simulation raisonne.

Source pour chaque entrée : les champs **« Sens pour Debord »** + **« Pourquoi / auteurs »** des `.md`.

---

## 8. Thème visuel — OBLIVION

```
bg      #0a0a0c     bg2     #111114     bg3     #18181d
borders #1e1e26 / #2a2a36
text    #e8e8f0     muted   #9090a8     dim     #4a4a62
accent  #c9ff3c     accentDim #8aad1e
red #ff4455   amber #ffaa33   blue #4499ff   violet #9966ff
```
- **Fonts** : *Instrument Serif* (corps de texte), *DM Mono* (labels, numéros, mono).
- **Layout** : sidebar gauche fixe, navigation par section/chapitre, style terminal sombre élégant.
- Numéros de thèses en DM Mono, accent `#c9ff3c`. Texte des fragments en Instrument Serif.
- Sobriété : c'est un livre, pas un dashboard. L'accent vert est rare et précis.

Cal fournira un **HTML de référence** : en respecter la mise en page et la structure, y appliquer Oblivion.

---

## 9. Architecture technique recommandée

- **Site statique** (destination GitHub Pages, comme les autres projets de Cal — workflow Claude Design → Claude Code → GitHub Pages).
- **Un seul fichier de données** `data/theses.json` (221 entrées, cf. §4), parsé depuis les `.md`. Les deux faces se rendent à partir de lui.
- **Trois vues** :
  1. `index.html` — accueil + épigraphe + menu vers les deux faces + note de méthode.
  2. Face A — lecteur « Simulacre » : liste/lecture des fragments, navigation par chapitre et numéro.
  3. Face B — lecteur « Simulation » : les développements, même navigation.
- **Lien N↔N** sur chaque entrée (bouton « développement » ↔ « fragment »).
- **Sidebar fixe** Oblivion : titre, sélecteur de face, sommaire des 9 chapitres, accès numérique.
- Vanilla HTML/CSS/JS suffit (pas de framework lourd nécessaire) ; respecter la sobriété typographique.
- Responsive : la sidebar se replie en menu sur mobile.

### Les 9 chapitres (pour la navigation)
Titres **autonomes** : ils ne renvoient pas à Debord, ils nomment le contenu propre de chaque chapitre. (Pour mémoire interne, l'intervalle de thèses correspond à la structure des 9 chapitres de Debord, mais les titres sont les nôtres.)

1. **La pensée hors de soi** (1-34) — la séparation, l'externalisation de la pensée
2. **Le fétiche génératif** (35-53) — la marchandise, le fétichisme du modèle
3. **L'unité de façade** (54-72) — concentré/diffus, fausse unité, ouvert/fermé, alignement comme variable politique
4. **Souveraineté et servitude** (73-124) — le cœur politique : sujet dépossédé, fausses résistances, souveraineté cognitive, formes non-séparées
5. **Le temps fossile** (125-146) — temps cyclique/irréversible, corpus mort, archi-fossile
6. **La survie augmentée** (147-164) — cycles de release, pseudo-événements, présent perpétuel
7. **Le mensonge du nuage** (165-179) — géographie du calcul, matérialité, souveraineté matérielle
8. **Le style de personne** (180-211) — dissolution de l'art, langue moyenne, récupération, détournement
9. **L'esprit fait chose** (212-221) — l'idéologie devenue infrastructure, le dénouement

Note : les en-têtes des fichiers `.md` individuels portent encore les anciens titres (souvent ceux de Debord). La source de vérité pour les titres est cette liste / le champ `chapitre_titre` du JSON ; mettre les en-têtes `.md` en cohérence au passage.

---

## 10. Workflow

1. Parser les `.md` → `data/theses.json` (211 entrées dispo, 10 à venir).
2. Bâtir le scaffold du site (accueil + 2 lecteurs + navigation) sur le thème Oblivion, d'après l'HTML de référence fourni.
3. Rédiger les développements Face B (§7) — gros morceau de contenu, peut se faire par chapitre.
4. Finir les fragments 212-221.
5. Index de concordance Debord ↔ Simulacre (table des 221).
6. Déployer sur GitHub Pages.
```
```
