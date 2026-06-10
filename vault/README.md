# 🔒 VAULT — sauvegarde V0

Coffre des versions figées. **Ne pas éditer ces fichiers** : ce sont des snapshots immuables servant de point de restauration.

## Contenu

| Fichier | Description |
|---|---|
| `theses.v0.json` | Copie intégrale des 221 fragments (V0), même schéma que `site/data/theses.json`. |
| `fragments-v0.md` | Export lisible : les 221 fragments V0, par chapitre. |

## Repères

- **V0** = version originale des fragments, figée le **2026-06-10**, avant la production V2 (protocole RENVERSEMENT / god mode).
- Tag git associé : **`v0`** → `git checkout v0` ou `git show v0:site/data/theses.json` pour récupérer l'état complet du projet à ce moment.

## Restaurer la V0

```bash
# remettre les fragments V0 comme canon
cp vault/theses.v0.json site/data/theses.json
node tools/parse.mjs   # (ou régénérer theses.js depuis le json)
```

> Note : le god mode ne détruit jamais la V0 — valider une variante change seulement la version « active » (`variants.json`), le champ `fragment` original reste dans `theses.json`. Ce vault est une sécurité supplémentaire, et la base pour comparer V0 ↔ V2.
