<div align="center">
  <a href="claude-code-workflow-openworkflow.en.md">English</a> | <a href="claude-code-workflow-openworkflow.md">中文</a> | <a href="claude-code-workflow-openworkflow.fr.md">Français</a> | <a href="claude-code-workflow-openworkflow.de.md">Deutsch</a> | <a href="claude-code-workflow-openworkflow.es.md">Español</a> | <a href="claude-code-workflow-openworkflow.pt.md">Português</a> | <a href="claude-code-workflow-openworkflow.ru.md">Русский</a> | 日本語 | <a href="claude-code-workflow-openworkflow.hi.md">हिन्दी</a> | <a href="claude-code-workflow-openworkflow.ar.md">العربية</a>
</div>

# Claude Code に Workflow があるなら、他のモデルはどうなる？ OpenWorkflows を試してみた

最近、Claude Code の Workflow 機能をじっくり調べている。

興味があるのは「ただの新機能」ではない。複雑な作業を 1 回のチャットターンから解放し、タスクをサブエージェント、並列ブランチ、パイプラインに分割してスクリプトで調整できる。

それが重要なのは、Workflow が 1 つの会話の中の一時的な構成ではなくなり、保存・編集・再利用できるものになるからだ。

そこで疑問が浮かんだ。Workflow が AI コーディングの共通レイヤーになりつつあるなら、なぜ 1 つのモデルや 1 つの CLI に縛られるべきなのか？

そこで OpenWorkflows を試してみた。Claude Code スタイルの Workflow をビジュアルなキャンバスに変え、同じ Workflow を Claude Code、Codex、Gemini、そしてその他のローカルまたはクラウドのランタイムを対象にできるようにしている。

このチュートリアルは抽象概念から始めない。スクリーンショットを順に見ていく。例は具体的だ。OpenWorkflows に複数の外観テーマをサポートし、デフォルトを Pencil にして、設定 / 外観 で切り替えられるようにする。

> これはスクリーンショットベースの使用チュートリアルの英語版です。
>
> 中国語版: [OpenWorkflows 使用教程](claude-code-workflow-openworkflow.md)

## 0. 最終的なインターフェースから始める

<p align="center">
  <img src="images/0-标题使用.png" alt="OpenWorkflows のキャンバス、履歴レール、ノードプロパティ、AI 入力エリア" width="960">
</p>
<p align="center"><em>図 0: OpenWorkflows のメインワークスペース。中央にブループリント、右にノードプロパティ、下部に AI の入出力がある。</em></p>

メイン UI は 4 つの部分からなる。左側の Workflow 履歴、中央のビジュアルキャンバス、右側のノードプロパティとよく使うプロンプト、下部の AI 入力と応答パネル。

スクリーンショットの Workflow は「Pencil マルチテーマ外観計画」というタイトルだ。これは静的な図ではない。編集し続けたり、スクリプトに変換したり、実行したり、後で再訪したりできる Workflow だ。

## 1. OpenWorkflows をダウンロードする

<p align="center">
  <img src="images/1-下载.png" alt="Releases エントリがある OpenWorkflows の GitHub ページ" width="840">
</p>
<p align="center"><em>図 1: GitHub ページの Releases セクションから最新のビルドを入手する。</em></p>

試す最も速い方法は、GitHub プロジェクトページを開いて Releases から最新版をダウンロードすることだ。

右側の About パネルではポジショニングが明確になっている。これは Claude Code Workflow を Codex、Gemini、その他の LLM ランタイムへ拡張するビジュアルエディタだ。

コードをいじりたい場合は、リポジトリをクローンして `app/` ディレクトリから始める：

```bash
npm install
npm run dev
```

デスクトップアプリの場合は：

```bash
npm run desktop
```

## 2. まずモデルを設定する

<p align="center">
  <img src="images/2-配置大模型.png" alt="OpenWorkflows のモデル設定ページ" width="640">
</p>
<p align="center"><em>図 2: 設定 / モデル でプロバイダー、ローカル CLI、デフォルトモデルを設定する。</em></p>

何かを描く前に、**設定 / モデル** を開く。ここでプロバイダー、ローカル CLI、デフォルトモデル、ランタイムチャンネルを設定する。

各プロバイダーには、デフォルト、ダイレクト、CLI ランタイム、利用不可といったステータスが表示される。スクリーンショットではキーがローカルに保存されていることも示されている。

すでに `cc-switch` でモデル設定を管理している場合は、ここでそのデータをインポートできる。AI 入力エリアの下部では、このリクエストにどのモデルやチャンネルを使うかも選べる。

