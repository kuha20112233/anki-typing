from typing import List
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

import crud
import schemas
from database import get_db

router = APIRouter(prefix="/study", tags=["study"])


@router.get("/session", response_model=List[schemas.WordSchema])
def get_study_session(
    mode: str = Query("english", description="学習モード: english, japanese, double"),
    limit: int = Query(10, ge=1, le=50, description="取得する単語数"),
    db: Session = Depends(get_db),
):
    """
    学習セッション用の単語を取得
    - next_review_at <= NOW() または status == 'new' の単語を優先して取得
    """
    words = crud.get_words_for_study(db, mode=mode, limit=limit)
    return words


@router.post("/result")
def submit_study_result(
    request: schemas.StudyResultRequest, db: Session = Depends(get_db)
):
    """
    学習結果を送信
    - is_correct=True: intervalを増加、next_review_atを更新
    - is_correct=False: intervalをリセット、即時復習用に設定
    """
    updated_count = 0
    for item in request.results:
        word = crud.update_word_progress(db, item.word_id, item.is_correct)
        if word:
            updated_count += 1

    return {"message": "Results submitted successfully", "updated_count": updated_count}
