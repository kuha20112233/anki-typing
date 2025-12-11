import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { StatsCard, CSVUploader, ModeSelect } from "../components";
import { getStats } from "../hooks/useApi";
import { Stats, GameMode, UploadResponse } from "../types";

/**
 * ダッシュボードページ
 * - 学習状況の表示
 * - CSVアップロード
 * - ゲームモード選択
 */
export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stats>({
    total_words: 0,
    mastered_words: 0,
    learning_words: 0,
    new_words: 0,
    review_words: 0,
  });
  const [loading, setLoading] = useState(true);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);
  const [showGuide, setShowGuide] = useState<boolean>(() => {
    const saved = localStorage.getItem("showGuide");
    return saved !== null ? JSON.parse(saved) : true;
  });

  // ガイド表示設定の保存
  const handleToggleGuide = () => {
    const newValue = !showGuide;
    setShowGuide(newValue);
    localStorage.setItem("showGuide", JSON.stringify(newValue));
  };

  const fetchStats = async () => {
    try {
      const data = await getStats();
      setStats(data);
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleUploadComplete = (result: UploadResponse) => {
    setUploadMessage(result.message);
    fetchStats(); // 統計を更新
    setTimeout(() => setUploadMessage(null), 5000);
  };

  const handleSelectMode = (mode: GameMode) => {
    navigate(`/game/${mode}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-800">
            ⌨️ TOEIC Typing Memorizer
          </h1>
          <p className="text-sm text-gray-500">
            タイピングでTOEIC単語を効率的に暗記
          </p>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-4xl mx-auto px-6 py-8 space-y-6">
        {/* 統計カード */}
        <StatsCard stats={stats} loading={loading} />

        {/* アップロード成功メッセージ */}
        {uploadMessage && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
            <p className="text-green-700">✅ {uploadMessage}</p>
          </div>
        )}

        {/* CSVアップローダー */}
        <CSVUploader onUploadComplete={handleUploadComplete} />

        {/* モード選択 */}
        <ModeSelect
          onSelectMode={handleSelectMode}
          disabled={stats.total_words === 0}
        />

        {/* 設定 */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">⚙️ 設定</h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-700">答えのガイド表示</p>
              <p className="text-sm text-gray-500">
                入力すべき文字を薄く表示します
              </p>
            </div>
            <button
              onClick={handleToggleGuide}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                showGuide ? "bg-blue-500" : "bg-gray-300"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  showGuide ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </div>

        {/* IME注意 */}
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
          <p className="text-yellow-800 text-sm">
            ⚠️ <strong>IME（日本語入力）はOFFにしてください。</strong>
            直接入力モードでプレイしてください。
          </p>
        </div>
      </main>
    </div>
  );
};
