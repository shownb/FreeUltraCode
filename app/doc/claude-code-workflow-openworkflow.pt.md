<div align="center">
  <a href="claude-code-workflow-openworkflow.en.md">English</a> | <a href="claude-code-workflow-openworkflow.md">中文</a> | <a href="claude-code-workflow-openworkflow.fr.md">Français</a> | <a href="claude-code-workflow-openworkflow.de.md">Deutsch</a> | <a href="claude-code-workflow-openworkflow.es.md">Español</a> | Português | <a href="claude-code-workflow-openworkflow.ru.md">Русский</a> | <a href="claude-code-workflow-openworkflow.ja.md">日本語</a> | <a href="claude-code-workflow-openworkflow.hi.md">हिन्दी</a> | <a href="claude-code-workflow-openworkflow.ar.md">العربية</a>
</div>

# O Claude Code Tem Workflows. E os Outros Modelos? Eu Experimentei o OpenWorkflows

Recentemente, tenho observado de perto os workflows do Claude Code.

O que me interessa não é apenas "mais um recurso". Ele extrai trabalhos complexos de um turno de chat após outro. Tarefas podem ser divididas em subagentes, ramificações paralelas e pipelines, e então coordenadas por scripts.

Isso importa porque um workflow deixa de ser um arranjo temporário dentro de uma conversa. Ele se torna algo que você pode salvar, editar e reutilizar.

Isso também me levantou uma questão: se os workflows estão se tornando uma camada comum na programação com IA, por que eles deveriam estar vinculados a um único modelo ou a uma única CLI?

Então, experimentei o OpenWorkflows. Ele transforma workflows no estilo do Claude Code em um canvas visual e tenta fazer com que o mesmo workflow seja direcionado ao Claude Code, Codex, Gemini e a mais runtimes locais ou na nuvem.

Este tutorial não começa com conceitos abstratos. Ele percorre as capturas de tela em ordem. O exemplo é concreto: fazer o OpenWorkflows suportar múltiplos temas de aparência, definir o Pencil como padrão e permitir a troca em Configurações / Aparência.

> Esta é a versão em inglês do tutorial de uso baseado em capturas de tela.
>
> Versão em chinês: [Tutorial de uso do OpenWorkflows](claude-code-workflow-openworkflow.md)

## 0. Comece pela interface final

<p align="center">
  <img src="images/0-标题使用.png" alt="Canvas do OpenWorkflows, trilho de histórico, propriedades do nó e área de entrada de IA" width="960">
</p>
<p align="center"><em>Figura 0: O espaço de trabalho principal do OpenWorkflows, com o blueprint no centro, as propriedades do nó à direita e a entrada e saída de IA na parte inferior.</em></p>

A interface principal tem quatro partes: histórico do workflow à esquerda, o canvas visual no centro, propriedades do nó e prompts comuns à direita, e a entrada de IA mais os painéis de resposta na parte inferior.

O workflow na captura de tela é intitulado "Plano de aparência multitema do Pencil". Não é um diagrama estático. É um workflow que você pode continuar editando, transformar em script, executar e revisitar mais tarde.

## 1. Baixe o OpenWorkflows

<p align="center">
  <img src="images/1-下载.png" alt="Página do GitHub do OpenWorkflows com a entrada Releases" width="840">
</p>
<p align="center"><em>Figura 1: Encontre a build mais recente na seção Releases da página do GitHub.</em></p>

A maneira mais rápida de experimentá-lo é abrir a página do projeto no GitHub e baixar o release mais recente em Releases.

O painel Sobre à direita deixa claro o posicionamento. Este é um editor visual que estende os Workflows do Claude Code ao Codex, Gemini e mais runtimes de LLM.

Se você quiser trabalhar no código, clone o repositório e comece a partir do diretório `app/`:

```bash
npm install
npm run dev
```

Para o aplicativo desktop, use:

```bash
npm run desktop
```

## 2. Configure os modelos primeiro

<p align="center">
  <img src="images/2-配置大模型.png" alt="Página de configuração de modelos do OpenWorkflows" width="640">
</p>
<p align="center"><em>Figura 2: Configure provedores, CLI local e o modelo padrão em Configurações / Modelos.</em></p>

Antes de desenhar qualquer coisa, abra **Configurações / Modelos**. É aqui que você configura provedores, CLIs locais, o modelo padrão e canais de runtime.

Cada provedor mostra seu status, como padrão, direto, runtime CLI ou indisponível. A captura de tela também mostra que a chave é armazenada localmente.

Se você já usa o `cc-switch` para gerenciar configurações de modelos, pode importar esses dados aqui. Na parte inferior da área de entrada de IA, você também pode escolher qual modelo ou canal esta solicitação deve usar.

## 3. Crie um novo workflow e insira uma solicitação

