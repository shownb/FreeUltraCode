# OpenWorkflows

<div align="center">
  <a href="../../README.md">English</a> | <a href="README.zh-CN.md">中文</a> | <a href="README.fr.md">Français</a> | <a href="README.de.md">Deutsch</a> | Español | <a href="README.pt.md">Português</a> | <a href="README.ru.md">Русский</a> | <a href="README.ja.md">日本語</a> | <a href="README.hi.md">हिन्दी</a> | <a href="README.ar.md">العربية</a>
</div>

Claude Code introdujo una función de Workflow para orquestar pasos multiagente, ramas paralelas y pipelines como scripts ejecutables. OpenWorkflows convierte ese patrón en un editor visual y multimodelo: construye un único grafo de Workflow y luego ejecútalo o adáptalo en Claude Code, Codex, Gemini y futuros entornos de ejecución de modelos locales o en la nube.

El IR compartido mantiene portable la estructura del workflow, al tiempo que permite que cada nodo elija el modelo, el prompt, el schema y la configuración de ejecución que expone al runtime.

<p align="center">
  <img src="images/0-标题使用.png" alt="Captura de pantalla del editor de OpenWorkflows" width="960">
</p>

## Tutorial de uso

- [Tutorial de uso de OpenWorkflows](claude-code-workflow-openworkflow.en.md) - recorrido paso a paso con capturas de pantalla, desde la configuración hasta el cambio de runtime.

## Soporte de workflows multimodelo

- OpenWorkflows extiende la idea de Workflow de Claude Code más allá de un único runtime de LLM.
- El mismo grafo de Workflow puede editarse visualmente y dirigirse a Claude Code, Codex, Gemini o adaptadores adicionales.
- Las primitivas al estilo de Claude Code, como los pasos de agente, las ramas paralelas y los pipelines, se convierten en nodos de grafo portables.
- Cada nodo puede llevar su propio prompt, nivel de modelo, schema y configuración de ejecución.
- La vista de script compila hoy el grafo en scripts de Workflow ejecutables al estilo de Claude Code, con la capa de adaptadores lista para otros runtimes de modelos.

## Por qué OpenWorkflows

- Describe el objetivo en el campo de entrada de IA de la esquina inferior derecha y genera un blueprint de Workflow editable.
- Creación visual de workflows en lugar de editar a mano grandes scripts multiagente.
- Una biblioteca de prompts reutilizable con reescrituras de workflow y prompts de revisión habituales.
- Historial de espacios de trabajo y sesiones para que puedas volver rápidamente a trabajo anterior.
- Controles de ejecución/parada con estado de ejecución por nodo en el lienzo.
- Almacenamiento local de la clave de API para la asistencia de IA del lado del navegador, mantenida únicamente en la máquina.

## Inicio rápido

```bash
cd app
npm install
npm run dev
```

Para la aplicación de escritorio:

```bash
cd app
npm run desktop
```

Para un paquete de release de Windows:

```bash
cd app
npm run package
```

Desde la raíz del repositorio, `run.bat` inicia la aplicación y la reconstruye cuando es necesario, y `build.bat` empaqueta el instalador de Windows.

## Uso básico

1. Crea un nuevo workflow o abre uno existente.
2. Describe la tarea en el campo de entrada de IA de la esquina inferior derecha. OpenWorkflows genera el blueprint de Workflow automáticamente.
3. Sigue refinando el blueprint escribiendo instrucciones de seguimiento en el mismo campo, o haz clic en los prompts habituales del panel derecho para realizar ediciones orientadas a la estructura, la exhaustividad, el coste, la fiabilidad y el rollback.
4. Selecciona nodos individuales cuando necesites editar manualmente prompts, modelos, schemas o parámetros de ejecución.
5. Elige un adaptador de runtime como Claude Code, Codex o Gemini y, luego, ajusta los modelos de los nodos según sea necesario.
6. Haz clic en el botón Run de la parte superior para ejecutar el workflow, observa las actualizaciones de estado por nodo y detente en cualquier momento.
7. Cambia de sesión o de espacio de trabajo desde la barra de historial para continuar con trabajo anterior.

## Estructura del proyecto

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

## Más documentación

- [README en chino](README.zh-CN.md)
- [Tutorial de uso en chino](claude-code-workflow-openworkflow.md)

## Verificación

```bash
cd app
npm run typecheck
npm run lint
npm run package
```

## Licencia

Todavía no se ha especificado ninguna licencia.
