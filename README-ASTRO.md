# Personal Blog

Astroで構築した個人ブログです。GitHub Actionsによる自動デプロイとGitHub Pagesでホスティングされています。

## 技術スタック

- **SSG**: [Astro](https://astro.build/) - 高速・軽量な静的サイトジェネレーター
- **CSS**: [Tailwind CSS](https://tailwindcss.com/) - ユーティリティファーストのCSSフレームワーク
- **CI/CD**: GitHub Actions - 自動ビルド・デプロイ・予約投稿
- **ホスティング**: GitHub Pages

## 機能

- 📝 Markdownによる記事執筆
- 🚀 GitHub Actionsによる自動デプロイ
- ⏰ 予約投稿機能（publishDateによる公開日時制御）
- 📱 レスポンシブデザイン
- ✅ PR時の自動チェック（フォーマット・ビルド検証）

## プロジェクト構造

```
blog/
├── src/
│   ├── content/
│   │   └── blog/      # Markdown記事
│   ├── layouts/       # レイアウトコンポーネント
│   ├── pages/         # ページコンポーネント
│   └── styles/        # グローバルスタイル
├── public/            # 静的アセット
├── .github/
│   └── workflows/     # GitHub Actionsワークフロー
├── astro.config.mjs   # Astro設定
├── tailwind.config.cjs # Tailwind CSS設定
└── package.json
```

## 開発環境のセットアップ

```bash
# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev

# 本番用ビルド
npm run build

# ビルドのプレビュー
npm run preview
```

## 記事の作成

`src/content/blog/`に新しいMarkdownファイルを作成します。

```markdown
---
title: '記事タイトル'
description: '記事の説明'
publishDate: '2024-01-01T00:00:00Z'
---

記事の内容をここに書きます。
```

## デプロイ

`main`ブランチにマージすると、GitHub Actionsが自動的にビルドしてGitHub Pagesにデプロイします。

## 予約投稿

記事のfrontmatterで`publishDate`を未来の日時に設定すると、その日時以降に自動的に公開されます。