<p align="center">
  <img src="images/3-新建workflow.png" alt="Criando um novo workflow e inserindo uma solicitação na entrada de IA" width="840">
</p>
<p align="center"><em>Figura 3: Clique em Novo Workflow e, em seguida, descreva o workflow na entrada de IA no canto inferior direito.</em></p>

Depois que o modelo estiver configurado, clique em **Novo Workflow** à esquerda. O canvas começa com uma estrutura mínima: Início, um Agente e Fim.

O verdadeiro ponto de partida não é o desenho manual de nós. É a entrada de IA no canto inferior direito. Neste exemplo, digitei:

```text
Quero que o OpenWorkflows suporte múltiplos temas de aparência,
defina o Pencil como padrão
e permita a troca deles em Configurações / Aparência.
```

Depois de enviar com `Ctrl+Enter` ou clicando no botão de enviar, o OpenWorkflows transforma a solicitação em um blueprint de workflow editável.

## 4-1. Gere o blueprint do workflow

<p align="center">
  <img src="images/4-1生成workflow蓝图.png" alt="Blueprint do workflow gerado a partir da solicitação" width="960">
</p>
<p align="center"><em>Figura 4-1: A IA divide o objetivo em ramificações paralelas, um nó de resumo, nós de implementação, validação e entrega.</em></p>

Assim que a solicitação é enviada, o OpenWorkflows reescreve a etapa atual em um workflow completo.

O blueprint na captura de tela torna-se aproximadamente:

```text
Início
  -> Explorar suporte de aparência em paralelo
      -> Pesquisar pontos de entrada atuais
      -> Projetar o sistema de temas
      -> Projetar o tema padrão Pencil
  -> Resumir o plano de implementação
  -> Implementar aparência multitema
  -> Conectar a troca em Configurações / Aparência
  -> Validar e revisar
  -> Registrar resultados de entrega
  -> Fim
```

O que importa aqui não é quão bonito o grafo parece. É que um objetivo vago se torna um plano executável.

O painel de propriedades do nó à direita ainda permite inspecionar rótulos, tipos, ramificações, tipos de agente e schemas. A geração não o impede de editar a estrutura.

## 4-2. Visualize o script gerado

<p align="center">
  <img src="images/4-2蓝图脚本.png" alt="Diálogo do script do workflow gerado" width="960">
</p>
<p align="center"><em>Figura 4-2: Use o botão Script para inspecionar o script do workflow gerado a partir do canvas.</em></p>

Há um botão **Script** na barra superior. Abra-o e você verá o script gerado a partir do blueprint atual.

Na captura de tela, você pode ver as estruturas `parallel(...)` e `agent(...)`. Nós paralelos se tornam ramificações concorrentes, e nós regulares se tornam chamadas individuais de agente.

Isso mostra que o OpenWorkflows não está apenas desenhando caixas. O canvas é respaldado por uma estrutura de workflow compartilhada que pode mais tarde direcionar diferentes runtimes.

## 5. Continue refinando com prompts comuns

<p align="center">
  <img src="images/5-使用常用提示词.png" alt="Painel de prompts comuns e área de entrada de IA" width="960">
</p>
<p align="center"><em>Figura 5: Os prompts comuns empurram edições típicas de workflow para a área de entrada de IA.</em></p>

Depois que o blueprint é gerado, você não precisa executá-lo imediatamente. O painel **Prompts Comuns** à direita é melhor para refinar o fluxo.

Os prompts são agrupados por cenário: esclarecimento, clareza, completude, custo, estrutura, confiabilidade e paralelismo, e verificação.

A captura de tela mostra o prompt **Esclarecer Solicitação**. Ele preenche a entrada de IA com uma solicitação para confirmar ambiguidades-chave antes de alterar o grafo.

Isso é útil porque muitas falhas de workflow não são falhas de modelo. Elas acontecem porque o objetivo, os limites, os caminhos de falha ou a estratégia de custo nunca foram declarados com clareza suficiente.

## 6. Confirme os limites com escolhas interativas

<p align="center">
  <img src="images/6-交互选择.png" alt="Botões de escolha interativa na resposta da IA" width="640">
</p>
<p align="center"><em>Figura 6: Quando a solicitação é ambígua, a IA oferece escolhas para que você possa confirmar o escopo primeiro.</em></p>

Depois de escolher **Esclarecer Solicitação**, a IA não altera o grafo imediatamente. Em vez disso, ela faz uma pergunta de acompanhamento: até onde deve ir a troca de temas?

A captura de tela oferece duas escolhas: enviar apenas o tema padrão Pencil e deixar a estrutura de expansão no lugar, ou enviar o Pencil mais múltiplos temas trocáveis.

