# CORS トラブルシューティングガイド

## 概要

このドキュメントは、DeepHand React/TypeScriptプロジェクトでCORS（Cross-Origin Resource Sharing）エラーが発生した際の診断・解決方法をまとめています。

## よくあるCORSエラー

### 1. プリフライトリクエスト失敗

**エラーメッセージ**:
```
Access to fetch at 'https://deephand-forms-production.sheegull.workers.dev/api/contact'
from origin 'https://deephandai.com' has been blocked by CORS policy:
Response to preflight request doesn't pass access control check:
No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

**原因**: フロントエンドのドメインがWorkers側のCORS設定に含まれていない

**解決方法**: [解決手順1](#solution-1)を参照

### 2. メソッド許可エラー

**エラーメッセージ**:
```
Method POST is not allowed by Access-Control-Allow-Methods in preflight response.
```

**原因**: POSTメソッドがCORS設定で許可されていない

**解決方法**: [解決手順2](#solution-2)を参照

### 3. ヘッダー許可エラー

**エラーメッセージ**:
```
Request header content-type is not allowed by Access-Control-Allow-Headers in preflight response.
```

**原因**: Content-Typeヘッダーが許可されていない

**解決方法**: [解決手順3](#solution-3)を参照

## 診断手順

### 1. ブラウザ開発者ツールでの確認

```bash
# 1. ブラウザのDevToolsを開く（F12）
# 2. Networkタブを確認
# 3. フォーム送信時のリクエストを確認
#    - OPTIONSリクエスト（プリフライト）の有無
#    - POSTリクエストの成否
#    - Response Headersの内容
```

### 2. curl コマンドでの直接テスト

```bash
# プリフライトリクエストのテスト
curl -X OPTIONS https://deephand-forms-production.sheegull.workers.dev/api/contact \
  -H "Origin: https://deephandai.com" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" \
  -v

# 期待されるレスポンスヘッダー:
# access-control-allow-origin: https://deephandai.com
# access-control-allow-methods: POST,OPTIONS
# access-control-allow-headers: Content-Type
```

```bash
# 実際のAPIリクエストのテスト
curl -X POST https://deephand-forms-production.sheegull.workers.dev/api/contact \
  -H "Content-Type: application/json" \
  -H "Origin: https://deephandai.com" \
  -d '{"name":"Test","email":"test@example.com","message":"Test"}' \
  -v
```

### 3. Workers ログの確認

```bash
# Workersのログをリアルタイムで確認
npx wrangler tail --env production

# フォーム送信時にエラーログが出力されないか確認
```

## 解決手順

### <a id="solution-1"></a>解決手順1: ドメインをCORS許可リストに追加

**ファイル**: `src/worker/index.ts`

**修正箇所**:
```typescript
// CORS設定を更新
app.use('*', cors({
  origin: [
    "https://deephandai.com",           // 本番ドメイン
    "https://www.deephandai.com",       // WWW付きバリエーション
    "https://deephand.pages.dev",       // Cloudflare Pages
    "https://deephand-web.pages.dev",   // 開発用Pages
    "http://localhost:5173",            // ローカル開発
    "http://localhost:5174",
    "http://localhost:5175",
    "http://localhost:5176"
  ],
  allowMethods: ['POST', 'OPTIONS'],
  allowHeaders: ['Content-Type'],
  maxAge: 86400,
}));
```

**デプロイ**:
```bash
npx wrangler deploy --env production
```

### <a id="solution-2"></a>解決手順2: メソッド許可の追加

**修正箇所**:
```typescript
allowMethods: ['GET', 'POST', 'OPTIONS'], // 必要なメソッドを追加
```

### <a id="solution-3"></a>解決手順3: ヘッダー許可の追加

**修正箇所**:
```typescript
allowHeaders: ['Content-Type', 'Authorization'], // 必要なヘッダーを追加
```

## 新しいドメイン追加時のチェックリスト

### 📋 フロントエンド用新ドメインを追加する場合

1. **CORS設定更新**
   - [ ] `src/worker/index.ts`のoriginリストに新ドメインを追加
   - [ ] HTTPS/HTTP両方のバリエーションを考慮
   - [ ] WWW付き/なし両方のバリエーションを考慮

2. **デプロイ**
   - [ ] `npx wrangler deploy --env production`でWorkers更新
   - [ ] デプロイ成功を確認

3. **テスト**
   - [ ] 新ドメインからフォーム送信テスト
   - [ ] ブラウザ開発者ツールでCORSエラーがないことを確認
   - [ ] curlでプリフライトリクエストテスト

4. **ドキュメント更新**
   - [ ] このファイルのドメインリストを更新
   - [ ] 他の関連ドキュメントを更新

## 設定ファイル一覧

### Workers設定
- **メインファイル**: `src/worker/index.ts`
- **CORS設定場所**: Line 〜30 (cors middleware)
- **デプロイコマンド**: `npx wrangler deploy --env production`

### フロントエンド設定
- **API設定**: `src/lib/api.ts`
- **デプロイ**: Cloudflare Pages (自動/手動)

## よくある間違い

### ❌ 間違った設定例

```typescript
// ❌ ワイルドカード使用（本番環境では非推奨）
origin: "*"

// ❌ HTTPSとHTTPの混在
origin: ["http://deephandai.com"] // HTTPSサイトからHTTP APIへのリクエスト

// ❌ 不完全なドメイン指定
origin: ["deephandai.com"] // プロトコル不明

// ❌ trailing slashの不一致
origin: ["https://deephandai.com/"] // 通常のAPIリクエストにはスラッシュは不要
```

### ✅ 正しい設定例

```typescript
// ✅ 明示的なドメイン指定
origin: [
  "https://deephandai.com",
  "https://www.deephandai.com"
]

// ✅ プロトコル明記
origin: ["https://example.com"]

// ✅ 開発環境での必要な設定
origin: [
  "https://production-domain.com",  // 本番
  "http://localhost:5173"           // 開発
]
```

## 緊急時対応

### 本番サイトが緊急でアクセスできない場合

1. **一時的なワイルドカード許可**（セキュリティリスクあり）:
   ```typescript
   origin: "*"  // 緊急時のみ使用、すぐに元に戻す
   ```

2. **即座にデプロイ**:
   ```bash
   npx wrangler deploy --env production
   ```

3. **問題解決後に厳密な設定に戻す**

## 参考情報

### CORS仕様
- [MDN CORS Documentation](https://developer.mozilla.org/ja/docs/Web/HTTP/CORS)
- [Cloudflare Workers CORS Guide](https://developers.cloudflare.com/workers/examples/cors-header-proxy/)

### Honoフレームワーク
- [Hono CORS Middleware](https://hono.dev/middleware/builtin/cors)

### プロジェクト関連
- **Workers URL**: https://deephand-forms-production.sheegull.workers.dev
- **本番サイト**: https://deephandai.com
- **開発サイト**: http://localhost:5173

---

**最終更新**: 2025年6月11日
**更新者**: Claude Code Assistant
**バージョン**: 1.0.0
