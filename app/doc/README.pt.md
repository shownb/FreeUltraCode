# OpenWorkflows

<div align="center">
  <a href="../../README.md">English</a> | <a href="README.zh-CN.md">中文</a> | <a href="README.fr.md">Français</a> | <a href="README.de.md">Deutsch</a> | <a href="README.es.md">Español</a> | Português | <a href="README.ru.md">Русский</a> | <a href="README.ja.md">日本語</a> | <a href="README.hi.md">हिन्दी</a> | <a href="README.ar.md">العربية</a>
</div>

Claude Code introduziu um recurso de Workflow para orquestrar etapas multiagente, ramificações paralelas e pipelines como scripts executáveis. O OpenWorkflows transforma esse padrão em um editor visual e multimodelo: construa um grafo de Workflow uma vez e, em seguida, execute-o ou adapte-o no Claude Code, Codex, Gemini e em futuros runtimes de modelos locais ou na nuvem.

O IR compartilhado mantém a estrutura do workflow portável, ao mesmo tempo em que permite que cada nó escolha seu modelo, prompt, schema e configurações de execução voltados ao runtime.

<p align="center">
  <img src="images/0-标题使用.png" alt="Captura de tela do editor do OpenWorkflows" width="960">
</p>

## Tutorial de Uso

- [Tutorial de uso do OpenWorkflows](claude-code-workflow-openworkflow.en.md) - passo a passo com as capturas de tela, da configuração à troca de runtime.

## Suporte a Workflows Multimodelo

- O OpenWorkflows estende a ideia de Workflow do Claude Code para além de um único runtime de LLM.
- O mesmo grafo de Workflow pode ser editado visualmente e direcionado ao Claude Code, Codex, Gemini ou adaptadores adicionais.
- Primitivas no estilo do Claude Code, como etapas de agente, ramificações paralelas e pipelines, tornam-se nós de grafo portáveis.
- Cada nó pode carregar seu próprio prompt, tier de modelo, schema e configurações de execução.
- A visualização de script compila o grafo em scripts de Workflow executáveis no estilo do Claude Code hoje, com a camada de adaptadores pronta para outros runtimes de modelos.

## Por que o OpenWorkflows

- Descreva o objetivo na entrada de IA no canto inferior direito e gere um blueprint de Workflow editável.
- Autoria visual de workflows em vez de editar manualmente grandes scripts multiagente.
- Uma biblioteca de prompts reutilizável com reescritas de workflow comuns e prompts de revisão.
- Histórico de workspace e de sessões para você retornar rapidamente a trabalhos anteriores.
- Controles de execução/parada com estado de execução por nó no canvas.
- Armazenamento local da chave de API para o assistente de IA no lado do navegador, mantido apenas na máquina.

## Início Rápido

```bash
cd app
npm install
npm run dev
```

Para o aplicativo desktop:

```bash
cd app
npm run desktop
```

Para um pacote de release do Windows:

```bash
cd app
npm run package
```

A partir da raiz do repositório, o `run.bat` inicia o aplicativo e o reconstrói quando necessário, e o `build.bat` empacota o instalador do Windows.

## Uso Básico

1. Crie um novo workflow ou abra um existente.
2. Descreva a tarefa na entrada de IA no canto inferior direito. O OpenWorkflows gera o blueprint do Workflow automaticamente.
3. Continue refinando o blueprint digitando instruções de acompanhamento na mesma entrada, ou clique nos prompts comuns no painel à direita para edições voltadas a estrutura, completude, custo, confiabilidade e rollback.
4. Selecione nós individuais quando precisar editar manualmente prompts, modelos, schemas ou parâmetros de execução.
5. Escolha um adaptador de runtime como Claude Code, Codex ou Gemini e, em seguida, ajuste os modelos dos nós conforme necessário.
6. Clique no botão Run no topo para executar o workflow, acompanhe as atualizações de status por nó e pare a qualquer momento.
7. Alterne entre sessões ou workspaces a partir da barra de histórico para continuar trabalhos anteriores.

## Estrutura do Projeto

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

## Mais Documentação

- [README em chinês](README.zh-CN.md)
- [Tutorial de uso em chinês](claude-code-workflow-openworkflow.md)

## Verificação

```bash
cd app
npm run typecheck
npm run lint
npm run package
```

## Licença

Nenhuma licença foi especificada ainda.