Assim que você escolhe, a IA escreve essa decisão de volta no blueprint do workflow e gera o IRGraph atualizado. Isso reduz o risco da IA levar o workflow na direção errada por conta própria.

## 7. Clique em Executar

<p align="center">
  <img src="images/7-运行.png" alt="Botão Executar no topo do OpenWorkflows" width="960">
</p>
<p align="center"><em>Figura 7: Depois que o blueprint estiver pronto, clique em Executar na barra superior.</em></p>

Depois que a estrutura, as configurações de modelo e os limites-chave são confirmados, clique em **Executar**.

É melhor não executar o workflow no momento em que ele é gerado. Primeiro, verifique se as ramificações paralelas fazem sentido, se o nó de resumo vem depois das ramificações e se a validação cobre o resultado final.

Se um nó estiver apenas com responsabilidade pouco clara, você pode editar seu rótulo, prompt, tipo de agente ou schema antes de executar novamente.

## 8. Acompanhe o estado de execução

<p align="center">
  <img src="images/8-运行中.png" alt="Estado de execução com botão de parar" width="960">
</p>
<p align="center"><em>Figura 8: Durante a execução, o botão muda para "Executando... Parar", e cada nó mostra seu estado.</em></p>

Quando o workflow inicia, o botão superior muda para **Executando... Parar**. A entrada de IA na parte inferior é bloqueada para que o blueprint não mude durante a execução.

O canvas mostra o status dos nós diretamente. Na captura de tela, o Início foi concluído, o nó paralelo ainda está em execução, e o contador no canto superior direito mostra o progresso da execução.

Isso é mais legível do que um log longo. Se algo falhar, você não precisa descartar todo o prompt. Você pode encontrar o nó com falha e ajustar apenas o prompt, o modelo ou a entrada daquele nó.

## 9. Troque o tema de aparência

<p align="center">
  <img src="images/9-切换风格.png" alt="Configurações de aparência com múltiplos temas" width="840">
</p>
<p align="center"><em>Figura 9: O recurso final fica em Configurações / Aparência, onde você pode escolher Pencil, Deep Night, Aurora, Daylight, Ember e mais.</em></p>

O objetivo deste exemplo é fazer o OpenWorkflows suportar múltiplos temas de aparência. O ponto de entrada final é **Configurações / Aparência**.

A captura de tela mostra cartões de tema como Pencil, Deep Night, Aurora, Daylight e Ember. Quando você escolhe um, ele altera o fundo global, os painéis, as bordas e as cores do estado de execução.

Isso também mostra o caso de uso real aqui. O OpenWorkflows não serve apenas para diagramas de demonstração. Ele pode dividir uma solicitação de produto em pesquisa, design, implementação, validação e acompanhamento de entrega, e então empurrar cada parte pelo nó certo.

## O que eu acho realmente útil

O OpenWorkflows é valioso para mais do que apenas envolver um prompt em uma interface.

Ele conecta solicitação, blueprint, script, execução e revisão de histórico. Você pode gerar um fluxo em linguagem natural, inspecionar a estrutura no canvas, usar prompts comuns para apertar os limites e só então executá-lo.

Um workflow também não precisa estar vinculado a um único modelo. Nós simples podem usar modelos mais baratos, nós importantes podem usar modelos mais potentes, e o alvo de execução ainda pode se expandir ao Claude Code, Codex, Gemini ou outros runtimes.

Para tarefas complexas de programação com IA, essa estrutura é muito mais fácil de manter do que um prompt enorme. Se um nó falhar, corrija aquele nó. Se uma ramificação for desnecessária, remova-a. Se quiser reutilização, continue a partir do histórico.

## Como isso se relaciona ao Claude Code

O OpenWorkflows não parece um substituto para o Claude Code.

O Claude Code já deixou clara a direção do workflow: trabalhos complexos podem ser escritos como scripts dinâmicos, coordenados entre múltiplos subagentes e executados em segundo plano.

O OpenWorkflows adiciona uma camada visual a essa direção: desenhe o workflow, edite-o, salve-o e, em seguida, experimente a mesma estrutura em mais modelos e runtimes.

Então, ele não está indo contra o Claude Code. Ele está estendendo a ideia de workflow para fora.

## Ainda inicial, mas vale a pena acompanhar

O OpenWorkflows ainda não é maduro. Adaptadores de runtime, capacidades de nós e o ecossistema de scripts continuarão mudando.

Mas a direção é clara. A programação com IA não ficará para sempre em "abra uma caixa de chat e empurre manualmente cada etapa".

Eventualmente, tarefas complexas se tornarão workflows. A única questão real é se esse workflow permanecerá bloqueado dentro de uma única ferramenta, ou se poderá ser visto, editado, migrado e reutilizado.

Projeto:

https://github.com/wellingfeng/OpenWorkflows

Referência:

https://code.claude.com/docs/en/workflows
