<div align="center">
  <a href="claude-code-workflow-openworkflow.en.md">English</a> | <a href="claude-code-workflow-openworkflow.md">中文</a> | Français | <a href="claude-code-workflow-openworkflow.de.md">Deutsch</a> | <a href="claude-code-workflow-openworkflow.es.md">Español</a> | <a href="claude-code-workflow-openworkflow.pt.md">Português</a> | <a href="claude-code-workflow-openworkflow.ru.md">Русский</a> | <a href="claude-code-workflow-openworkflow.ja.md">日本語</a> | <a href="claude-code-workflow-openworkflow.hi.md">हिन्दी</a> | <a href="claude-code-workflow-openworkflow.ar.md">العربية</a>
</div>

# Claude Code propose des Workflows. Et les autres modèles ? J'ai essayé OpenWorkflows

Récemment, j'ai examiné de près les workflows Claude Code.

Ce qui m'intéresse, ce n'est pas juste « une fonctionnalité de plus ». Cela extrait le travail complexe d'un tour de chat après l'autre. Les tâches peuvent être divisées en sous-agents, des branches parallèles et des pipelines, puis coordonnées par des scripts.

C'est important car un workflow n'est plus un arrangement temporaire au sein d'une seule conversation. Il devient quelque chose que vous pouvez sauvegarder, modifier et réutiliser.

Cela m'a aussi posé une question : si les workflows deviennent une couche commune dans le codage IA, pourquoi devraient-ils être liés à un seul modèle ou à une seule CLI ?

J'ai donc essayé OpenWorkflows. Il transforme les workflows de style Claude Code en un canevas visuel, et il tente de faire en sorte que le même workflow cible Claude Code, Codex, Gemini et d'autres runtimes locaux ou cloud.

Ce tutoriel ne commence pas par des concepts abstraits. Il parcourt les captures d'écran dans l'ordre. L'exemple est concret : faire en sorte qu'OpenWorkflows prenne en charge plusieurs thèmes d'apparence, que le thème Pencil soit appliqué par défaut, et qu'il soit possible de les changer dans Paramètres / Apparence.

> Il s'agit de la version anglaise du tutoriel d'utilisation basé sur les captures d'écran.
>
> Version chinoise : [Tutoriel d'utilisation d'OpenWorkflows](claude-code-workflow-openworkflow.md)

## 0. Commencer par l'interface finale

<p align="center">
  <img src="images/0-标题使用.png" alt="Canevas OpenWorkflows, rail d'historique, propriétés des nœuds et zone de saisie IA" width="960">
</p>
<p align="center"><em>Figure 0 : L'espace de travail principal d'OpenWorkflows, avec le blueprint au centre, les propriétés des nœuds à droite, et la saisie et la réponse IA en bas.</em></p>

L'interface principale comporte quatre parties : l'historique des workflows à gauche, le canevas visuel au centre, les propriétés des nœuds et les prompts courants à droite, ainsi que la saisie IA et les panneaux de réponse en bas.

Le workflow dans la capture d'écran est intitulé « Plan d'apparence multi-thèmes Pencil ». Ce n'est pas un diagramme statique. C'est un workflow que vous pouvez continuer à modifier, transformer en script, exécuter et consulter ultérieurement.

## 1. Télécharger OpenWorkflows

<p align="center">
  <img src="images/1-下载.png" alt="Page GitHub d'OpenWorkflows avec l'entrée Releases" width="840">
</p>
<p align="center"><em>Figure 1 : Retrouvez la dernière version dans la section Releases de la page GitHub.</em></p>

Le moyen le plus rapide de l'essayer est d'ouvrir la page du projet sur GitHub et de télécharger la dernière version depuis Releases.

Le panneau À propos à droite clarifie le positionnement. Il s'agit d'un éditeur visuel qui étend les Workflows Claude Code à Codex, Gemini et d'autres runtimes LLM.

