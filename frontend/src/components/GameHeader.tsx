import React from "react";

interface GameHeaderProps {
  currentQuestion: number;
  totalQuestions: number;
  mode: string;
  onQuit: () => void;
  showGuide: boolean;
  onToggleGuide: () => void;
}

/**
 * ゲーム画面ヘッダーコンポーネント
 */
export const GameHeader: React.FC<GameHeaderProps> = ({
  currentQuestion,
  totalQuestions,
  mode,
  onQuit,
  showGuide,
  onToggleGuide,
}) => {
  const modeLabels: Record<string, string> = {
    english: "English Mode",
    japanese: "Japanese Mode",
    double: "Double Mode",
  };

  return (
    <div className="bg-white shadow-md px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
          {modeLabels[mode] || mode}
        </span>
        <span className="text-gray-600">
          問題:{" "}
          <span className="font-bold text-gray-800">{currentQuestion}</span> /{" "}
          {totalQuestions}
        </span>
      </div>

      <div className="flex items-center gap-4">
        {/* ガイド表示トグル */}
        <button
          onClick={onToggleGuide}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
            showGuide
              ? "bg-blue-100 text-blue-700"
              : "bg-gray-100 text-gray-500"
          }`}
          title={showGuide ? "ガイド表示: ON" : "ガイド表示: OFF"}
        >
          <span className="text-sm">👁</span>
          <span className="text-xs font-medium">
            {showGuide ? "ON" : "OFF"}
          </span>
        </button>

        <button
          onClick={onQuit}
          className="px-4 py-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          ✕ やめる
        </button>
      </div>
    </div>
  );
};
