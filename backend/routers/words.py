import csv
import io
from typing import List
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.orm import Session

import crud
import schemas
from database import get_db

router = APIRouter(prefix="/words", tags=["words"])


def _normalize_csv_value(value: str | None) -> str:
    if value is None:
        return ""
    return value.strip().lstrip("\ufeff")


def _parse_words_csv(decoded: str) -> List[schemas.WordCreate]:
    """
    単語CSVをパースする。

    japanese_romaji にカンマが含まれるケースに対応するため、
    3列目以降はすべて japanese_romaji として結合する。
    """
    reader = csv.reader(io.StringIO(decoded))

    try:
        header = next(reader)
    except StopIteration:
        raise HTTPException(status_code=400, detail="CSVファイルが空です")

    normalized_header = [_normalize_csv_value(column).strip('"') for column in header]
    expected_header = ["english", "japanese_view", "japanese_romaji"]

    if normalized_header != expected_header:
        raise HTTPException(
            status_code=400,
            detail="CSVのヘッダーは english,japanese_view,japanese_romaji である必要があります",
        )

    words_data: List[schemas.WordCreate] = []

    for line_number, row in enumerate(reader, start=2):
        if not row or all(not cell.strip() for cell in row):
            continue

        if len(row) < 3:
            raise HTTPException(
                status_code=400,
                detail=f"{line_number}行目の列数が不足しています。english, japanese_view, japanese_romaji の3列が必要です",
            )

        english = _normalize_csv_value(row[0])
        japanese_view = _normalize_csv_value(row[1])
        japanese_romaji = ",".join(row[2:]).strip()

        if not english or not japanese_view or not japanese_romaji:
            raise HTTPException(
                status_code=400,
                detail=f"{line_number}行目に空欄があります",
            )

        words_data.append(
            schemas.WordCreate(
                english=english,
                japanese_view=japanese_view,
                japanese_romaji=japanese_romaji,
            )
        )

    if not words_data:
        raise HTTPException(status_code=400, detail="CSVに登録対象のデータがありません")

    return words_data


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
        decoded = content.decode("utf-8-sig")
        words_data = _parse_words_csv(decoded)

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
    except csv.Error:
        raise HTTPException(status_code=400, detail="CSVの形式を読み取れませんでした")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"インポートエラー: {str(e)}")


@router.get("/", response_model=List[schemas.WordSchema])
def get_all_words(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """すべての単語を取得"""
    from models import Word

    words = db.query(Word).offset(skip).limit(limit).all()
    return words
