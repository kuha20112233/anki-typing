# 🎯 TOEIC Typing Memorizer

TOEIC 頻出単語を「**Anki（分散学習）**」と「**タイピング（運動記憶）**」を組み合わせて効率的に暗記する Web アプリケーション。

「**e-typing**」のようなテンポの良い入力体験と、「**Anki**」の復習アルゴリズムを融合。

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat-square&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=flat-square&logo=react&logoColor=61DAFB)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=flat-square&logo=fastapi&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=flat-square&logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat-square&logo=docker&logoColor=white)

---

## 📸 デモ

> ※ スクリーンショットを追加予定

---

## 🏗️ システムアーキテクチャ

```mermaid
graph TB
    subgraph Client["🖥️ Client (Browser)"]
        UI[React App<br/>TypeScript + Tailwind CSS]
    end

    subgraph Docker["🐳 Docker Compose"]
        subgraph Frontend["Frontend Container"]
            VITE[Vite Dev Server<br/>:5173]
        end

        subgraph Backend["Backend Container"]
            API[FastAPI<br/>:8000]
            ORM[SQLAlchemy ORM]
        end

        subgraph Database["Database Container"]
            DB[(PostgreSQL 15<br/>:5432)]
        end
    end

    UI -->|HTTP Request| VITE
    VITE -->|API Call| API
    API --> ORM
    ORM -->|SQL| DB
```

---

## 🔄 画面遷移フロー

```mermaid
flowchart LR
    subgraph Dashboard["📊 Dashboard"]
        STATS[統計表示]
        UPLOAD[CSVアップロード]
        MODE[モード選択]
        SETTINGS[設定]
    end

    subgraph Game["🎮 Game Screen"]
        TYPING[タイピング入力]
        PROGRESS[進捗表示]
        GUIDE[ガイド表示ON/OFF]
    end

    subgraph Result["🏆 Result Screen"]
        SCORE[スコア表示]
        ACCURACY[正解率]
        TIME[所要時間]
    end

    Dashboard -->|モード選択| Game
    Game -->|全問完了| Result
    Result -->|リトライ| Game
    Result -->|トップへ| Dashboard
    Game -->|やめる| Dashboard
```

---

## 🎮 ゲームモード詳細

```mermaid
flowchart TD
    subgraph English["🇬🇧 English Mode"]
        E1[日本語を表示] --> E2[英単語を入力]
        E2 --> E3["例: 構造 → structure"]
    end

    subgraph Japanese["🇯🇵 Japanese Mode"]
        J1[英単語を表示] --> J2[ローマ字を入力]
        J2 --> J3["例: structure → kouzou"]
    end

    subgraph Double["🔄 Double Mode"]
        D1[Step 1: 日本語表示] --> D2[英単語を入力]
        D2 --> D3[Step 2: 英単語表示]
        D3 --> D4[ローマ字を入力]
    end
```

---

## 🗄️ データベース設計

```mermaid
erDiagram
    WORDS {
        int id PK "一意のID"
        string english "英単語"
        string japanese_view "表示用日本語"
        string japanese_romaji "ローマ字"
        string status "学習状態"
        datetime next_review_at "次回復習日時"
        int interval "復習間隔（日）"
        int mistake_count "ミス回数"
        datetime created_at "作成日時"
    }
```

### 学習ステータス

| Status     | 説明         |
| ---------- | ------------ |
| `new`      | 未学習       |
| `learning` | 学習中       |
| `review`   | 復習待ち     |
| `mastered` | マスター済み |

---

## ⚡ タイピングエンジン仕様

```mermaid
sequenceDiagram
    participant User as ユーザー
    participant Engine as タイピングエンジン
    participant UI as 画面

    User->>Engine: キー入力
    Engine->>Engine: 期待文字と比較

    alt 正解
        Engine->>UI: 文字を青色で表示
        Engine->>Engine: currentIndex++
        alt 最後の文字
            Engine->>UI: Auto Next（次の単語へ）
        end
    else 不正解
        Engine->>UI: 画面を赤くフラッシュ
        Engine->>Engine: エラーフラグON
        Note over Engine: 入力は受け付けない
    end
```

### 特徴

- **Character-by-Character 判定**: 1 文字ずつリアルタイム判定
- **Auto Next**: 最後の文字入力で自動的に次へ（Enter キー不要）
- **エラー時**: 不正解文字は入力されず、画面が一瞬赤くなる

---

## 📡 API エンドポイント

```mermaid
graph LR
    subgraph Study["📚 学習API"]
        GET_SESSION["GET /study/session"]
        POST_RESULT["POST /study/result"]
    end

    subgraph Words["📝 単語API"]
        POST_UPLOAD["POST /words/upload"]
        GET_WORDS["GET /words/"]
    end

    subgraph Stats["📊 統計API"]
        GET_STATS["GET /stats"]
    end
```

