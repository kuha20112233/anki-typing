from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

import crud
import schemas
from database import get_db

router = APIRouter(tags=["stats"])


@router.get("/stats", response_model=schemas.StatsResponse)
def get_stats(db: Session = Depends(get_db)):
    """
    学習統計情報を取得
    - total_words: 総単語数
    - mastered_words: マスター済み単語数
    - learning_words: 学習中単語数
    - new_words: 未学習単語数
    - review_words: 復習待ち単語数
    """
    return crud.get_stats(db)
