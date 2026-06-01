<div align="center">
  <a href="claude-code-workflow-openworkflow.en.md">English</a> | <a href="claude-code-workflow-openworkflow.md">中文</a> | <a href="claude-code-workflow-openworkflow.fr.md">Français</a> | Deutsch | <a href="claude-code-workflow-openworkflow.es.md">Español</a> | <a href="claude-code-workflow-openworkflow.pt.md">Português</a> | <a href="claude-code-workflow-openworkflow.ru.md">Русский</a> | <a href="claude-code-workflow-openworkflow.ja.md">日本語</a> | <a href="claude-code-workflow-openworkflow.hi.md">हिन्दी</a> | <a href="claude-code-workflow-openworkflow.ar.md">العربية</a>
</div>

# Claude Code hat Workflows. Was ist mit anderen Modellen? Ich habe OpenWorkflows ausprobiert

In letzter Zeit habe ich mich intensiv mit Claude Code Workflows beschäftigt.

Was mich interessiert, ist nicht nur "noch ein Feature". Es zieht komplexe Arbeit aus einem Chat-Turn nach dem anderen heraus. Aufgaben können in Subagenten, parallele Verzweigungen und Pipelines aufgeteilt und dann durch Skripte koordiniert werden.

Das ist wichtig, weil ein Workflow keine temporäre Anordnung innerhalb einer einzigen Konversation mehr ist. Er wird zu etwas, das man speichern, bearbeiten und wiederverwenden kann.

Das hat bei mir auch eine Frage aufgeworfen: Wenn Workflows zu einer gemeinsamen Schicht in der KI-Codierung werden, warum sollten sie an ein Modell oder eine CLI gebunden sein?

Also habe ich OpenWorkflows ausprobiert. Es verwandelt Claude Code-Workflows in eine visuelle Leinwand und versucht, denselben Workflow auf Claude Code, Codex, Gemini und weitere lokale oder cloudbasierte Runtimes auszurichten.

Dieses Tutorial beginnt nicht mit abstrakten Konzepten. Es führt die Screenshots der Reihe nach durch. Das Beispiel ist konkret: OpenWorkflows soll mehrere Erscheinungsbild-Themen unterstützen, standardmäßig Pencil verwenden und das Umschalten in Einstellungen / Erscheinungsbild ermöglichen.

> Dies ist die englische Version des screenshotbasierten Anwendungstutorials.
>
> Chinesische Version: [OpenWorkflows Anwendungstutorial](claude-code-workflow-openworkflow.md)

## 0. Beginnen Sie mit der finalen Oberfläche

<p align="center">
  <img src="images/0-标题使用.png" alt="OpenWorkflows Leinwand, Verlaufsleiste, Node-Eigenschaften und KI-Eingabebereich" width="960">
</p>
<p align="center"><em>Abbildung 0: Der Hauptarbeitsbereich von OpenWorkflows mit der Blueprint in der Mitte, den Node-Eigenschaften rechts und der KI-Ein- und Ausgabe unten.</em></p>

Die Haupt-Benutzeroberfläche hat vier Teile: Workflow-Verlauf links, die visuelle Leinwand in der Mitte, Node-Eigenschaften und gängige Prompts rechts sowie KI-Eingabe und Antwortbereiche unten.

Der Workflow auf dem Screenshot trägt den Titel "Pencil Multi-Theme Erscheinungsbild-Plan". Es ist kein statisches Diagramm. Es ist ein Workflow, den Sie weiter bearbeiten, in ein Skript umwandeln, ausführen und später erneut aufrufen können.

## 1. Laden Sie OpenWorkflows herunter

<p align="center">
  <img src="images/1-下载.png" alt="OpenWorkflows GitHub-Seite mit dem Eintrag Releases" width="840">
</p>
<p align="center"><em>Abbildung 1: Finden Sie den neuesten Build im Abschnitt Releases auf der GitHub-Seite.</em></p>

Der schnellste Weg, es auszuprobieren, ist die GitHub-Projektseite zu öffnen und die neueste Version aus Releases herunterzuladen.

Das Info-Panel rechts macht die Positionierung klar. Es handelt sich um einen visuellen Editor, der Claude Code Workflows auf Codex, Gemini und weitere LLM-Runtimes erweitert.

Wenn Sie am Code arbeiten möchten, klonen Sie das Repository und starten Sie aus dem Verzeichnis `app/`:

```bash
npm install
npm run dev
```

Für die Desktop-App verwenden Sie:

