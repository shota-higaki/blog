# 開発環境構築ガイド

## 動作環境

- Bun 1.2.0以上（推奨: 1.2.17）
- Git（バージョン管理用）

## セットアップ手順

### 1. リポジトリのクローン

```bash
git clone https://github.com/shota-higaki/blog.git
cd blog
```

### 2. 依存関係のインストール

```bash
bun install
```

### 3. 環境変数の設定

```bash
# .env.localファイルを作成
cp .env.local.example .env.local

# .env.localを編集してGoogle Analytics測定IDを設定
# PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

### 4. 開発サーバーの起動

```bash
bun run dev
```

ブラウザで http://localhost:4321/blog/ にアクセスして確認できます。

## 開発コマンド一覧

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

## ローカルCI

プッシュ前に品質チェックを実行することを推奨します：

```bash
bun run ci
```

このコマンドは以下を並列で実行します：
- 型チェック
- Lintチェック
- フォーマットチェック
- e2eテスト
- ビルド（他のチェックが成功した場合のみ）

## トラブルシューティング

### Bunのインストール

```bash
# macOS/Linux
curl -fsSL https://bun.sh/install | bash

# Windows (WSL推奨)
curl -fsSL https://bun.sh/install | bash
```

### ポートが使用中の場合

デフォルトポート（4321）が使用中の場合：

```bash
bun run dev -- --port 3000
```

### ビルドエラーが発生した場合

```bash
# キャッシュをクリア
rm -rf node_modules .astro
bun install
```

## VS Code推奨拡張機能

- [Astro](https://marketplace.visualstudio.com/items?itemName=astro-build.astro-vscode)
- [Biome](https://marketplace.visualstudio.com/items?itemName=biomejs.biome)
- [Tailwind CSS IntelliSense](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss)