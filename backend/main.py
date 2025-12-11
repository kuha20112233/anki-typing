from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import engine, Base
from routers import study, words, stats

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="TOEIC Typing Memorizer API",
    description="TOEIC頻出単語をタイピングで覚えるアプリのAPI",
    version="1.0.0",
)

# CORS設定
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ルーターを登録
app.include_router(study.router)
app.include_router(words.router)
app.include_router(stats.router)


@app.get("/")
def root():
    return {"message": "TOEIC Typing Memorizer API", "docs": "/docs"}


@app.get("/health")
def health_check():
    return {"status": "healthy"}