## 3. 新しい Workflow を作成し、リクエストを入力する

<p align="center">
  <img src="images/3-新建workflow.png" alt="新しい Workflow を作成し、AI 入力にリクエストを入力する" width="840">
</p>
<p align="center"><em>図 3: 新規 Workflow をクリックし、右下の AI 入力欄で Workflow を記述する。</em></p>

モデルの設定が済んだら、左側の **新規 Workflow** をクリックする。キャンバスは最小構成で始まる。Start、1 つの Agent、End。

本当の出発点は手動でのノード描画ではない。右下の AI 入力欄だ。この例では、次のように入力した：

```text
I want OpenWorkflows to support multiple appearance themes,
default to Pencil,
and allow switching them in Settings / Appearance.
```

`Ctrl+Enter` または送信ボタンで送信すると、OpenWorkflows はリクエストを編集可能な Workflow ブループリントに変換する。

## 4-1. Workflow ブループリントを生成する

<p align="center">
  <img src="images/4-1生成workflow蓝图.png" alt="リクエストから生成された Workflow ブループリント" width="960">
</p>
<p align="center"><em>図 4-1: AI が目標を並列ブランチ、サマリーノード、実装ノード、検証、デリバリーに分割する。</em></p>

リクエストが送信されると、OpenWorkflows は現在のステップを完全な Workflow に書き換える。

スクリーンショットのブループリントはおおまかに次のようになる：

```text
Start
  -> Explore appearance support in parallel
      -> Research current entry points
      -> Design the theme system
      -> Design the Pencil default theme
  -> Summarize the implementation plan
  -> Implement multi-theme appearance
  -> Connect Settings / Appearance switching
  -> Validate and review
  -> Record delivery results
  -> End
```

ここで重要なのは、グラフがどれだけきれいに見えるかではない。あいまいな目標が実行可能な計画になったことだ。

右側のノードプロパティパネルでは、ラベル、タイプ、ブランチ、エージェントタイプ、スキーマを確認できる。生成が構造の編集をロックするわけではない。

## 4-2. 生成されたスクリプトを確認する

<p align="center">
  <img src="images/4-2蓝图脚本.png" alt="生成された Workflow スクリプトのダイアログ" width="960">
</p>
<p align="center"><em>図 4-2: 上部の Script ボタンを使い、キャンバスから生成された Workflow スクリプトを確認する。</em></p>

上部バーに **Script** ボタンがある。開くと、現在のブループリントから生成されたスクリプトが表示される。

スクリーンショットでは `parallel(...)` と `agent(...)` の構造が見える。並列ノードは並発ブランチになり、通常のノードは個別のエージェント呼び出しになる。

これは、OpenWorkflows が単に箱を描いているだけではないことを示している。キャンバスの裏には、後で異なるランタイムを対象にできる共有 Workflow 構造がある。

## 5. よく使うプロンプトで磨き続ける

<p align="center">
  <img src="images/5-使用常用提示词.png" alt="よく使うプロンプトパネルと AI 入力エリア" width="960">
</p>
<p align="center"><em>図 5: よく使うプロンプトは、典型的な Workflow 編集を AI 入力欄にプッシュする。</em></p>

ブループリントが生成されたら、すぐに実行する必要はない。右側の **よく使うプロンプト** パネルは、フローを磨くのに適している。

プロンプトはシナリオ別にグループ化されている。明確化、可読性、完全性、コスト、構造、信頼性、パフォーマンスと並列性、検証。

スクリーンショットでは **Clarify Request（リクエストの明確化）** プロンプトが表示されている。これは、グラフを変更する前に重要なあいまいさを確認するよう求めるリクエストを AI 入力欄に入力する。

これは役に立つ。多くの Workflow 失敗はモデルの失敗ではない。目標、境界、失敗パス、コスト戦略が十分に明確に述べられていないために起こる。

## 6. インタラクティブな選択で境界を確認する

<p align="center">
  <img src="images/6-交互选择.png" alt="AI 応答のインタラクティブな選択ボタン" width="640">
</p>
<p align="center"><em>図 6: リクエストがあいまいな場合、AI は選択肢を提示し、まずスコープを確認できるようにする。</em></p>

**Clarify Request** を選ぶと、AI はすぐにグラフを変更しない。代わりにフォローアップの質問をする。テーマの切り替えはどこまでやるべきか？

スクリーンショットでは 2 つの選択肢が提示されている。Pencil のデフォルトテーマだけを出荷し、拡張の構造はそのままにするか、Pencil に加えて複数の切り替え可能なテーマを出荷するか。