Si vous souhaitez travailler sur le code, clonez le dépôt et démarrez depuis le répertoire `app/` :

```bash
npm install
npm run dev
```

Pour l'application de bureau, utilisez :

```bash
npm run desktop
```

## 2. Configurer d'abord les modèles

<p align="center">
  <img src="images/2-配置大模型.png" alt="Page de paramètres des modèles d'OpenWorkflows" width="640">
</p>
<p align="center"><em>Figure 2 : Configurez les fournisseurs, la CLI locale et le modèle par défaut dans Paramètres / Modèles.</em></p>

Avant de dessiner quoi que ce soit, ouvrez **Paramètres / Modèles**. C'est ici que vous configurez les fournisseurs, les CLI locales, le modèle par défaut et les canaux d'exécution.

Chaque fournisseur indique son statut, tel que défaut, direct, runtime CLI ou indisponible. La capture d'écran montre également que la clé est stockée localement.

Si vous utilisez déjà `cc-switch` pour gérer les configurations de modèles, vous pouvez importer ces données ici. En bas de la zone de saisie IA, vous pouvez également choisir quel modèle ou canal cette requête doit utiliser.

## 3. Créer un nouveau workflow et saisir une requête

<p align="center">
  <img src="images/3-新建workflow.png" alt="Création d'un nouveau workflow et saisie d'une requête dans la zone IA" width="840">
</p>
<p align="center"><em>Figure 3 : Cliquez sur Nouveau Workflow, puis décrivez le workflow dans la zone de saisie IA en bas à droite.</em></p>

Une fois le modèle configuré, cliquez sur **Nouveau Workflow** à gauche. Le canevas démarre avec une structure minimale : Démarrer, un Agent et Fin.

Le véritable point de départ n'est pas le dessin manuel des nœuds. C'est la zone de saisie IA dans le coin inférieur droit. Dans cet exemple, j'ai tapé :

```text
Je souhaite qu'OpenWorkflows prenne en charge plusieurs thèmes d'apparence,
que le thème Pencil soit appliqué par défaut,
et qu'il soit possible de les changer dans Paramètres / Apparence.
```

Après l'avoir envoyé avec `Ctrl+Entrée`, ou en cliquant sur le bouton d'envoi, OpenWorkflows transforme la requête en un blueprint de workflow modifiable.

## 4-1. Générer le blueprint du workflow

<p align="center">
  <img src="images/4-1生成workflow蓝图.png" alt="Blueprint de workflow généré à partir de la requête" width="960">
</p>
<p align="center"><em>Figure 4-1 : L'IA divise l'objectif en branches parallèles, un nœud de synthèse, des nœuds d'implémentation, une validation et une livraison.</em></p>

Une fois la requête envoyée, OpenWorkflows réécrit l'étape actuelle en un workflow complet.

Le blueprint dans la capture d'écran devient approximativement :

```text
Démarrer
  -> Explorer la prise en charge de l'apparence en parallèle
      -> Rechercher les points d'entrée actuels
      -> Concevoir le système de thèmes
      -> Concevoir le thème par défaut Pencil
  -> Synthétiser le plan d'implémentation
  -> Implémenter l'apparence multi-thèmes
  -> Connecter le changement dans Paramètres / Apparence
  -> Valider et réviser
  -> Enregistrer les résultats de livraison
  -> Fin
```

Ce qui compte ici, ce n'est pas l'esthétique du graphe. C'est qu'un objectif flou devient un plan exécutable.

Le panneau des propriétés des nœuds à droite vous permet toujours d'inspecter les libellés, les types, les branches, les types d'agents et les schemas. La génération ne vous empêche pas de modifier la structure.

## 4-2. Consulter le script généré

<p align="center">
  <img src="images/4-2蓝图脚本.png" alt="Boîte de dialogue du script de workflow généré" width="960">
</p>
<p align="center"><em>Figure 4-2 : Utilisez le bouton Script pour inspecter le script de workflow généré à partir du canevas.</em></p>

