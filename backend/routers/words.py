import csv
import io
from typing import List
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.orm import Session

import crud
import schemas
from database import get_db

router = APIRouter(prefix="/words", tags=["words"])


@router.post("/upload", response_model=schemas.UploadResponse)
async def upload_csv(file: UploadFile = File(...), db: Session = Depends(get_db)):
    """
    CSVファイルから単語をインポート
    CSV形式: english,japanese_view,japanese_romaji (ヘッダーあり)
    重複する english があればスキップし、新規のみInsert
    """
    if not file.filename.endswith(".csv"):
        raise HTTPException(
            status_code=400, detail="CSVファイルのみアップロード可能です"
        )

    try:
        content = await file.read()
        decoded = content.decode("utf-8")
        reader = csv.DictReader(io.StringIO(decoded))

        words_data: List[schemas.WordCreate] = []

        for row in reader:
            if not all(
                key in row for key in ["english", "japanese_view", "japanese_romaji"]
            ):
                raise HTTPException(
                    status_code=400,
                    detail="CSVには english, japanese_view, japanese_romaji カラムが必要です",
                )

            words_data.append(
                schemas.WordCreate(
                    english=row["english"].strip(),
                    japanese_view=row["japanese_view"].strip(),
                    japanese_romaji=row["japanese_romaji"].strip(),
                )
            )

        imported, skipped = crud.bulk_create_words(db, words_data)

        return schemas.UploadResponse(
            imported=imported,
            skipped=skipped,
            message=f"{imported}件インポート、{skipped}件スキップ（重複）",
        )

    except UnicodeDecodeError:
        raise HTTPException(
            status_code=400,
            detail="CSVファイルはUTF-8エンコーディングである必要があります",
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"インポートエラー: {str(e)}")


@router.get("/", response_model=List[schemas.WordSchema])
def get_all_words(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """すべての単語を取得"""
    from models import Word

    words = db.query(Word).offset(skip).limit(limit).all()
    return words
