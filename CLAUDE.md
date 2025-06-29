# CLAUDE.md - Blog Project Configuration

このプロジェクトは個人ブログサイトです。以下の設定に従って作業を行ってください。

## プロジェクト概要

- **用途**: 個人技術ブログ
- **技術スタック**: Astro + Tailwind CSS + GitHub Pages
- **言語**: 日本語メイン

## ページ構成

- `/blog/` - ホームページ
- `/blog/articles/` - 記事一覧ページ
- `/blog/articles/[slug]/` - 個別記事ページ
- `/blog/about/` - Aboutページ

## 開発ガイドライン

### 動作環境・バージョン管理

- **Bun**: 1.2.17（.tool-versions、package.jsonで統一）
- **Node.js**: 20.0.0以上（Bunを使用しない場合）
- 環境間でのバージョン一致を保証するため、必ず指定バージョンを使用

### コードスタイル

- **Linter/Formatter**: Biome（設定済み）
- **実行コマンド**: `bun run check` でフォーマットとlintを実行
- **エラーチェック**: `bun run check:ci` でエラーチェック

### ブランチ戦略

- `main`: 本番環境
- 新機能や記事追加時はfeatureブランチを作成してPR

### 記事の作成

1. `src/content/blog/`に新しいMarkdownファイルを作成
2. frontmatterに必須項目を記載：
   ```markdown
   ---
   title: '記事タイトル'
   description: '記事の説明'
   publishDate: 2024-06-28
   publishDate: 2024-07-01  # 予約投稿する場合
   ---
   ```

### CI/品質チェック

- **ローカルCI**: `bun run ci` で全てのチェックを並列実行
  - 型チェック、lint、フォーマット、テストを並列で実行
  - ビルドは他のチェックが成功した場合のみ実行
  - 実行時間とエラー詳細を視覚的に表示
- **CIオプション**:
  - `bun run ci --only lint,test` - 特定のタスクのみ実行
  - `bun run ci --skip test` - 特定のタスクをスキップ
  - `bun run ci --verbose` - 詳細な出力を表示
  - `bun run ci --help` - ヘルプを表示

### デプロイ

- 手動でビルドしてGitHub Pagesにデプロイ

## コマンド一覧

```bash
# 開発サーバー起動
bun run dev

# ビルド
bun run build

# プレビュー
bun run preview

# コード整形・チェック
bun run check

# フォーマットのみ
bun run format

# lintのみ
bun run lint

# 型チェック
bun run typecheck

# e2eテスト
bun run test

# CI（全チェックを並列実行）
bun run ci
```

## 注意事項

- GitHub Pagesの設定でSourceを適切に設定する必要があります