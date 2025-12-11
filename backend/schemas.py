from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel


class WordBase(BaseModel):
    """単語の基本スキーマ"""

    english: str
    japanese_view: str
    japanese_romaji: str


class WordCreate(WordBase):
    """単語作成用スキーマ"""

    pass


class WordSchema(WordBase):
    """単語取得用スキーマ"""

    id: int
    status: str
    next_review_at: Optional[datetime] = None
    interval: int
    mistake_count: int
    created_at: datetime

    class Config:
        from_attributes = True


class StudyResultItem(BaseModel):
    """学習結果の単一アイテム"""

    word_id: int
    is_correct: bool


class StudyResultRequest(BaseModel):
    """学習結果送信用スキーマ"""

    results: List[StudyResultItem]


class StatsResponse(BaseModel):
    """統計情報レスポンス"""

    total_words: int
    mastered_words: int
    learning_words: int
    new_words: int
    review_words: int


class UploadResponse(BaseModel):
    """CSVアップロードレスポンス"""

    imported: int
    skipped: int
    message: str
