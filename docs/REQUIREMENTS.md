# DeepHand データアノテーション請負事業 要件定義書

## プロジェクト概要
DeepHand社が提供するロボティクス向けデータアノテーションサービスのWebサイト。お問い合わせフォームとデータリクエストフォームを実装し、日本語・英語の2言語対応を行うモダンなSingle Page Application。

## 技術スタック（現在実装済み）

### フロントエンド
- **フレームワーク**: React 18.2.0 + TypeScript
- **ビルドツール**: Vite 6.0.4
- **UIライブラリ**: Shadcn/ui + Radix UI primitives
- **スタイリング**: TailwindCSS 3.4.16 + カスタムデザインシステム
- **フォーム管理**: React Hook Form 7.51.0 + Zod validation
- **国際化**: i18next 23.10.1 + react-i18next + browser language detector
- **アイコン**: Lucide React
- **ホスティング**: Cloudflare Pages

### バックエンド
- **ランタイム**: Cloudflare Workers
- **フレームワーク**: Hono 4.7.9
- **メール送信**: Cloudflare Email Workers (NOTIFY binding)
- **データ保存**: Cloudflare R2 buckets
- **レート制限**: Cloudflare KV storage
- **分析**: Cloudflare Analytics Engine
- **バリデーション**: Zod schema validation
- **セキュリティ**: HTML entity sanitization, CORS, secure headers

