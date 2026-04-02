from datetime import datetime, timedelta
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import or_, func, case
import models
import schemas


def get_words_for_study(
    db: Session, mode: str = "english", limit: int = 10
) -> List[models.Word]:
    """
    学習セッション用の単語を取得
    - 優先順位:
      1. status == 'new' の単語
      2. next_review_at <= NOW() の単語（復習期限が来たもの）
      3. 上記で足りない場合は、他の単語からランダムに補充
    """
    now = datetime.utcnow()
    words: List[models.Word] = []

    # 1. 復習が必要な単語を取得（new, または復習期限が来たもの）
    priority_words = (
        db.query(models.Word)
        .filter(
            or_(
                models.Word.status == "new",
                models.Word.next_review_at <= now,
                models.Word.next_review_at.is_(None),
            )
        )
        .order_by(
            # newを最優先、その後は復習期限が早い順
            case((models.Word.status == "new", 0), else_=1),
            models.Word.next_review_at.asc(),
        )
        .limit(limit)
        .all()
    )
    words.extend(priority_words)

    # 2. 足りない場合は、既に取得した単語以外からランダムに補充
    if len(words) < limit:
        existing_ids = [w.id for w in words]
        remaining = limit - len(words)

        additional_words = (
            db.query(models.Word)
            .filter(~models.Word.id.in_(existing_ids) if existing_ids else True)
            .order_by(func.random())
            .limit(remaining)
            .all()
        )
        words.extend(additional_words)

    # 3. 単語総数がlimit未満のときは重複を許可して補充
    #    （出題数指定を必ず満たすため）
    if len(words) < limit:
        all_words = db.query(models.Word).order_by(func.random()).all()
        if not all_words:
            return words

        idx = 0
        while len(words) < limit:
            words.append(all_words[idx % len(all_words)])
            idx += 1

    return words


def update_word_progress(
    db: Session, word_id: int, is_correct: bool
) -> Optional[models.Word]:
    """
    単語の学習進捗を更新（簡易Ankiアルゴリズム）
    """
    word = db.query(models.Word).filter(models.Word.id == word_id).first()
    if not word:
        print(f"[update_word_progress] Word not found: {word_id}")
        return None

    now = datetime.utcnow()

    if is_correct:
        # 正解: intervalを増加
        new_interval = word.interval * 2 + 1
        word.interval = new_interval
        word.next_review_at = now + timedelta(days=new_interval)

        # ステータス更新
        if new_interval >= 21:
            word.status = "mastered"
        elif new_interval >= 7:
            word.status = "review"
        else:
            word.status = "learning"

    else:
        # 不正解: intervalをリセット
        word.interval = 1
        word.next_review_at = now + timedelta(minutes=10)  # 10分後に再出題
        word.status = "learning"
        word.mistake_count += 1

    return word


def create_word(db: Session, word_data: schemas.WordCreate) -> models.Word:
    """新規単語を作成"""
    db_word = models.Word(**word_data.model_dump())
    db.add(db_word)
    db.commit()
    db.refresh(db_word)
    return db_word


def get_word_by_english(db: Session, english: str) -> Optional[models.Word]:
    """英単語で検索"""
    return db.query(models.Word).filter(models.Word.english == english).first()


def get_stats(db: Session) -> schemas.StatsResponse:
    """統計情報を取得（復習待ちは期限ベースで算出）"""
    now = datetime.utcnow()

    total = db.query(models.Word).count()
    mastered = db.query(models.Word).filter(models.Word.status == "mastered").count()
    learning = db.query(models.Word).filter(models.Word.status == "learning").count()
    new_words = db.query(models.Word).filter(models.Word.status == "new").count()
    review = (
        db.query(models.Word)
        .filter(
            models.Word.status != "new",
            models.Word.next_review_at.isnot(None),
            models.Word.next_review_at <= now,
        )
        .count()
    )

    return schemas.StatsResponse(
        total_words=total,
        mastered_words=mastered,
        learning_words=learning,
        new_words=new_words,
        review_words=review,
    )


def bulk_create_words(
    db: Session, words_data: List[schemas.WordCreate]
) -> tuple[int, int]:
    """
    複数単語を一括作成（重複スキップ）
    Returns: (imported_count, skipped_count)
    """
    imported = 0
    skipped = 0

    for word_data in words_data:
        existing = get_word_by_english(db, word_data.english)
        if existing:
            skipped += 1
        else:
            create_word(db, word_data)
            imported += 1

    return imported, skipped
