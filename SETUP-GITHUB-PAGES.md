# GitHub Pages セットアップガイド

## リポジトリ設定

1. GitHubリポジトリの **Settings** タブを開く

2. **Pages** セクションへ移動

3. **Source** で「Deploy from a branch」を選択

4. **Branch** で`gh-pages`を選択（または適切なブランチ）

## 初回デプロイ

1. ビルドを実行
```bash
bun run build
```

2. ビルドされたファイルをGitHub Pages用ブランチにデプロイ
   - `dist`ディレクトリの内容を`gh-pages`ブランチにプッシュ
   - または、手動でビルドファイルをアップロード

3. デプロイ完了後、以下のURLでアクセス可能になります：
   ```
   https://shota-higaki.github.io/blog/
   ```

## 注意事項

- 初回デプロイには数分かかる場合があります
- プライベートリポジトリでもGitHub Pagesは使用可能です（GitHub Proアカウントが必要）

## トラブルシューティング

### ページが404エラーの場合
1. Settings → Pages で正しいSourceとBranchが選択されているか確認
2. ビルドファイルが正しくデプロイされているか確認
3. URLが正しいか確認（/blog/のパスが必要）

### ビルドエラーの場合
1. ローカルで`bun run build`を実行してエラーを確認
2. 必要な依存関係（Bun、Node.js）がインストールされているか確認
3. package.jsonの依存関係が正しくインストールされているか確認