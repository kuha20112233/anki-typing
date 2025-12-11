from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime
from database import Base


class Word(Base):
    """単語データと学習進捗を管理するモデル"""

    __tablename__ = "words"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    english = Column(String, nullable=False, unique=True, index=True)
    japanese_view = Column(String, nullable=False)
    japanese_romaji = Column(String, nullable=False)
    status = Column(String, default="new")  # new, learning, review, mastered
    next_review_at = Column(DateTime, nullable=True)
    interval = Column(Integer, default=0)  # 次回までの間隔(日)
    mistake_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f"<Word(id={self.id}, english='{self.english}', status='{self.status}')>"
