# OpenWorkflows

<div align="center">
  <a href="../../README.md">English</a> | <a href="README.zh-CN.md">中文</a> | <a href="README.fr.md">Français</a> | Deutsch | <a href="README.es.md">Español</a> | <a href="README.pt.md">Português</a> | <a href="README.ru.md">Русский</a> | <a href="README.ja.md">日本語</a> | <a href="README.hi.md">हिन्दी</a> | <a href="README.ar.md">العربية</a>
</div>

Claude Code hat eine Workflow-Funktion eingeführt, um mehrstufige Multi-Agent-Abläufe, parallele Verzweigungen und Pipelines als ausführbare Skripte zu orchestrieren. OpenWorkflows verwandelt dieses Muster in einen visuellen Multi-Model-Editor: Erstellen Sie einen Workflow-Graphen und führen Sie ihn dann über Claude Code, Codex, Gemini und zukünftige lokale oder cloudbasierte Modell-Runtimes aus oder passen Sie ihn an.

Die gemeinsame IR hält die Workflow-Struktur portabel und ermöglicht es jedem Node gleichzeitig, sein zur Runtime gerichtetes Modell, seinen Prompt, sein Schema und seine Ausführungseinstellungen zu wählen.

<p align="center">
  <img src="images/0-标题使用.png" alt="OpenWorkflows Editor-Screenshot" width="960">
</p>

## Anwendungstutorial

- [OpenWorkflows Anwendungstutorial](claude-code-workflow-openworkflow.en.md) – Schritt-für-Schritt-Anleitung mit den Screenshots vom Setup bis zum Umschalten der Runtime.

## Multi-Model-Workflow-Unterstützung

- OpenWorkflows erweitert die Idee des Claude Code Workflow über eine einzelne LLM-Runtime hinaus.
- Derselbe Workflow-Graph kann visuell bearbeitet und auf Claude Code, Codex, Gemini oder zusätzliche Adapter ausgerichtet werden.
- Primitive im Stil von Claude Code wie Agent-Schritte, parallele Verzweigungen und Pipelines werden zu portablen Graph-Nodes.
- Jeder Node kann seinen eigenen Prompt, seine Modellstufe, sein Schema und seine Ausführungseinstellungen tragen.
- Die Skriptansicht kompiliert den Graphen heute in ausführbare Workflow-Skripte im Stil von Claude Code, wobei die Adapterschicht für andere Modell-Runtimes bereitsteht.

## Warum OpenWorkflows

- Beschreiben Sie das Ziel in der KI-Eingabe unten rechts und generieren Sie eine bearbeitbare Workflow-Blueprint.
- Visuelle Workflow-Erstellung statt manueller Bearbeitung großer Multi-Agent-Skripte.
- Eine wiederverwendbare Prompt-Bibliothek mit gängigen Workflow-Umschreibungen und Review-Prompts.
- Workspace- und Sitzungsverlauf, damit Sie schnell zu früheren Arbeiten zurückkehren können.
- Ausführungs-/Stopp-Steuerungen mit Ausführungsstatus pro Node auf der Canvas.
- Lokale Speicherung von API-Schlüsseln für die browserseitige KI-Unterstützung, die nur auf dem Gerät verbleibt.

## Schnellstart

```bash
cd app
npm install
npm run dev
```

Für die Desktop-App:

```bash
cd app
npm run desktop
```

Für ein Windows-Release-Paket:

```bash
cd app
npm run package
```

Vom Repository-Stammverzeichnis aus startet `run.bat` die App und baut sie bei Bedarf neu, und `build.bat` paketiert den Windows-Installer.

## Grundlegende Verwendung

1. Erstellen Sie einen neuen Workflow oder öffnen Sie einen bestehenden.
2. Beschreiben Sie die Aufgabe in der KI-Eingabe unten rechts. OpenWorkflows generiert die Workflow-Blueprint automatisch.
3. Verfeinern Sie die Blueprint weiter, indem Sie Folgeanweisungen in dieselbe Eingabe eingeben, oder klicken Sie auf gängige Prompts im rechten Panel für Bearbeitungen, die auf Struktur, Vollständigkeit, Kosten, Zuverlässigkeit und Rollback ausgerichtet sind.
4. Wählen Sie einzelne Nodes aus, wenn Sie Prompts, Modelle, Schemas oder Ausführungsparameter manuell bearbeiten müssen.
5. Wählen Sie einen Runtime-Adapter wie Claude Code, Codex oder Gemini und passen Sie dann die Node-Modelle nach Bedarf an.
6. Klicken Sie oben auf die Schaltfläche „Ausführen", um den Workflow auszuführen, beobachten Sie die Statusaktualisierungen pro Node und stoppen Sie jederzeit.
7. Wechseln Sie über die Verlaufsleiste zwischen Sitzungen oder Workspaces, um frühere Arbeiten fortzusetzen.

## Projektstruktur

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

## Weitere Dokumentation

- [Chinesische README](README.zh-CN.md)
- [Chinesisches Anwendungstutorial](claude-code-workflow-openworkflow.md)

## Verifizierung

```bash
cd app
npm run typecheck
npm run lint
npm run package
```

## Lizenz

Es wurde noch keine Lizenz angegeben.