選択すると、AI はその決定を Workflow ブループリントに書き戻し、更新された IRGraph を出力する。これにより、AI が勝手に Workflow を間違った方向へ進めるリスクが減る。

## 7. Run をクリックする

<p align="center">
  <img src="images/7-运行.png" alt="OpenWorkflows の上部 Run ボタン" width="960">
</p>
<p align="center"><em>図 7: ブループリントの準備ができたら、上部バーの Run をクリックする。</em></p>

構造、モデル設定、主要な境界が確認できたら、**Run** をクリックする。

Workflow が生成された瞬間に実行するのは避けた方がいい。まず、並列ブランチが意味をなしているか、サマリーノードがブランチの後にあるか、検証が最終結果をカバーしているかを確認する。

ノードの責任が不明確なだけなら、実行する前にラベル、プロンプト、エージェントタイプ、スキーマを編集できる。

## 8. 実行状態を見守る

<p align="center">
  <img src="images/8-运行中.png" alt="停止ボタン付きの実行状態" width="960">
</p>
<p align="center"><em>図 8: 実行中はボタンが「Running... Stop」に変わり、各ノードに状態が表示される。</em></p>

Workflow が開始されると、上部のボタンは **Running... Stop** に変わる。下部の AI 入力はロックされ、実行中にブループリントが変更されないようにする。

キャンバスにはノードのステータスが直接表示される。スクリーンショットでは、Start は完了しており、並列ノードはまだ実行中で、右上のカウンターに実行の進捗が表示されている。

これは長いログより読みやすい。何か失敗しても、プロンプト全体を捨てる必要はない。失敗したノードを見つけ、そのノードのプロンプト、モデル、入力だけを調整すればいい。

## 9. 外観テーマを切り替える

<p align="center">
  <img src="images/9-切换风格.png" alt="複数のテーマがある外観設定" width="840">
</p>
<p align="center"><em>図 9: 最終的な機能は設定 / 外観 に実装され、Pencil、Deep Night、Aurora、Daylight、Ember などから選べる。</em></p>

この例の目標は、OpenWorkflows に複数の外観テーマをサポートさせることだ。最終的なエントリーポイントは **設定 / 外観** だ。

スクリーンショットには Pencil、Deep Night、Aurora、Daylight、Ember といったテーマカードが表示されている。1 つを選ぶと、グローバルな背景、パネル、枠線、実行状態の色が変わる。

これはここでの本当のユースケースも示している。OpenWorkflows はデモ図だけのためのものではない。製品のリクエストを調査、設計、実装、検証、デリバリー追跡に分解し、各部分を適切なノードに通せる。

## 実際に役立つと思う点

OpenWorkflows の価値は、プロンプトを UI で包む以上のものだ。

リクエスト、ブループリント、スクリプト、実行、履歴レビューを接続する。自然言語でフローを生成し、キャンバスで構造を確認し、よく使うプロンプトで境界を絞り込み、その上で実行できる。

Workflow は 1 つのモデルに縛られる必要もない。単純なノードには安価なモデルを、重要なノードには強力なモデルを使い、実行対象は Claude Code、Codex、Gemini、その他のランタイムへ拡張できる。

複雑な AI コーディングタスクにとって、その構造は 1 つの巨大なプロンプトを維持するよりはるかに簡単だ。1 つのノードが失敗したら、そのノードを修正する。1 つのブランチが不要なら、それを削除する。再利用したいなら、履歴から続ける。

## Claude Code との関係

OpenWorkflows は Claude Code の代替に見えない。

Claude Code はすでに Workflow の方向性を明確にしている。複雑な作業は動的なスクリプトとして書け、複数のサブエージェント間で調整でき、バックグラウンドで実行できる。

OpenWorkflows はその方向性にビジュアルレイヤーを追加する。Workflow を描き、編集し、保存し、そして同じ構造をより多くのモデルとランタイムで試す。

だから Claude Code と対立するわけではない。Workflow のアイデアを外側へ拡張している。

## まだ初期段階だが、注目に値する

OpenWorkflows はまだ成熟していない。ランタイムアダプタ、ノード機能、スクリプトエコシステムは変わり続けるだろう。

しかし方向性は明確だ。AI コーディングは永遠に「チャットボックスを開いて手動で各ステップを押し進める」状態ではいられない。

最終的に、複雑なタスクは Workflow になる。本当の問題は、その Workflow が 1 つのツールの中に閉じ込められたままか、あるいは見えて、編集できて、移行できて、再利用できるかだ。

プロジェクト：

https://github.com/wellingfeng/OpenWorkflows

参考：

https://code.claude.com/docs/en/workflows
