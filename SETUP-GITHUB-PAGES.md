# GitHub Pages セットアップガイド

## リポジトリ設定

1. GitHubリポジトリの **Settings** タブを開く

2. **Pages** セクションへ移動

3. **Source** で「GitHub Actions」を選択

## デプロイ方法

### 自動デプロイ（GitHub Actions）

mainブランチにプッシュすると自動的にビルドとデプロイが実行されます：

```bash
# 変更をコミットしてプッシュ
git add .
git commit -m "記事を追加"
git push origin main
```

デプロイ完了後、以下のURLでアクセス可能になります：
```
https://shota-higaki.github.io/blog/
```

## 注意事項

- 初回デプロイには数分かかる場合があります
- プライベートリポジトリでもGitHub Pagesは使用可能です（GitHub Proアカウントが必要）

## トラブルシューティング

### ページが404エラーの場合
1. Settings → Pages でSourceが「GitHub Actions」になっているか確認
2. GitHub Actionsのワークフローが正常に完了しているか確認
3. URLが正しいか確認（/blog/のパスが必要）

### ビルドエラーの場合
1. ローカルで`bun run build`を実行してエラーを確認
2. 必要な依存関係（Bun、Node.js）がインストールされているか確認
3. package.jsonの依存関係が正しくインストールされているか確認