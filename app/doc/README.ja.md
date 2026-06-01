# OpenWorkflows

<div align="center">
  <a href="../../README.md">English</a> | <a href="README.zh-CN.md">中文</a> | <a href="README.fr.md">Français</a> | <a href="README.de.md">Deutsch</a> | <a href="README.es.md">Español</a> | <a href="README.pt.md">Português</a> | <a href="README.ru.md">Русский</a> | 日本語 | <a href="README.hi.md">हिन्दी</a> | <a href="README.ar.md">العربية</a>
</div>

Claude Code は、マルチエージェントのステップ、並列ブランチ、パイプラインを実行可能なスクリプトとしてオーケストレーションするための Workflow 機能を導入しました。OpenWorkflows はそのパターンを、ビジュアルなマルチモデルエディタへと変えます。1つの Workflow グラフを構築すれば、それを Claude Code、Codex、Gemini、そして将来のローカルまたはクラウドのモデルランタイム間で実行・適応できます。

共有 IR によってワークフローの構造はポータブルに保たれ、各ノードはランタイムに向き合うモデル、プロンプト、schema、実行設定を自由に選択できます。

<p align="center">
  <img src="images/0-标题使用.png" alt="OpenWorkflows エディタのスクリーンショット" width="960">
</p>

## 使い方チュートリアル

- [OpenWorkflows 使い方チュートリアル](claude-code-workflow-openworkflow.en.md) - セットアップからランタイム切り替えまでを、スクリーンショット付きで段階的に解説します。

## マルチモデル Workflow サポート

- OpenWorkflows は、Claude Code の Workflow というアイデアを単一の LLM ランタイムの枠を超えて拡張します。
- 同じ Workflow グラフをビジュアルに編集し、Claude Code、Codex、Gemini、あるいは追加のアダプタを対象にできます。
- エージェントステップ、並列ブランチ、パイプラインといった Claude Code スタイルのプリミティブが、ポータブルなグラフノードになります。
- 各ノードは、独自のプロンプト、モデルティア、schema、実行設定を持つことができます。
- スクリプトビューは現時点でグラフを実行可能な Claude Code スタイルの Workflow スクリプトへとコンパイルし、アダプタ層は他のモデルランタイムにも対応できるよう準備されています。

## なぜ OpenWorkflows なのか

- 右下の AI 入力欄に目標を記述し、編集可能な Workflow ブループリントを生成します。
- 大規模なマルチエージェントスクリプトを手作業で編集する代わりに、ビジュアルなワークフロー作成が可能です。
- 一般的なワークフローの書き換えやレビュー用プロンプトを備えた、再利用可能なプロンプトライブラリ。
- ワークスペースとセッション履歴により、以前の作業へすばやく戻れます。
- キャンバス上でノードごとの実行状態を表示する、実行/停止コントロール。
- ブラウザ側の AI アシスト向けにローカルへ API キーを保存し、マシン上にのみ保持します。

## クイックスタート

```bash
cd app
npm install
npm run dev
```

デスクトップアプリの場合:

```bash
cd app
npm run desktop
```

Windows 用リリースパッケージの場合:

```bash
cd app
npm run package
```

リポジトリのルートから、`run.bat` はアプリを起動し必要に応じて再ビルドし、`build.bat` は Windows インストーラをパッケージ化します。

## 基本的な使い方

1. 新しいワークフローを作成するか、既存のものを開きます。
2. 右下の AI 入力欄でタスクを記述します。OpenWorkflows が Workflow ブループリントを自動的に生成します。
3. 同じ入力欄に追加の指示を入力してブループリントを磨き続けるか、右パネルの一般的なプロンプトをクリックして、構造、完全性、コスト、信頼性、ロールバックを重視した編集を行います。
4. プロンプト、モデル、schema、実行パラメータを手動で編集する必要がある場合は、個々のノードを選択します。
5. Claude Code、Codex、Gemini などのランタイムアダプタを選び、必要に応じてノードのモデルを調整します。
6. 上部の Run ボタンをクリックしてワークフローを実行し、ノードごとのステータス更新を確認し、いつでも停止できます。
7. 履歴レールからセッションやワークスペースを切り替えて、以前の作業を続行します。

## プロジェクト構成

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

## その他のドキュメント

- [中国語版 README](README.zh-CN.md)
- [中国語版 使い方チュートリアル](claude-code-workflow-openworkflow.md)

## 検証

```bash
cd app
npm run typecheck
npm run lint
npm run package
```

## ライセンス

ライセンスはまだ指定されていません。