```bash
npm run desktop
```

## 2. Konfigurieren Sie zuerst die Modelle

<p align="center">
  <img src="images/2-配置大模型.png" alt="OpenWorkflows Modelleinstellungsseite" width="640">
</p>
<p align="center"><em>Abbildung 2: Konfigurieren Sie Provider, lokale CLI und das Standardmodell unter Einstellungen / Modelle.</em></p>

Bevor Sie irgendetwas zeichnen, öffnen Sie **Einstellungen / Modelle**. Hier konfigurieren Sie Provider, lokale CLIs, das Standardmodell und Runtime-Kanäle.

Jeder Provider zeigt seinen Status an, z. B. Standard, Direkt, CLI-Runtime oder nicht verfügbar. Der Screenshot zeigt auch, dass der Schlüssel lokal gespeichert wird.

Wenn Sie bereits `cc-switch` zur Verwaltung von Modellkonfigurationen verwenden, können Sie diese Daten hier importieren. Unten im KI-Eingabebereich können Sie außerdem auswählen, welches Modell oder welcher Kanal für diese Anfrage verwendet werden soll.

## 3. Erstellen Sie einen neuen Workflow und geben Sie eine Anfrage ein

<p align="center">
  <img src="images/3-新建workflow.png" alt="Einen neuen Workflow erstellen und eine Anfrage in der KI-Eingabe eingeben" width="840">
</p>
<p align="center"><em>Abbildung 3: Klicken Sie auf Neuen Workflow erstellen, und beschreiben Sie den Workflow in der KI-Eingabe unten rechts.</em></p>

Nachdem das Modell konfiguriert ist, klicken Sie links auf **Neuen Workflow erstellen**. Die Leinwand startet mit einer minimalen Struktur: Start, ein Agent und Ende.

Der eigentliche Ausgangspunkt ist nicht das manuelle Zeichnen von Nodes. Es ist die KI-Eingabe unten rechts. In diesem Beispiel habe ich eingegeben:

```text
I want OpenWorkflows to support multiple appearance themes,
default to Pencil,
and allow switching them in Settings / Appearance.
```

Nachdem Sie sie mit `Strg+Eingabe` oder durch Klicken auf die Senden-Schaltfläche abgesendet haben, verwandelt OpenWorkflows die Anfrage in eine bearbeitbare Workflow-Blueprint.

## 4-1. Generieren Sie die Workflow-Blueprint

<p align="center">
  <img src="images/4-1生成workflow蓝图.png" alt="Aus der Anfrage generierte Workflow-Blueprint" width="960">
</p>
<p align="center"><em>Abbildung 4-1: Die KI teilt das Ziel in parallele Verzweigungen, einen Zusammenfassungs-Node, Implementierungs-Nodes, Validierung und Auslieferung auf.</em></p>

Sobald die Anfrage gesendet wurde, schreibt OpenWorkflows den aktuellen Schritt in einen vollständigen Workflow um.

Die Blueprint auf dem Screenshot wird in etwa zu:

```text
Start
  -> Erscheinungsbild-Unterstützung parallel erkunden
      -> Aktuelle Einstiegspunkte recherchieren
      -> Das Theme-System entwerfen
      -> Das Standard-Theme Pencil entwerfen
  -> Den Implementierungsplan zusammenfassen
  -> Multi-Theme-Erscheinungsbild implementieren
  -> Einstellungen / Erscheinungsbild-Umschaltung verbinden
  -> Validieren und überprüfen
  -> Auslieferungsergebnisse protokollieren
  -> Ende
```

Was hier zählt, ist nicht, wie hübsch der Graph aussieht. Es ist, dass ein vages Ziel zu einem ausführbaren Plan wird.

Das Node-Eigenschaften-Panel rechts ermöglicht es Ihnen weiterhin, Labels, Typen, Verzweigungen, Agent-Typen und Schemas zu prüfen. Die Generierung sperrt Sie nicht aus der Bearbeitung der Struktur aus.

## 4-2. Zeigen Sie das generierte Skript an

<p align="center">
  <img src="images/4-2蓝图脚本.png" alt="Dialog für generiertes Workflow-Skript" width="960">
</p>
<p align="center"><em>Abbildung 4-2: Verwenden Sie die Schaltfläche Skript, um das aus der Leinwand generierte Workflow-Skript zu prüfen.</em></p>

In der oberen Leiste gibt es eine Schaltfläche **Skript**. Öffnen Sie sie, und Sie sehen das aus der aktuellen Blueprint generierte Skript.

