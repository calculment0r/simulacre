# BRIEF — Mots-concepts en couleur (site)

Pour Claude Code. Mettre en valeur, dans la couleur accent du thème, le petit lexique propre au carnet — les mots que le texte recharge d'un sens. But : que l'épine conceptuelle « brille » discrètement, comme un leitmotiv, sans transformer la page en surligneur.

## Couleur
- Accent du thème Oblivion : **#c9ff3c** (var `--accent`). Couleur du texte seulement, **pas de fond**.
- Optionnel : un très léger glow, cohérent avec les autres éléments accent. Pas de gras, pas de majuscules ajoutées.

## Mots à passer en accent — noyau (chaque occurrence)
Formes exactes, mot entier, casse respectée :
- **Simulacre**, **Simulation**
- **Focus**
- **Kubernân**
- **Grand Dehors** (l'expression « le Grand Dehors »)

Ces mots sont assez espacés dans le texte pour former un fil, pas un bruit. Si jamais le rendu paraît trop dense, repli simple : **une seule occurrence par bifurcation** (la première).

## Second cercle — optionnel (première occurrence seulement)
- **pléonexie**
- **désencastrement**, **ré-encastrement**
- **le Bloom**
- **sécession** — uniquement sur le chiasme (« sécession du calcul pour garder le monde »), pas ailleurs (le mot est trop fréquent).

## Règles
- **Ne pas** colorer dans les titres ni les intertitres. Le titre de couverture « Kubernân, où sortir ? » a son propre style — pas de surlignage inline dedans.
- **Ne pas** colorer le vocabulaire structurel / nautique fréquent : *bifurcation, carte, passe, relèvement, archipel, barre*. Ce sont des repères, pas des concepts à faire briller.
- La **signature « — Focus »** en fin de carte : elle peut prendre l'accent, c'est cohérent — c'est le mot qui se signe.
- Implémentation : envelopper dans `<span class="concept">…</span>`, `color: var(--accent)`. Match **mot entier** (ne pas toucher l'intérieur d'autres mots). Laisser le `.md` source propre — le balisage se fait au rendu.

## Esprit
Discret. Qu'en parcourant, l'œil retienne tout seul les quelques mots qui portent le livre — Simulacre, Focus, Kubernân — sans buter sur du vert à chaque ligne. Dans le doute, en colorer moins.
