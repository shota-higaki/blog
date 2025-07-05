# CLAUDE.md - Blog Project Configuration

このプロジェクトは個人ブログサイトです。以下の設定に従って作業を行ってください。

## プロジェクト概要

- **用途**: 個人技術ブログ
- **技術スタック**: Astro + Tailwind CSS + GitHub Pages
- **言語**: 日本語メイン

## ページ構成

- `/blog/` - ホームページ（記事一覧へリダイレクト）
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
   publishDate: 2024-07-01  # 予約投稿する場合（オプション）
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

- GitHub Actionsにより、mainブランチへのプッシュ時に自動でデプロイされます
- 本番環境でのGoogle Analytics測定IDは GitHub Secrets で管理

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

## アナリティクス

- Google Analytics 4を導入済み
- 本番環境でのみトラッキングが有効（開発環境では無効）
- 測定IDは環境変数で管理：
  - ローカル: `.env.local` の `PUBLIC_GA_MEASUREMENT_ID`
  - 本番: GitHub Secrets の `GA_MEASUREMENT_ID`

## セキュリティ

### pre-commitフック
機密情報の漏洩を防ぐため、pre-commitフックでセキュリティチェックを実行：

```bash
# 初回セットアップ（一度だけ実行）
bun run hooks:setup
```

以下の情報を検出します：
- Google Analytics ID (G-XXXXXXXXXX形式)
- APIキー
- AWS アクセスキー
- 秘密鍵

### セキュリティチェックコマンド

```bash
# 全ファイルをチェック
bun run security:check

# ステージングされたファイルのみチェック
bun run security:check --staged
```

## SEO最適化

### 実装済みの機能
- **robots.txt**: 適切なクローラー設定とsitemap参照
- **カスタムfavicon**: < & > デザインで「Code & Living」のコンセプトを表現
- **Web App Manifest**: PWA対応の基礎実装
- **Open Graph画像**: 
  - サイト全体用の静的OG画像
  - 記事ごとの動的OG画像生成（`/og/[slug].svg`）
- **JSON-LD構造化データ**: 
  - WebSite, BlogPosting, BreadcrumbList
  - Person, Organizationスキーマ
- **パフォーマンス最適化**:
  - Service Workerによるキャッシング
  - リソースヒント（dns-prefetch, preconnect）
  - 画像の遅延読み込み
  - Critical CSSのインライン化

### Service Worker
- 本番環境でのみ有効
- CSS、JS、画像ファイルを自動的にキャッシュ
- オフライン時のフォールバック対応

## 注意事項

- 記事執筆のガイドラインは[writing-guidelines.md](./docs/writing-guidelines.md)を参照してください
- パフォーマンス最適化については常に考慮し、Lighthouseスコアを維持してください
- 開発環境構築の詳細は[development-setup.md](./docs/development-setup.md)を参照してください