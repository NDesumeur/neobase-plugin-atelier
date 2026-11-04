# Atelier

L'IDE intégré de NeoDex, pour apprendre, bricoler et fabriquer des plugins sans quitter l'appli.

- **Explorateur de projets** : plusieurs projets, fichiers et dossiers, onglets, renommer, supprimer.
- **Éditeur** : coloration HTML / CSS / JavaScript / Python / JSON / Markdown, numéros de ligne, indentation automatique, parenthèses auto-fermées, chercher / remplacer, commenter, dupliquer et déplacer les lignes.
- **Aperçu web instantané** : l'aperçu se met à jour en tapant, le CSS et le JS liés sont lus dans le projet.
- **Console** : `console.log`, erreurs et promesses rejetées de l'aperçu, plus une ligne pour évaluer du JavaScript.
- **Bac à sable JavaScript** : le script tourne dans un Worker isolé, 8 secondes au plus (`await` permis).
- **Python** : exécuté avec le Python 3 installé sur le PC, dans un dossier temporaire, 10 secondes au plus. Sans Python, un message l'explique.
- **Plugins** : modèles prêts à l'emploi, test dans un cadre isolé (dossier de données en mémoire), validation de `plugin.json` et du code, export en `.zip` avec une icône générée si tu n'en as pas.

Ton code ne tourne jamais dans NeoDex : il est toujours isolé et ne voit ni tes données ni tes onglets.
La publication d'un plugin (Release GitHub, topic `neodex-plugin`, signature et approbation) reste faite hors de l'Atelier.

## Installer

Dans NeoDex : **NeoStore → À découvrir → Atelier → Installer**. L'exécution de Python demande l'accès complet.

Développer un plugin : voir le [SDK NeoDex](https://github.com/NDesumeur/neodex-sdk).
