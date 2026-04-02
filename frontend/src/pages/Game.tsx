import React, { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { GameHeader, TypingDisplay } from "../components";
import { useTypingEngine, useSound, getStudySession } from "../hooks";
import { Word, GameMode, StudyResultItem, GameResult } from "../types";

/**
 * ゲームページ
 * - タイピングゲームのメインロジック
 * - Auto-Next機能実装
 */
export const Game: React.FC = () => {
  const { mode } = useParams<{ mode: GameMode }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const questionCount = Math.min(
    Math.max(Number(searchParams.get("questions")) || 10, 1),
    100
  );

  useEffect(() => {
    if (mode) {
      sessionStorage.setItem("lastGameMode", mode);
      sessionStorage.setItem("lastQuestionCount", String(questionCount));
    }
  }, [mode, questionCount]);

  const { playTypeSound, playErrorSound, playWordCompleteSound } = useSound();

  const [words, setWords] = useState<Word[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [gameComplete, setGameComplete] = useState(false);
  const [doubleStep, setDoubleStep] = useState<"english" | "japanese">(
    "english"
  );
  const [showGuide, setShowGuide] = useState<boolean>(() => {
    const saved = localStorage.getItem("showGuide");
    return saved !== null ? JSON.parse(saved) : true;
  });
  const startTimeRef = useRef<number>(Date.now());
  const wordStartTimeRef = useRef<number>(Date.now());
  const resultsRef = useRef<StudyResultItem[]>([]);
  const processedStepKeysRef = useRef<Set<string>>(new Set());

  const currentWord = words[currentWordIndex];

  // モードに応じた問題文と入力対象を決定
  const getQuestionAndTarget = useCallback((): {
    question: string;
    target: string;
    japaneseHint?: string;
  } => {
    if (!currentWord) return { question: "", target: "" };

    if (mode === "english") {
      return {
        question: currentWord.japanese_view,
        target: currentWord.english,
      };
    } else if (mode === "japanese") {
      return {
        question: currentWord.english,
        target: currentWord.japanese_romaji,
        japaneseHint: currentWord.japanese_view, // 日本語ヒントを追加
      };
    } else if (mode === "double") {
      if (doubleStep === "english") {
        return {
          question: currentWord.japanese_view,
          target: currentWord.english,
        };
      } else {
        return {
          question: currentWord.english,
          target: currentWord.japanese_romaji,
          japaneseHint: currentWord.japanese_view, // 日本語ヒントを追加
        };
      }
    }

    return { question: "", target: "" };
  }, [currentWord, mode, doubleStep]);

  const { question, target, japaneseHint } = getQuestionAndTarget();

  // 単語完了時のコールバック
  const handleWordComplete = useCallback(
    (hasError: boolean) => {
      if (!currentWord) return;

      const stepKey =
        mode === "double"
          ? `${currentWordIndex}:${doubleStep}`
          : `${currentWordIndex}:single`;

      // 同一問題・同一ステップの二重完了を防止
      if (processedStepKeysRef.current.has(stepKey)) {
        return;
      }
      processedStepKeysRef.current.add(stepKey);

      // DoubleモードのStep1は記録せずStep2へ
      if (mode === "double" && doubleStep === "english") {
        setDoubleStep("japanese");
        return;
      }

      const currentResult: StudyResultItem = {
        word_id: currentWord.id,
        is_correct: !hasError,
      };
      const nextResults = [...resultsRef.current, currentResult];
      resultsRef.current = nextResults;

      // DoubleモードStep2完了時は次単語を英語ステップから開始
      if (mode === "double") {
        setDoubleStep("english");
      }

      // 次の単語へ、または結果画面へ
      if (currentWordIndex < words.length - 1) {
        playWordCompleteSound();
        setCurrentWordIndex(currentWordIndex + 1);
        wordStartTimeRef.current = Date.now();
        return;
      }

      // 全問終了 -> 結果画面へ
      const totalTime = Date.now() - startTimeRef.current;
      const correctCount = nextResults.filter((r) => r.is_correct).length;
      const incorrectCount = nextResults.length - correctCount;
      const totalWords = words.length;
      const gameResult: GameResult = {
        totalWords,
        correctCount: Math.min(correctCount, totalWords),
        incorrectCount: Math.min(incorrectCount, totalWords),
        totalTime,
        accuracy:
          totalWords > 0
            ? Math.round(
                (Math.min(correctCount, totalWords) / totalWords) * 100
              )
            : 0,
        results: nextResults,
      };

      sessionStorage.setItem("gameResult", JSON.stringify(gameResult));
      playWordCompleteSound();
      setGameComplete(true);
      navigate("/result");
    },
    [
      currentWord,
      mode,
      doubleStep,
      currentWordIndex,
      words.length,
      navigate,
      playWordCompleteSound,
    ]
  );

  // タイピングエンジン
  const { state, handleKeyDown, reset } = useTypingEngine({
    targetString: target,
    onComplete: handleWordComplete,
    onCorrectKey: playTypeSound,
    onErrorKey: playErrorSound,
  });

  // 問題切り替え時は同じ文字列でも必ず入力状態をリセット
  useEffect(() => {
    if (!target) return;
    reset(target);
  }, [target, currentWordIndex, doubleStep, reset]);

  // 単語の取得
  useEffect(() => {
    const fetchWords = async () => {
      try {
        const data = await getStudySession(mode as GameMode, questionCount);
        if (data.length === 0) {
          alert("学習する単語がありません。ダッシュボードに戻ります。");
          navigate("/");
          return;
        }
        setWords(data);
        resultsRef.current = [];
        setCurrentWordIndex(0);
        setDoubleStep("english");
        setGameComplete(false);
        processedStepKeysRef.current = new Set();
        startTimeRef.current = Date.now();
        wordStartTimeRef.current = Date.now();
      } catch (error) {
        console.error("Failed to fetch words:", error);
        alert("単語の取得に失敗しました");
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    fetchWords();
  }, [mode, navigate, questionCount]);

  // キーボードイベントのリスナー
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      // ゲーム完了時はキー入力を無視
      if (gameComplete) return;
      handleKeyDown(e);
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [handleKeyDown, gameComplete]);

  // やめるボタン
  const handleQuit = () => {
    if (confirm("ゲームを中断しますか？")) {
      navigate("/");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-4" />
          <p className="text-gray-600">単語を読み込み中...</p>
        </div>
      </div>
    );
  }

  // ゲーム完了時の表示（遷移中）
  if (gameComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🎉</div>
          <p className="text-xl text-gray-700">全問完了！結果画面へ移動中...</p>
        </div>
      </div>
    );
  }

  // 単語がない場合のガード
  if (words.length === 0 || !currentWord) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-700">単語がありません</p>
          <button
            onClick={() => navigate("/")}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            ダッシュボードに戻る
          </button>
        </div>
      </div>
    );
  }

  // ガイド表示のトグル
  const handleToggleGuide = () => {
    const newValue = !showGuide;
    setShowGuide(newValue);
    localStorage.setItem("showGuide", JSON.stringify(newValue));
  };

  // Double modeの進捗表示用
  const displayedQuestion =
    mode === "double"
      ? currentWordIndex * 2 + (doubleStep === "english" ? 1 : 2)
      : currentWordIndex + 1;
  const totalQuestions = mode === "double" ? words.length * 2 : words.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col">
      <GameHeader
        currentQuestion={displayedQuestion}
        totalQuestions={totalQuestions}
        mode={mode || "english"}
        onQuit={handleQuit}
        showGuide={showGuide}
        onToggleGuide={handleToggleGuide}
      />

      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-2xl">
          {/* Doubleモードのステップ表示 */}
          {mode === "double" && (
            <div className="text-center mb-4">
              <span
                className={`px-3 py-1 rounded-full text-sm ${
                  doubleStep === "english"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                Step 1: 英語入力
              </span>
              <span className="mx-2">→</span>
              <span
                className={`px-3 py-1 rounded-full text-sm ${
                  doubleStep === "japanese"
                    ? "bg-green-500 text-white"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                Step 2: ローマ字入力
              </span>
            </div>
          )}

          <TypingDisplay
            questionText={question}
            targetString={target}
            typedString={state.typedString}
            currentIndex={state.currentIndex}
            hasError={state.hasError}
            showGuide={showGuide}
            japaneseHint={japaneseHint}
          />

          {/* IME警告 */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              💡 IME（日本語入力）はOFFにしてください
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};