| Method | Endpoint         | 説明                       |
| ------ | ---------------- | -------------------------- |
| `GET`  | `/study/session` | 学習セッション用の単語取得 |
| `POST` | `/study/result`  | 学習結果の送信             |
| `POST` | `/words/upload`  | CSV アップロード           |
| `GET`  | `/words/`        | 全単語取得                 |
| `GET`  | `/stats`         | 統計情報取得               |

---

## 🔁 Anki アルゴリズム（簡易版）

```mermaid
flowchart TD
    START[回答] --> CHECK{正解?}

    CHECK -->|Yes| CORRECT[interval = interval × 2 + 1]
    CORRECT --> UPDATE_CORRECT[next_review_at = NOW + interval日]
    UPDATE_CORRECT --> STATUS_CHECK{interval >= 21?}
    STATUS_CHECK -->|Yes| MASTERED[status = mastered]
    STATUS_CHECK -->|No| LEARNING[status = learning/review]

    CHECK -->|No| WRONG[interval = 1]
    WRONG --> UPDATE_WRONG[next_review_at = NOW + 10分]
    UPDATE_WRONG --> MISTAKE[mistake_count++]
    MISTAKE --> LEARNING2[status = learning]
```

---

## 🚀 クイックスタート

### 必要要件

- Docker
- Docker Compose

### 起動方法

```bash
# リポジトリをクローン
git clone https://github.com/yourusername/anki-typing.git
cd anki-typing

# Docker Composeで起動
docker compose up --build

# バックグラウンドで起動する場合
docker compose up -d --build
```

### アクセス URL

| サービス              | URL                        |
| --------------------- | -------------------------- |
| フロントエンド        | http://localhost:5173      |
| バックエンド API Docs | http://localhost:8000/docs |

---

## 📝 使い方

1. ブラウザで http://localhost:5173 を開く
2. CSV ファイルをアップロード（`sample_words.csv` を使用可能）
3. ⚙️ 設定でガイド表示の ON/OFF を選択
4. ゲームモードを選択して開始
5. **IME は OFF にして直接入力モードでプレイ**

---

## 📁 CSV フォーマット

```csv
english,japanese_view,japanese_romaji
structure,構造,kouzou
schedule,予定,yotei
implement,実装する,jissousuru
```

| カラム            | 説明               |
| ----------------- | ------------------ |
| `english`         | 英単語             |
| `japanese_view`   | 表示用日本語       |
| `japanese_romaji` | ローマ字入力判定用 |

---

## 📂 ディレクトリ構成

```
anki-typing/
├── 📄 docker-compose.yml     # Docker Compose設定
├── 📄 .gitignore
├── 📄 README.md
├── 📄 sample_words.csv       # サンプル単語データ
│
├── 📁 backend/               # FastAPI バックエンド
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── main.py              # エントリーポイント
│   ├── database.py          # DB接続設定
│   ├── models.py            # SQLAlchemyモデル
│   ├── schemas.py           # Pydanticスキーマ
│   ├── crud.py              # DB操作
│   └── routers/
│       ├── study.py         # 学習API
│       ├── words.py         # 単語API
│       └── stats.py         # 統計API
│
└── 📁 frontend/              # React フロントエンド
    ├── Dockerfile
    ├── package.json
    ├── vite.config.ts
    ├── tailwind.config.js
    ├── tsconfig.json
    └── src/
        ├── main.tsx
        ├── App.tsx
        ├── index.css
        ├── types/           # TypeScript型定義
        │   └── index.ts
        ├── hooks/           # カスタムフック
        │   ├── useTypingEngine.ts  # タイピングエンジン
        │   ├── useApi.ts
        │   └── index.ts
        ├── components/      # UIコンポーネント
        │   ├── TypingDisplay.tsx
        │   ├── StatsCard.tsx
        │   ├── CSVUploader.tsx
        │   ├── ModeSelect.tsx
        │   ├── GameHeader.tsx
        │   └── index.ts
        └── pages/           # ページコンポーネント
            ├── Dashboard.tsx
            ├── Game.tsx
            ├── Result.tsx
            └── index.ts
```

---

## 🛠️ 技術スタック

### Frontend

- **React 18** - UI ライブラリ
- **TypeScript** - 型安全な開発
- **Vite** - 高速ビルドツール
- **Tailwind CSS** - ユーティリティファースト CSS
- **React Router** - ルーティング

### Backend

- **Python 3.11** - プログラミング言語
- **FastAPI** - 高速 API フレームワーク
- **SQLAlchemy** - ORM
- **Pydantic** - データバリデーション

### Infrastructure

- **PostgreSQL 15** - データベース
- **Docker Compose** - コンテナオーケストレーション

---

## 🔧 開発

### ローカル開発（Docker 外）

```bash
# バックエンド
cd backend
pip install -r requirements.txt
uvicorn main:app --reload

# フロントエンド
cd frontend
npm install
npm run dev
```

### コンテナ操作

```bash
# 起動
docker compose up -d

# 停止
docker compose down

# ログ確認
docker compose logs -f

# 再ビルド
docker compose up -d --build
```

---

## 📄 ライセンス

MIT License

---

## 🤝 コントリビューション

プルリクエスト歓迎です！
