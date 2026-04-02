# ⌨️ TOEIC Typing Memorizer

タイピングで TOEIC 単語を効率的に暗記する Web アプリケーションです。

![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?logo=react&logoColor=black)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?logo=fastapi&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?logo=docker&logoColor=white)

## ✨ 機能

### 🎮 3 つの学習モード

| モード       | 説明                              |
| ------------ | --------------------------------- |
| **English**  | 日本語を見て英単語をタイピング    |
| **Japanese** | 英単語を見てローマ字で日本語入力  |
| **Double**   | English → Japanese の順で両方入力 |

### 📝 主な特徴

- **Auto-Next**: 最後の文字を入力すると自動で次の問題へ（Enter 不要）
- **ローマ字揺れ対応**: `shi/si`, `chi/ti`, `tsu/tu`, `fu/hu`, `ji/zi`, `nn/n` など複数の入力方式に対応
- **ガイド表示**: 入力中にローマ字ガイドを表示（ON/OFF 切替可能）
- **タイピング音**: 正解/不正解/単語完了時にサウンドフィードバック
- **学習進捗管理**: Anki ライクなスペースドリピティションアルゴリズム
- **CSV インポート**: 単語リストを CSV で一括登録

## 🚀 クイックスタート

### 必要なもの

- Docker & Docker Compose

### 起動方法

```bash
# リポジトリをクローン
git clone <repository-url>
cd anki-typing

# Docker Composeで起動
docker compose up -d

# ブラウザでアクセス
open http://localhost:5173
```

### 停止方法

```bash
docker compose down

# データも削除する場合
docker compose down -v
```

## 📊 アーキテクチャ

```
┌─────────────────────────────────────────────────────────┐
│                    Docker Compose                        │
├───────────────┬───────────────┬─────────────────────────┤
│   Frontend    │    Backend    │        Database         │
│   (React)     │   (FastAPI)   │      (PostgreSQL)       │
│   :5173       │    :8000      │         :5432           │
└───────────────┴───────────────┴─────────────────────────┘
```

## 📁 プロジェクト構造

```
anki-typing/
├── docker-compose.yml
├── sample_words.csv          # サンプル単語データ（50語）
├── frontend/
│   ├── Dockerfile
│   ├── package.json
│   └── src/
│       ├── components/       # UIコンポーネント
│       │   ├── CSVUploader.tsx
│       │   ├── GameHeader.tsx
│       │   ├── ModeSelect.tsx
│       │   ├── StatsCard.tsx
│       │   └── TypingDisplay.tsx
│       ├── pages/            # ページコンポーネント
│       │   ├── Dashboard.tsx
│       │   ├── Game.tsx
│       │   └── Result.tsx
│       ├── hooks/            # カスタムフック
│       │   ├── useApi.ts
│       │   ├── useSound.ts
│       │   └── useTypingEngine.ts
│       ├── utils/
│       │   └── romajiUtils.ts  # ローマ字揺れ対応
│       └── types/
│           └── index.ts
└── backend/
    ├── Dockerfile
    ├── requirements.txt
    ├── main.py              # FastAPIエントリーポイント
    ├── database.py          # DB接続設定
    ├── models.py            # SQLAlchemyモデル
    ├── schemas.py           # Pydanticスキーマ
    ├── crud.py              # CRUD操作
    └── routers/
        ├── words.py         # 単語API
        └── study.py         # 学習セッションAPI
```

## 📥 CSV フォーマット

単語を登録する CSV ファイルは以下の形式で作成してください：

```csv
english,japanese_view,japanese_romaji
accommodate,収容する,shuuyousuru
acknowledge,認める,mitomeru
```

| カラム            | 説明                 |
| ----------------- | -------------------- |
| `english`         | 英単語               |
| `japanese_view`   | 日本語（表示用）     |
| `japanese_romaji` | 日本語のローマ字表記 |

サンプルファイル: [sample_words.csv](./sample_words.csv)

## 🔌 API エンドポイント

### 単語管理

| Method | Endpoint        | 説明                 |
| ------ | --------------- | -------------------- |
| GET    | `/words`        | 全単語取得           |
| POST   | `/words/upload` | CSV 一括アップロード |
| GET    | `/words/stats`  | 学習統計取得         |

### 学習セッション

| Method | Endpoint         | 説明                    |
| ------ | ---------------- | ----------------------- |
| GET    | `/study/session` | 学習用単語取得（10 語） |
| POST   | `/study/result`  | 学習結果送信            |

## 🛠️ 開発

### ローカル開発（ホットリロード対応）

```bash
# Dockerコンテナ起動（開発モード）
docker compose up

# フロントエンドログ確認
docker compose logs -f frontend

# バックエンドログ確認
docker compose logs -f backend

# DBに接続
docker compose exec db psql -U postgres -d anki_typing
```

### 技術スタック

**Frontend:**

- React 18 + TypeScript
- Vite（ビルドツール）
- Tailwind CSS（スタイリング）
- React Router v6（ルーティング）
- Web Audio API（サウンド）

**Backend:**

- Python 3.11
- FastAPI
- SQLAlchemy
- PostgreSQL 15

## 📝 使い方

1. **単語を登録**: ダッシュボードで CSV ファイルをアップロード
2. **モードを選択**: English / Japanese / Double から選択
3. **タイピング開始**: 10 問のタイピングセッションが開始
4. **結果確認**: 正解率と所要時間を確認
5. **繰り返し学習**: 間違えた単語は優先的に出題されます

## ⚠️ 既知の問題

- 学習進捗の更新がダッシュボードに反映されない
- 問題が English と Japanese では 5 問、Double モードでは 10 問しか出ない(問題数は，開始前に指定できるようにしたい)

## 📄 ライセンス

MIT License