Il y a un bouton **Script** dans la barre supérieure. Ouvrez-le et vous verrez le script généré à partir du blueprint actuel.

Dans la capture d'écran, vous pouvez voir les structures `parallel(...)` et `agent(...)`. Les nœuds parallèles deviennent des branches simultanées, et les nœuds ordinaires deviennent des appels d'agent individuels.

Cela montre qu'OpenWorkflows ne se contente pas de dessiner des boîtes. Le canevas repose sur une structure de workflow partagée qui peut ensuite cibler différents runtimes.

## 5. Continuer à affiner avec les prompts courants

<p align="center">
  <img src="images/5-使用常用提示词.png" alt="Panneau des prompts courants et zone de saisie IA" width="960">
</p>
<p align="center"><em>Figure 5 : Les prompts courants poussent les modifications typiques du workflow dans la zone de saisie IA.</em></p>

Après la génération du blueprint, vous n'êtes pas obligé de l'exécuter immédiatement. Le panneau **Prompts courants** à droite est plus adapté pour affiner le flux.

Les prompts sont regroupés par scénario : clarification, clarté, exhaustivité, coût, structure, fiabilité et parallélisme, et vérification.

La capture d'écran montre le prompt **Clarifier la requête**. Il remplit la zone de saisie IA avec une demande de confirmation des ambiguïtés clés avant de modifier le graphe.

C'est utile car de nombreux échecs de workflow ne sont pas des échecs de modèle. Ils surviennent parce que l'objectif, les limites, les chemins d'échec ou la stratégie de coût n'ont pas été assez clairement définis.

## 6. Confirmer les limites avec des choix interactifs

<p align="center">
  <img src="images/6-交互选择.png" alt="Boutons de choix interactifs dans la réponse IA" width="640">
</p>
<p align="center"><em>Figure 6 : Lorsque la requête est ambiguë, l'IA propose des choix pour que vous puissiez d'abord confirmer la portée.</em></p>

Après avoir choisi **Clarifier la requête**, l'IA ne modifie pas le graphe immédiatement. Au lieu de cela, elle pose une question de suivi : jusqu'où doit aller le changement de thème ?

La capture d'écran propose deux choix : livrer uniquement le thème par défaut Pencil et laisser la structure d'extension en place, ou livrer Pencil plus plusieurs thèmes interchangeables.

Une fois votre choix fait, l'IA réécrit cette décision dans le blueprint de workflow et produit l'IRGraph mis à jour. Cela réduit le risque que l'IA emmène le workflow dans la mauvaise direction de son propre chef.

## 7. Cliquer sur Exécuter

<p align="center">
  <img src="images/7-运行.png" alt="Bouton Exécuter en haut dans OpenWorkflows" width="960">
</p>
<p align="center"><em>Figure 7 : Une fois le blueprint prêt, cliquez sur Exécuter dans la barre supérieure.</em></p>

Après avoir confirmé la structure, les paramètres des modèles et les limites clés, cliquez sur **Exécuter**.

Il vaut mieux ne pas exécuter le workflow dès qu'il est généré. Vérifiez d'abord si les branches parallèles ont du sens, si le nœud de synthèse vient après les branches, et si la validation couvre le résultat final.

Si un nœud n'est clair que sur sa responsabilité, vous pouvez modifier son libellé, son prompt, son type d'agent ou son schema avant de réexécuter.

## 8. Observer l'état d'exécution

<p align="center">
  <img src="images/8-运行中.png" alt="État d'exécution avec bouton d'arrêt" width="960">
</p>
<p align="center"><em>Figure 8 : Pendant l'exécution, le bouton passe à « Exécution en cours... Arrêter », et chaque nœud affiche son état.</em></p>

Lorsque le workflow démarre, le bouton supérieur passe à **Exécution en cours... Arrêter**. La zone de saisie IA en bas est verrouillée pour que le blueprint ne change pas en cours d'exécution.