Auf dem Screenshot können Sie `parallel(...)`- und `agent(...)`-Strukturen erkennen. Parallele Nodes werden zu gleichzeitigen Verzweigungen, und reguläre Nodes werden zu einzelnen Agent-Aufrufen.

Das zeigt, dass OpenWorkflows nicht nur Kästchen zeichnet. Die Leinwand wird von einer gemeinsamen Workflow-Struktur unterstützt, die später auf verschiedene Runtimes ausgerichtet werden kann.

## 5. Verfeinern Sie weiter mit gängigen Prompts

<p align="center">
  <img src="images/5-使用常用提示词.png" alt="Panel mit gängigen Prompts und KI-Eingabebereich" width="960">
</p>
<p align="center"><em>Abbildung 5: Gängige Prompts übertragen typische Workflow-Bearbeitungen in den KI-Eingabebereich.</em></p>

Nachdem die Blueprint generiert wurde, müssen Sie sie nicht sofort ausführen. Das Panel **Gängige Prompts** rechts eignet sich besser, um den Ablauf zu verfeinern.

Die Prompts sind nach Szenarien gruppiert: Klärung, Klarheit, Vollständigkeit, Kosten, Struktur, Zuverlässigkeit sowie Leistung und Parallelität und Verifizierung.

Der Screenshot zeigt den Prompt **Anfrage klären**. Er füllt die KI-Eingabe mit einer Anfrage, um vor der Änderung des Graphen wesentliche Unklarheiten zu bestätigen.

Das ist nützlich, weil viele Workflow-Fehler keine Modellfehler sind. Sie entstehen, weil das Ziel, die Grenzen, die Fehlerpfade oder die Kostenstrategie nie klar genug formuliert wurden.

## 6. Bestätigen Sie Grenzen mit interaktiven Auswahlmöglichkeiten

<p align="center">
  <img src="images/6-交互选择.png" alt="Interaktive Auswahlschaltflächen in der KI-Antwort" width="640">
</p>
<p align="center"><em>Abbildung 6: Wenn die Anfrage mehrdeutig ist, bietet die KI Auswahlmöglichkeiten, damit Sie zuerst den Umfang bestätigen können.</em></p>

Nachdem Sie **Anfrage klären** gewählt haben, ändert die KI den Graphen nicht sofort. Stattdessen stellt sie eine Folgefrage: Wie weit soll das Theme-Umschalten gehen?

Der Screenshot bietet zwei Möglichkeiten: Nur das Standard-Theme Pencil ausliefern und die Erweiterungsstruktur beibehalten, oder Pencil plus mehrere umschaltbare Themes ausliefern.

Sobald Sie eine Auswahl treffen, schreibt die KI diese Entscheidung zurück in die Workflow-Blueprint und gibt den aktualisierten IRGraph aus. Das reduziert das Risiko, dass die KI den Workflow eigenständig in die falsche Richtung lenkt.

## 7. Klicken Sie auf Ausführen

<p align="center">
  <img src="images/7-运行.png" alt="Schaltfläche Ausführen oben in OpenWorkflows" width="960">
</p>
<p align="center"><em>Abbildung 7: Nachdem die Blueprint fertig ist, klicken Sie oben in der Leiste auf Ausführen.</em></p>

Nachdem Struktur, Modelleinstellungen und wichtige Grenzen bestätigt wurden, klicken Sie auf **Ausführen**.

Es ist besser, den Workflow nicht im Moment seiner Generierung auszuführen. Prüfen Sie zuerst, ob die parallelen Verzweigungen Sinn ergeben, ob der Zusammenfassungs-Node nach den Verzweigungen kommt und ob die Validierung das Endergebnis abdeckt.

Wenn ein Node nur in der Verantwortlichkeit unklar ist, können Sie sein Label, seinen Prompt, seinen Agent-Typ oder sein Schema vor dem erneuten Ausführen bearbeiten.

## 8. Beobachten Sie den Ausführungsstatus

<p align="center">
  <img src="images/8-运行中.png" alt="Ausführungsstatus mit Stopp-Schaltfläche" width="960">
</p>
<p align="center"><em>Abbildung 8: Während der Ausführung ändert sich die Schaltfläche zu "Wird ausgeführt... Stopp", und jeder Node zeigt seinen Status an.</em></p>

