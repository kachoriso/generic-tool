# Generic Tool - PvPパーティ管理アプリ

React + TypeScript + Express.js で構築されたPokémon GO PvPパーティ管理Webアプリケーションです。フロントエンドとバックエンドAPIを統合したフルスタックアプリケーションです。

## 主な機能

### 🎮 PvPパーティ管理
- パーティの作成・編集・削除
- ポケモンの技設定
- パーティ画像のアップロード・クロップ
- カスタムリーグ対応（「その他」選択でオリジナルリーグ名設定可能）

### 📊 データ管理
- PostgreSQL（Neon）データベース
- RESTful API設計
- 画像データのBase64保存

### 🎯 TODO管理
- シンプルなテキスト入力によるTODO追加
- 期限設定（オプション）
- 完了・未完了の切り替え
- 手動削除機能
- 期限切れの視覚的な表示

### 📁 グループ機能
- TODOのグルーピング
- カラーラベル付きグループ
- グループごとのTODO表示

### 📱 レスポンシブデザイン
- スマートフォン最適化
- PC・タブレット対応
- ダークモード対応

### 🔧 将来の拡張性
- ナビゲーションメニュー
- 他ツールへの拡張準備

## 技術スタック

### Frontend
- **React 19** + **TypeScript**
- **Vite** (Build Tool)
- **Material-UI (MUI)** (UI Framework)
- **React Router** (Client-side Routing)
- **React Image Crop** (画像クロップ)

### Backend
- **Express.js 4.x** (Web Framework)
- **TypeScript** (Language)
- **PostgreSQL** (Database via Neon)
- **tsx** (TypeScript Execution)

### Infrastructure
- **Render** (Deployment Platform)
- **Neon** (PostgreSQL Database)

## セットアップ

### 環境要件
- Node.js 18.0.0+
- npm 8.0.0+

### 依存関係のインストール
```bash
npm install
```

### 環境変数の設定
`.env.local`ファイルを作成して以下の環境変数を設定：

```env
DATABASE_URL=postgresql://user:password@host:port/database
PORT=3001
```

### データベースの初期化
```bash
npm run init-db
```

### 開発サーバーの起動

#### フロントエンド（Vite開発サーバー）
```bash
npm run dev
```
→ http://localhost:5173

#### バックエンド（Express.js APIサーバー）
```bash
npm run simple-server
```
→ http://localhost:3001

#### 両方同時起動（推奨）
```bash
# ターミナル1
npm run simple-server

# ターミナル2  
npm run dev
```

### プロダクションビルド
```bash
npm run build
```

### プレビュー
```bash
npm run preview
```

## Renderでのデプロイ

### サービス設定
- **Service Type**: Web Service
- **Environment**: Node.js
- **Build Command**: `npm run build`
- **Start Command**: `npm start`

### 環境変数の設定
Renderのダッシュボードで以下の環境変数を設定：

| 変数名 | 説明 | 例 |
|--------|------|-----|
| `DATABASE_URL` | PostgreSQL接続URL | `postgresql://user:pass@host/db` |
| `PORT` | サーバーポート | `10000` (Render自動設定) |
| `NODE_ENV` | 実行環境 | `production` |

### デプロイ手順
1. GitHubリポジトリをRenderに接続
2. 上記の環境変数を設定
3. 自動デプロイが開始されます

### 注意事項
- フロントエンドとバックエンドは同一のWebサービスで配信されます
- Express.jsサーバーが静的ファイル（React build）とAPIの両方を提供
- データベースはNeon PostgreSQLを使用

## API エンドポイント

### パーティ管理
- `GET /api/parties` - パーティ一覧取得
- `GET /api/parties/:id` - パーティ詳細取得
- `POST /api/parties` - パーティ作成
- `PUT /api/parties/:id` - パーティ更新
- `DELETE /api/parties/:id` - パーティ削除
- `GET /api/parties/stats/leagues` - リーグ別統計

### ヘルスチェック
- `GET /health` - サーバー状態確認
- `GET /api/test-db` - データベース接続確認

## 使用方法

### PvPパーティ管理
1. **パーティ作成**: 「新規パーティ作成」からパーティを作成
2. **リーグ選択**: プリセットリーグまたは「その他」でカスタムリーグ名を設定
3. **ポケモン設定**: 各ポケモンの技を設定（空欄でも保存可能）
4. **画像アップロード**: パーティ画像をアップロードしてクロップ
5. **保存**: パーティを保存してデータベースに永続化

### TODO管理
1. **TODO追加**: 上部の入力フィールドにテキストを入力し、「追加」ボタンをクリック
2. **期限設定**: カレンダーアイコンをクリックして期限を設定（オプション）
3. **完了切り替え**: TODOの左側のチェックボックスをクリック
4. **削除**: TODOの右側のゴミ箱アイコンをクリック
5. **グループ作成**: サイドバーの「+」ボタンからグループを作成
6. **グループ切り替え**: サイドバーでグループを選択してTODOをフィルタリング

## データ永続化

### PvPパーティデータ
- PostgreSQL（Neon）データベースに保存
- 画像データはBase64形式で保存
- トランザクション処理で整合性を保証

### TODOデータ
- ブラウザのLocal Storageに保存
- リアルタイムで自動保存
- データ形式: JSON

## 開発者向け情報

### プロジェクト構造
```
├── src/                    # フロントエンドソース
│   ├── components/         # Reactコンポーネント
│   ├── lib/               # API・データベースクライアント
│   ├── types/             # TypeScript型定義
│   └── utils/             # ユーティリティ関数
├── server/                # バックエンドソース
│   └── simple-server.ts   # Express.jsサーバー
├── database/              # データベース設定
│   └── init.sql          # スキーマ定義
├── scripts/               # スクリプト
└── dist/                  # ビルド成果物
```

### 主要なコンポーネント
- `PvpPartyRegistrationWithApi`: パーティ登録・編集フォーム
- `PartyList`: パーティ一覧表示
- `PartyDetail`: パーティ詳細表示
- `TodoList`: TODO管理

### データフロー
1. React Frontend → API Client (`src/lib/api.ts`)
2. API Client → Express.js Server (`server/simple-server.ts`)
3. Express.js → Repository Layer (`src/lib/repositories/`)
4. Repository → PostgreSQL Database

このアプリケーションは、現代的なWebアプリケーションの開発パターンを採用し、スケーラブルで保守性の高いアーキテクチャを提供します。
