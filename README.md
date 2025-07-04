# Personal Blog

Astroで構築した個人ブログです。GitHub Pagesでホスティングされています。

## 技術スタック

- **SSG**: [Astro](https://astro.build/) - 高速・軽量な静的サイトジェネレーター
- **CSS**: [Tailwind CSS](https://tailwindcss.com/) - ユーティリティファーストのCSSフレームワーク
- **Linter/Formatter**: [Biome](https://biomejs.dev/) - 高速なコード品質ツール
- **ホスティング**: GitHub Pages

## 機能

- 📝 Markdownによる記事執筆
- ⏰ 予約投稿機能（publishDateによる公開日時制御）
- 📱 レスポンシブデザイン
- ⚡ ローカルCIによる品質チェック（並列実行）

## 動作環境

- Bun 1.2.0以上（推奨: 1.2.17）
- Git（バージョン管理用）

## セットアップ

### 1. 依存関係のインストール

```bash
bun install
```

### 2. 開発サーバーの起動

```bash
bun run dev
```


## 記事の作成

`src/content/blog/`に新しいMarkdownファイルを作成します。

```markdown
---
title: '記事タイトル'
description: '記事の説明'
publishDate: 2024-06-28
publishDate: 2024-07-01  # 予約投稿の場合（オプション）
---

記事の内容をここに書きます。
```

## URL構造

- `/blog/` - ホームページ（記事一覧へリダイレクト）
- `/blog/articles/` - 記事一覧
- `/blog/articles/[slug]/` - 個別記事

## コマンド一覧

| コマンド | 説明 |
|---------|------|
| `bun run dev` | 開発サーバーを起動 |
| `bun run build` | 本番用ビルド |
| `bun run preview` | ビルドのプレビュー |
| `bun run check` | Biomeでコード整形・チェック |
| `bun run check:ci` | CI用のチェック（エラー時に失敗） |
| `bun run format` | コードフォーマット |
| `bun run lint` | Lintチェック |
| `bun run typecheck` | 型チェック |
| `bun run test` | e2eテスト実行 |
| `bun run ci` | 全チェックを並列実行（プッシュ前推奨） |

## デプロイ

GitHub Actionsにより、mainブランチへのプッシュ時に自動でデプロイされます。

## 予約投稿

記事のfrontmatterで`publishDate`を未来の日時に設定すると、その日時以降に公開されます。

## プロジェクト構造

```
blog/
├── src/
│   ├── content/
│   │   └── blog/          # Markdown記事
│   ├── layouts/           # レイアウトコンポーネント
│   ├── pages/             # ページコンポーネント
│   ├── components/        # 共通コンポーネント
│   └── styles/            # グローバルスタイル
├── public/                # 静的アセット
├── scripts/               # ユーティリティスクリプト
│   └── ci.ts             # ローカルCIスクリプト
├── tests/                 # e2eテスト
├── astro.config.mjs       # Astro設定
├── biome.json            # Biome設定
├── tailwind.config.mjs    # Tailwind CSS設定
└── package.json