Wenn der Workflow startet, ändert sich die obere Schaltfläche zu **Wird ausgeführt... Stopp**. Die KI-Eingabe unten ist gesperrt, damit sich die Blueprint während der Ausführung nicht ändert.

Die Leinwand zeigt den Node-Status direkt an. Auf dem Screenshot ist Start abgeschlossen, der parallele Node läuft noch, und der Zähler oben rechts zeigt den Ausführungsfortschritt an.

Das ist lesbarer als ein langes Protokoll. Wenn etwas fehlschlägt, müssen Sie nicht den gesamten Prompt wegwerfen. Sie können den fehlgeschlagenen Node finden und nur dessen Prompt, Modell oder Eingabe anpassen.

## 9. Wechseln Sie das Erscheinungsbild-Theme

<p align="center">
  <img src="images/9-切换风格.png" alt="Erscheinungsbild-Einstellungen mit mehreren Themes" width="840">
</p>
<p align="center"><em>Abbildung 9: Das finale Feature landet unter Einstellungen / Erscheinungsbild, wo Sie Pencil, Deep Night, Aurora, Daylight, Ember und weitere wählen können.</em></p>

Das Ziel dieses Beispiels ist es, OpenWorkflows die Unterstützung mehrerer Erscheinungsbild-Themes zu ermöglichen. Der finale Einstiegspunkt ist **Einstellungen / Erscheinungsbild**.

Der Screenshot zeigt Theme-Karten wie Pencil, Deep Night, Aurora, Daylight und Ember. Wenn Sie eines auswählen, ändern sich der globale Hintergrund, die Panels, die Rahmen und die Ausführungsfarben.

Das zeigt auch den echten Anwendungsfall hier. OpenWorkflows ist nicht nur für Demo-Diagramme gedacht. Es kann eine Produktanfrage in Recherche, Design, Implementierung, Validierung und Auslieferungsverfolgung aufteilen und jedes Stück durch den richtigen Node schieben.

## Was ich tatsächlich nützlich finde

OpenWorkflows ist wertvoller, als nur einen Prompt in einer Benutzeroberfläche zu verpacken.

Es verbindet Anfrage, Blueprint, Skript, Ausführung und Verlaufsprüfung. Sie können einen Ablauf in natürlicher Sprache generieren, die Struktur auf der Leinwand prüfen, mit gängigen Prompts die Grenzen festziehen und ihn erst dann ausführen.

Ein Workflow muss auch nicht an ein Modell gebunden sein. Einfache Nodes können günstigere Modelle verwenden, wichtige Nodes können stärkere verwenden, und das Ausführungsziel kann weiterhin auf Claude Code, Codex, Gemini oder andere Runtimes erweitert werden.

Für komplexe KI-Codierungsaufgaben ist diese Struktur viel einfacher zu warten als ein riesiger Prompt. Wenn ein Node fehlschlägt, beheben Sie diesen Node. Wenn ein Verzweigung unnötig ist, entfernen Sie sie. Wenn Sie Wiederverwendung wünschen, setzen Sie aus dem Verlauf fort.

## Wie dies zu Claude Code passt

OpenWorkflows sieht nicht wie ein Ersatz für Claude Code aus.

Claude Code hat die Workflow-Richtung bereits klar gemacht: Komplexe Arbeit kann als dynamische Skripte geschrieben, über mehrere Subagenten koordiniert und im Hintergrund ausgeführt werden.

OpenWorkflows fügt dieser Richtung eine visuelle Ebene hinzu: Zeichnen Sie den Workflow, bearbeiten Sie ihn, speichern Sie ihn, und probieren Sie dann dieselbe Struktur mit mehr Modellen und Runtimes aus.

Es geht also nicht gegen Claude Code. Es erweitert die Workflow-Idee nach außen.

## Noch früh, aber beobachtenswert

OpenWorkflows ist noch nicht ausgereift. Runtime-Adapter, Node-Funktionen und das Skript-Ökosystem werden sich weiter ändern.

Aber die Richtung ist klar. KI-Codierung wird nicht für immer bei "Öffne ein Chat-Fenster und schiebe jeden Schritt manuell voran" bleiben.

Letztendlich werden komplexe Aufgaben zu Workflows. Die einzige wirkliche Frage ist, ob dieser Workflow in einem Tool eingeschlossen bleibt, oder ob er gesehen, bearbeitet, migriert und wiederverwendet werden kann.

Projekt:

https://github.com/wellingfeng/OpenWorkflows

Referenz:

https://code.claude.com/docs/en/workflows
