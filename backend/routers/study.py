from typing import List, Literal
from fastapi import APIRouter, Depends, Query, HTTPException, Response
from sqlalchemy.orm import Session

import crud
import schemas
from database import get_db

router = APIRouter(prefix="/study", tags=["study"])


@router.get("/session", response_model=List[schemas.WordSchema])
def get_study_session(
    response: Response,
    mode: Literal["english", "japanese", "double"] = Query(
        "english", description="学習モード: english, japanese, double"
    ),
    limit: int = Query(10, ge=1, le=100, description="取得する単語数"),
    db: Session = Depends(get_db),
):
    """
    学習セッション用の単語を取得
    - next_review_at <= NOW() または status == 'new' の単語を優先して取得
    """
    response.headers["Cache-Control"] = "no-store"

    words = crud.get_words_for_study(db, mode=mode, limit=limit)
    return words


@router.post("/result", response_model=schemas.StudyResultResponse)
def submit_study_result(
    request: schemas.StudyResultRequest, db: Session = Depends(get_db)
):
    """
    学習結果を送信
    - is_correct=True: intervalを増加、next_review_atを更新
    - is_correct=False: intervalをリセット、即時復習用に設定
    """
    if not request.results:
        raise HTTPException(status_code=400, detail="results が空です")

    try:
        updated_count, missing_ids = crud.update_word_progress_batch(
            db, request.results
        )

        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"結果更新エラー: {str(e)}")

    return {
        "message": "Results submitted successfully",
        "updated_count": updated_count,
        "total_received": len(request.results),
        "missing_word_ids": missing_ids,
    }
