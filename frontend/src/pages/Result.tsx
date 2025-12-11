import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { submitStudyResult } from "../hooks/useApi";
import { GameResult } from "../types";

/**
 * 結果ページ
 * - 正解率、所要時間の表示
 * - 結果をAPIに送信
 */
export const Result: React.FC = () => {
  const navigate = useNavigate();
  const [result, setResult] = useState<GameResult | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // セッションストレージから結果を取得
    const storedResult = sessionStorage.getItem("gameResult");
    if (storedResult) {
      const parsed = JSON.parse(storedResult) as GameResult;
      setResult(parsed);

      // 結果をAPIに送信
      submitResults(parsed.results);
    } else {
      // 結果がない場合はダッシュボードへ
      navigate("/");
    }
  }, [navigate]);

  const submitResults = async (results: GameResult["results"]) => {
    setSubmitting(true);
    try {
      await submitStudyResult(results);
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "結果の送信に失敗しました");
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}分 ${remainingSeconds}秒`;
  };

  const handleRetry = () => {
    // 同じモードで再挑戦
    const lastMode = sessionStorage.getItem("lastGameMode") || "english";
    navigate(`/game/${lastMode}`);
  };

  const handleGoHome = () => {
    sessionStorage.removeItem("gameResult");
    navigate("/");
  };

  if (!result) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  // 評価メッセージ
  const getEvaluation = () => {
    if (result.accuracy >= 90) return { emoji: "🎉", message: "素晴らしい！" };
    if (result.accuracy >= 70)
      return { emoji: "👍", message: "よくできました！" };
    if (result.accuracy >= 50) return { emoji: "💪", message: "もう少し！" };
    return { emoji: "📚", message: "復習しましょう" };
  };

  const evaluation = getEvaluation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
        {/* ヘッダー */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">{evaluation.emoji}</div>
          <h1 className="text-2xl font-bold text-gray-800">
            {evaluation.message}
          </h1>
        </div>

        {/* 結果詳細 */}
        <div className="space-y-4 mb-8">
          {/* 正解率 */}
          <div className="bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl p-6 text-white text-center">
            <p className="text-sm opacity-80 mb-1">正解率</p>
            <p className="text-5xl font-bold">{result.accuracy}%</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* 正解数 */}
            <div className="bg-green-50 rounded-xl p-4 text-center">
              <p className="text-sm text-green-600 mb-1">正解</p>
              <p className="text-2xl font-bold text-green-700">
                {result.correctCount} / {result.totalWords}
              </p>
            </div>

            {/* 不正解数 */}
            <div className="bg-red-50 rounded-xl p-4 text-center">
              <p className="text-sm text-red-600 mb-1">ミス</p>
              <p className="text-2xl font-bold text-red-700">
                {result.incorrectCount}
              </p>
            </div>
          </div>

          {/* 所要時間 */}
          <div className="bg-gray-50 rounded-xl p-4 text-center">
            <p className="text-sm text-gray-600 mb-1">所要時間</p>
            <p className="text-xl font-bold text-gray-800">
              {formatTime(result.totalTime)}
            </p>
          </div>
        </div>

        {/* 送信ステータス */}
        {submitting && (
          <div className="text-center mb-4">
            <p className="text-gray-500 text-sm">結果を保存中...</p>
          </div>
        )}
        {submitted && (
          <div className="text-center mb-4">
            <p className="text-green-600 text-sm">✅ 結果を保存しました</p>
          </div>
        )}
        {error && (
          <div className="text-center mb-4">
            <p className="text-red-600 text-sm">❌ {error}</p>
          </div>
        )}

        {/* ボタン */}
        <div className="space-y-3">
          <button
            onClick={handleRetry}
            className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-xl transition-colors"
          >
            🔄 もう一度挑戦
          </button>
          <button
            onClick={handleGoHome}
            className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors"
          >
            🏠 トップへ戻る
          </button>
        </div>
      </div>
    </div>
  );
};