Le canevas affiche directement le statut des nœuds. Dans la capture d'écran, Démarrer est terminé, le nœud parallèle est encore en cours d'exécution, et le compteur en haut à droite indique la progression de l'exécution.

C'est plus lisible qu'un long journal. Si quelque chose échoue, vous n'avez pas besoin de jeter tout le prompt. Vous pouvez trouver le nœud défaillant et ajuster uniquement le prompt, le modèle ou l'entrée de ce nœud.

## 9. Changer le thème d'apparence

<p align="center">
  <img src="images/9-切换风格.png" alt="Paramètres d'apparence avec plusieurs thèmes" width="840">
</p>
<p align="center"><em>Figure 9 : La fonctionnalité finale atterrit dans Paramètres / Apparence, où vous pouvez choisir Pencil, Deep Night, Aurora, Daylight, Ember, et plus encore.</em></p>

L'objectif de cet exemple est de permettre à OpenWorkflows de prendre en charge plusieurs thèmes d'apparence. Le point d'entrée final est **Paramètres / Apparence**.

La capture d'écran montre des cartes de thèmes telles que Pencil, Deep Night, Aurora, Daylight et Ember. Lorsque vous en choisissez un, il modifie l'arrière-plan global, les panneaux, les bordures et les couleurs d'état d'exécution.

Cela montre également le véritable cas d'usage ici. OpenWorkflows ne sert pas uniquement à faire des diagrammes de démonstration. Il peut décomposer une demande de produit en recherche, conception, implémentation, validation et suivi de livraison, puis faire passer chaque partie par le bon nœud.

## Ce que je trouse réellement utile

OpenWorkflows a de la valeur au-delà de l'enveloppe d'un prompt dans une interface.

Il relie la requête, le blueprint, le script, l'exécution et la révision de l'historique. Vous pouvez générer un flux en langage naturel, inspecter la structure sur le canevas, utiliser les prompts courants pour resserrer les limites, et ne l'exécuter qu'ensuite.

Un workflow n'a pas non plus besoin d'être lié à un seul modèle. Les nœuds simples peuvent utiliser des modèles moins chers, les nœuds importants peuvent utiliser des modèles plus puissants, et la cible d'exécution peut toujours s'étendre à Claude Code, Codex, Gemini ou d'autres runtimes.

Pour les tâches de codage IA complexes, cette structure est bien plus facile à maintenir qu'un énorme prompt unique. Si un nœud échoue, corrigez ce nœud. Si une branche est inutile, supprimez-la. Si vous souhaitez réutiliser, reprenez depuis l'historique.

## Comment cela se rapporte à Claude Code

OpenWorkflows ne ressemble pas à un remplacement de Claude Code.

Claude Code a déjà clarifié la direction du workflow : le travail complexe peut être écrit sous forme de scripts dynamiques, coordonnés entre plusieurs sous-agents, et exécuté en arrière-plan.

OpenWorkflows ajoute une couche visuelle à cette direction : dessinez le workflow, modifiez-le, sauvegardez-le, puis essayez la même structure sur davantage de modèles et de runtimes.

Il ne s'agit donc pas de s'opposer à Claude Code. Il s'agit d'étendre l'idée de workflow vers l'extérieur.

## Encore jeune, mais à suivre

OpenWorkflows n'est pas encore mature. Les adaptateurs de runtime, les capacités des nœuds et l'écosystème de scripts continueront d'évoluer.

Mais la direction est claire. Le codage IA ne restera pas éternellement à « ouvrir une boîte de chat et pousser manuellement chaque étape ».

Finalement, les tâches complexes deviendront des workflows. La seule vraie question est de savoir si ce workflow restera verrouillé à l'intérieur d'un seul outil, ou s'il pourra être vu, modifié, migré et réutilisé.

Projet :

https://github.com/wellingfeng/OpenWorkflows

Référence :

https://code.claude.com/docs/en/workflows