### カスタムデザインシステム
- **メインフォント**: Alliance No.2 font family (Light, Regular, Medium, SemiBold, Bold, ExtraBold, Black)
- **カラーパレット**: ダークテーマ (#1e1e1e背景 + #234ad9アクセント)
- **コンポーネント**: Radix UI primitives ベースのカスタムコンポーネント

## アプリケーション構成（現在実装済み）

### アーキテクチャ
- **アプリケーション形式**: Single Page Application (SPA)
- **ナビゲーション**: React state-based routing with History API
- **ページ構成**: 
  - Hero section with contact form (default view)
  - Data request form page (request view)
- **レスポンシブ**: モバイルファーストデザイン

### 言語対応（実装済み）
- **サポート言語**: 日本語（ja）・英語（en）
- **切り替え方式**: ヘッダーのトグルボタン
- **言語検出**: ブラウザの言語設定に基づく自動検出
- **翻訳カバレッジ**: UI要素、フォームラベル、プレースホルダー、バリデーションメッセージ、成功/エラーメッセージ

## フォーム仕様（実装済み・動作要修正）

### 1. お問い合わせフォーム (Hero Section)
| 項目名 | 必須/任意 | 入力タイプ | バリデーション | 文字数制限 | 実装状況 |
|--------|-----------|------------|----------------|------------|----------|
| お名前 / Name | 必須 | 短文入力 | 空欄チェック | なし | ✅ 実装済み |
| ご所属 / Organization | 任意 | 短文入力 | なし | なし | ✅ 実装済み |
| メールアドレス / Email | 必須 | email入力 | メール形式チェック | なし | ✅ 実装済み |
| お問い合わせ内容 / Message | 必須 | 長文入力 | 空欄チェック | なし | ✅ 実装済み |

**フォーム機能:**
- ✅ UI実装完了
- ✅ リアルタイムバリデーション（Zod schema）
- ✅ 送信中ローディング状態
- ✅ 成功/エラーメッセージ表示
- ✅ 送信後フォームリセット
- ❌ **問題**: フォーム送信が機能しない
- **エンドポイント**: `POST /api/contact`

### 2. データリクエストフォーム (Request Page)
| 項目名 | 必須/任意 | 入力タイプ | バリデーション | 文字数制限 | 実装状況 |
|--------|-----------|------------|----------------|------------|----------|
| お名前 / Name | 必須 | 短文入力 | 空欄チェック | 100文字 | ✅ 実装済み |
| ご所属 / Organization | 任意 | 短文入力 | なし | 100文字 | ✅ 実装済み |
| メールアドレス / Email | 必須 | email入力 | メール形式チェック | 100文字 | ✅ 実装済み |
| ご依頼の背景や目的 / Background and Purpose | 必須 | 長文入力 | 空欄チェック | 1000文字 | ✅ 実装済み |
| 必要なデータ種別 / Data Type | 必須 | チェックボックス | 最低1つ選択 | - | ✅ 実装済み |
| データの詳細 / Data Details | 任意 | 長文入力 | なし | 1000文字 | ✅ 実装済み |
| 必要なデータ量 / Data Volume | 必須 | 長文入力 | 空欄チェック | 500文字 | ✅ 実装済み |
| ご希望の納期 / Deadline | 必須 | 長文入力 | 空欄チェック | 500文字 | ✅ 実装済み |
| ご予算目安 / Budget | 必須 | 長文入力 | 空欄チェック | 500文字 | ✅ 実装済み |
| その他、詳細やご要望 / Other Requirements | 任意 | 長文入力 | なし | 1000文字 | ✅ 実装済み |

#### データ種別の選択肢（実装済み）
- **テキスト / Text** ✅
- **画像 / Image** ✅
- **動画 / Video** ✅
- **音声 / Audio** ✅
- **その他 / Other**（選択時にテキスト入力フィールド表示）✅

**フォーム機能:**
- ✅ UI実装完了
- ✅ チェックボックスベースのデータ種別選択
- ✅ 条件付きバリデーション表示
- ✅ 文字数制限付きフィールド
- ✅ 配列データの処理（データ種別）
- ❌ **問題**: フォーム送信が機能しない
- **エンドポイント**: `POST /api/request-data`

## バックエンド API 仕様（実装済み・動作要修正）

### Worker エンドポイント
**ベースURL**: `https://deephand-forms.workers.dev`
**実装状況**: ✅ コード実装済み / ❌ 動作確認要

#### 1. POST /api/contact
**リクエスト例:**
```json
{
  "name": "富士 太郎",
  "organization": "ロボティクス株式会社",
  "email": "taro@example.com",
  "message": "お問い合わせ内容"
}
```

#### 2. POST /api/request-data
**リクエスト例:**
```json
{
  "name": "富士 太郎",
  "organization": "ロボティクス株式会社", 
  "email": "taro@example.com",
  "backgroundPurpose": "ロボットの学習データとして使用予定",
  "dataType": ["text", "image", "other: 音響データ"],
  "dataDetails": "具体的なデータの詳細",
  "dataVolume": "1万件程度",
  "deadline": "2024年12月末まで",
  "budget": "100万円程度",
  "otherRequirements": "その他のご要望"
}
```

### セキュリティ機能（実装済み）
- ✅ **入力サニタイゼーション**: HTML entity encoding
- ✅ **レート制限**: 10リクエスト/時間/IP
- ✅ **バリデーション**: Zod schema による型安全なバリデーション
- ✅ **CORS設定**: 本番・開発環境対応
- ✅ **セキュアヘッダー**: Hono middleware適用

## メール送信仕様（実装済み・動作要確認）

### 送信システム
- **サービス**: Cloudflare Email Workers (NOTIFY binding)
- **ライブラリ**: mimetext 3.0.27
- **送信先**: contact@deephandai.com
- **実装状況**: ✅ コード実装済み / ❌ 動作確認要

### メールテンプレート（実装済み）

#### お問い合わせフォーム用
```
件名: 新しいお問い合わせ - DeepHand

お名前: {name}
ご所属: {organization || 'N/A'}
メールアドレス: {email}
お問い合わせ内容: {message}
```

#### データリクエストフォーム用
```
件名: 新しいデータリクエスト - DeepHand

お名前: {name}
ご所属: {organization || 'N/A'}
メールアドレス: {email}
ご依頼の背景や目的: {backgroundPurpose}
必要なデータ種別: {dataType.join(', ')}
データの詳細: {dataDetails || 'N/A'}
必要なデータ量: {dataVolume}
ご希望の納期: {deadline}
ご予算目安: {budget}
その他、詳細やご要望: {otherRequirements || 'N/A'}
```

## UI/UX 仕様（実装済み）

### ナビゲーション ✅
- **ヘッダー**: 固定ヘッダー (logo + navigation + language toggle + action buttons)
- **ロゴクリック**: トップページ (Hero section) に戻る
- **言語切替**: ヘッダー右上のトグルボタン
- **レスポンシブメニュー**: モバイル時はハンバーガーメニュー

### フォーム UX ✅
- **リアルタイムバリデーション**: フィールド変更時の即座な検証
- **ローディング状態**: 送信中のスピナー + ボタン無効化
- **成功フィードバック**: 緑色の成功メッセージ
- **エラーハンドリング**: 赤色のエラーメッセージ + フィールド枠線
- **フォーカス管理**: アクセシビリティ対応

### 視覚的デザイン ✅
- **メインカラー**: #1e1e1e (背景), #234ad9 (アクセント)
- **フォント**: Alliance No.2 (Light, Regular, Medium, SemiBold)
- **コンポーネント**: 角丸デザイン + ソフトシャドウ
- **入力フィールド**: 半透明背景 + アウトライン

## コンポーネント構成（実装済み）

### UIコンポーネント (/src/components/ui/) ✅
- **Button**: アクション用ボタン (variant: default, outline)
- **Card**: コンテンツカード (CardHeader, CardContent, CardDescription)
- **Input**: テキスト入力フィールド
- **Textarea**: 長文入力エリア
- **Label**: フォームラベル
- **Checkbox**: チェックボックス (Radix UI ベース)
- **NavigationMenu**: レスポンシブナビゲーション
- **LanguageToggle**: 言語切替トグルボタン

### ページコンポーネント (/src/screens/Frame/sections/) ✅
- **HeroSectionByAnima**: メインページ + お問い合わせフォーム
- **RequestDataPageByAnima**: データリクエストフォームページ

### ユーティリティ (/src/lib/) ✅
- **schema.ts**: Zod バリデーションスキーマ
- **utils.ts**: Tailwind クラス結合ユーティリティ
- **analytics.ts**: Cloudflare Analytics連携
- **i18n/**: 国際化設定とロケールファイル

## 修正が必要な問題点

### 高優先度の問題 🚨
1. **フォーム送信機能が動作しない**
   - お問い合わせフォームの送信が機能しない
   - データリクエストフォームの送信が機能しない
   - APIエンドポイントへの接続確認が必要

2. **Cloudflare Workers設定確認要**
   - Workers の環境変数設定
   - Email Workers (NOTIFY) binding設定
   - R2 buckets binding設定
   - KV namespace binding設定
   - Analytics Engine binding設定

3. **API エンドポイント動作確認要**
   - `/api/contact` エンドポイントの動作テスト
   - `/api/request-data` エンドポイントの動作テスト
   - メール送信機能の動作確認

### 中優先度の改善項目
1. **プライバシーポリシーページ未実装**
2. **ユーザー自動返信メール未実装**
3. **言語設定永続化** (localStorage保存)

### 低優先度の改善項目
1. **SEO最適化**: メタタグ、構造化データ
2. **パフォーマンス最適化**: 画像最適化、コード分割
3. **アクセシビリティ改善**: WCAG 2.1 AA準拠
4. **スパム対策**: reCAPTCHA v3 導入検討

## デプロイメント環境

### 本番環境設定
- **フロントエンド**: Cloudflare Pages (自動デプロイ) ✅
- **バックエンド**: Cloudflare Workers (`deephand-forms.workers.dev`) ❌ 要設定確認
- **ドメイン**: deephand.pages.dev ✅

### 必要なCloudflare Bindings（要設定確認）
```toml
[env.production]
name = "deephand-forms"

[[env.production.bindings]]
name = "NOTIFY"
service = "email"

[[env.production.r2_buckets]]
binding = "SUBMISSIONS" 
bucket_name = "deephand-form-submissions"

[[env.production.analytics_engine_datasets]]
binding = "FORM_ANALYTICS"
dataset = "deephand_forms"

[[env.production.kv_namespaces]]
binding = "IP_RATE_LIMITER"
id = "your-kv-namespace-id"
```

## 開発・ビルド構成（実装済み）

### パッケージスクリプト ✅
```json
{
  "dev": "vite",
  "build": "vite build", 
  "worker:dev": "wrangler dev",
  "worker:deploy": "wrangler deploy"
}
```

### 主要依存関係 ✅
```json
{
  "react": "^18.2.0",
  "react-hook-form": "^7.51.0",
  "zod": "^3.22.4",
  "i18next": "^23.10.1",
  "hono": "^4.7.9",
  "@radix-ui/react-checkbox": "^1.3.2",
  "tailwindcss": "3.4.16",
  "vite": "6.0.4"
}
```

## 修正実装タスク

### 最優先タスク（フォーム機能修復）
1. **Cloudflare Workers環境設定確認**
   - wrangler.toml の設定確認
   - 環境変数とbindingの設定
   - Workers deploymentの確認

2. **API エンドポイント接続修正**
   - フロントエンドからWorkerへの接続確認
   - CORS設定の確認
   - エラーハンドリングの改善

3. **メール送信機能確認**
   - Email Workers設定確認
   - NOTIFY binding動作確認
   - テストメール送信

4. **フォーム送信フロー修正**
   - バリデーション → API call → レスポンス処理
   - エラー状態の適切な表示
   - 成功時のフィードバック改善

### 中期実装タスク
1. **プライバシーポリシーページ実装**
2. **ユーザー自動返信メール実装**
3. **言語設定永続化実装**

## テスト要件

### 機能テスト（修正後実施）
- [ ] 日本語・英語言語切替の動作確認 ✅
- [ ] お問い合わせフォームの送信とバリデーション ❌
- [ ] データリクエストフォームの送信とチェックボックス動作 ❌
- [ ] メール送信確認 (contact@deephandai.com) ❌
- [ ] レスポンシブデザインの表示確認 ✅
- [ ] エラーハンドリングの動作確認 ❌

### セキュリティテスト（修正後実施）
- [ ] レート制限の動作確認 (10req/hour/IP) ❌
- [ ] 入力値サニタイゼーション確認 ❌
- [ ] XSS攻撃防止確認 ❌
- [ ] CORS設定確認 ❌

### パフォーマンステスト
- [ ] ページロード時間測定 ✅
- [ ] モバイル環境での表示確認 ✅
- [ ] フォーム送信レスポンス時間確認 ❌
- [ ] Cloudflare Analytics動作確認 ❌

## 現状まとめ

**実装済み機能:**
- ✅ React/TypeScript SPA完全実装
- ✅ レスポンシブデザイン
- ✅ 国際化（日英対応）
- ✅ フォームUI・バリデーション
- ✅ Cloudflare Workers API コード
- ✅ セキュリティ機能コード

**動作しない機能:**
- ❌ フォーム送信（最重要）
- ❌ メール送信
- ❌ API接続

**未実装機能:**
- ❌ プライバシーポリシーページ
- ❌ ユーザー自動返信メール

現在のアプリケーションは、UI/UXとコード実装は完成度が高いが、バックエンド接続部分の修正が必要な状況です。

## プライバシーポリシー内容（実装予定）

### 個人情報保護方針
株式会社DeepHand（以下「当社」）は、お客様の個人情報保護の重要性を認識し、以下の方針に基づき個人情報の保護に努めます。

1. **個人情報の定義**
   - 氏名、メールアドレス、会社名等、個人を識別できる情報

2. **個人情報の収集目的**
   - お問い合わせへの回答
   - サービスに関する情報提供
   - サービスの品質向上

3. **個人情報の管理**
   - 適切な安全対策を実施
   - 不正アクセス、紛失、破損、改ざん、漏洩の防止

4. **個人情報の第三者提供**
   - 法令に基づく場合を除き、第三者への提供なし

5. **お問い合わせ窓口**
   - contact@deephandai.com