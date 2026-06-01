# OpenWorkflows

<div align="center">
  <a href="../../README.md">English</a> | <a href="README.zh-CN.md">中文</a> | Français | <a href="README.de.md">Deutsch</a> | <a href="README.es.md">Español</a> | <a href="README.pt.md">Português</a> | <a href="README.ru.md">Русский</a> | <a href="README.ja.md">日本語</a> | <a href="README.hi.md">हिन्दी</a> | <a href="README.ar.md">العربية</a>
</div>

Claude Code a introduit une fonctionnalité Workflow permettant d'orchestrer des étapes multi-agents, des branches parallèles et des pipelines sous forme de scripts exécutables. OpenWorkflows transforme ce modèle en un éditeur visuel et multi-modèle : construisez un graphe Workflow, puis exécutez-le ou adaptez-le sur Claude Code, Codex, Gemini et les futurs runtimes de modèles locaux ou cloud.

L'IR partagé maintient la portabilité de la structure du workflow tout en permettant à chaque nœud de choisir son modèle exposé au runtime, son prompt, son schema et ses paramètres d'exécution.

<p align="center">
  <img src="images/0-标题使用.png" alt="Capture d'écran de l'éditeur OpenWorkflows" width="960">
</p>

## Tutoriel d'utilisation

- [Tutoriel d'utilisation d'OpenWorkflows](claude-code-workflow-openworkflow.en.md) - guide pas à pas avec les captures d'écran, de la configuration au changement de runtime.

## Prise en charge des workflows multi-modèles

- OpenWorkflows étend l'idée de Workflow de Claude Code au-delà d'un runtime LLM unique.
- Le même graphe Workflow peut être édité visuellement et ciblé sur Claude Code, Codex, Gemini ou d'autres adaptateurs.
- Les primitives de style Claude Code telles que les étapes d'agent, les branches parallèles et les pipelines deviennent des nœuds de graphe portables.
- Chaque nœud peut porter son propre prompt, son niveau de modèle, son schema et ses paramètres d'exécution.
- La vue script compile aujourd'hui le graphe en scripts Workflow exécutables de style Claude Code, avec la couche d'adaptateurs prête pour d'autres runtimes de modèles.

## Pourquoi OpenWorkflows

- Décrivez l'objectif dans le champ de saisie IA en bas à droite et générez un blueprint Workflow éditable.
- Création de workflow visuelle plutôt que l'édition manuelle de grands scripts multi-agents.
- Une bibliothèque de prompts réutilisables avec des réécritures de workflow et des prompts de revue courants.
- Un historique d'espaces de travail et de sessions pour revenir rapidement à un travail antérieur.
- Des contrôles d'exécution/arrêt avec l'état d'exécution de chaque nœud sur le canevas.
- Un stockage local des clés API pour l'assistance IA côté navigateur, conservées uniquement sur la machine.

## Démarrage rapide

```bash
cd app
npm install
npm run dev
```

Pour l'application de bureau :

```bash
cd app
npm run desktop
```

Pour un package de release Windows :

```bash
cd app
npm run package
```

Depuis la racine du dépôt, `run.bat` lance l'application et la reconstruit si nécessaire, et `build.bat` empaquette l'installateur Windows.

## Utilisation de base

1. Créez un nouveau workflow ou ouvrez-en un existant.
2. Décrivez la tâche dans le champ de saisie IA en bas à droite. OpenWorkflows génère automatiquement le blueprint Workflow.
3. Continuez à affiner le blueprint en saisissant des instructions de suivi dans le même champ, ou cliquez sur les prompts courants du panneau de droite pour des modifications orientées structure, exhaustivité, coût, fiabilité et rollback.
4. Sélectionnez des nœuds individuels lorsque vous devez modifier manuellement les prompts, les modèles, les schemas ou les paramètres d'exécution.
5. Choisissez un adaptateur de runtime tel que Claude Code, Codex ou Gemini, puis ajustez les modèles des nœuds selon vos besoins.
6. Cliquez sur le bouton Run en haut pour exécuter le workflow, observez les mises à jour de statut de chaque nœud et arrêtez-le à tout moment.
7. Changez de session ou d'espace de travail depuis le rail d'historique pour poursuivre un travail antérieur.

## Organisation du projet

```text
app/
  src/                 React + TypeScript frontend
    core/              IR, parser, emitter, round-trip logic
    canvas/            React Flow canvas and node components
    panels/            Sidebar, prompt panel, AI dock
    store/             Zustand application state
  src-tauri/           Rust/Tauri desktop backend and packaging config
  doc/                 Usage tutorial and screenshots
pencil/                Pencil design files
run.bat                Build-if-needed and launch the Windows app
build.bat              Build the Windows installer
```

## Documentation supplémentaire

- [README en chinois](README.zh-CN.md)
- [Tutoriel d'utilisation en chinois](claude-code-workflow-openworkflow.md)

## Vérification

```bash
cd app
npm run typecheck
npm run lint
npm run package
```

## Licence

Aucune licence n'a encore été spécifiée.
