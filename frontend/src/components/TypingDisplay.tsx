import React from "react";

interface TypingDisplayProps {
  /** 問題文（表示用） */
  questionText: string;
  /** 入力対象の文字列 */
  targetString: string;
  /** 入力済み文字列 */
  typedString: string;
  /** 現在の入力位置 */
  currentIndex: number;
  /** エラー状態 */
  hasError: boolean;
  /** ガイドを表示するか（日本語モード用） */
  showGuide?: boolean;
}

/**
 * タイピング表示コンポーネント
 * - 問題文を大きく表示
 * - 入力ガイド（薄い文字）と入力済み（濃い文字）を表示
 * - エラー時は背景を赤くフラッシュ
 */
export const TypingDisplay: React.FC<TypingDisplayProps> = ({
  questionText,
  targetString,
  typedString,
  currentIndex,
  hasError,
  showGuide = true,
}) => {
  return (
    <div
      className={`
        relative p-8 rounded-2xl transition-all duration-100
        ${hasError ? "bg-red-100 animate-shake" : "bg-white"}
        shadow-lg border-2 border-gray-200
      `}
    >
      {/* 問題文 */}
      <div className="text-center mb-8">
        <p className="text-sm text-gray-500 mb-2">問題</p>
        <h2 className="text-4xl font-bold text-gray-800">{questionText}</h2>
      </div>

      {/* 入力エリア */}
      <div className="text-center">
        <p className="text-sm text-gray-500 mb-2">入力</p>
        <div className="font-mono text-3xl tracking-wider min-h-[48px] flex justify-center items-center">
          {/* 入力済み文字（濃い青） */}
          <span className="text-blue-600">{typedString}</span>

          {/* カーソル */}
          <span className="animate-pulse text-blue-400">|</span>

          {/* 残りの文字（ガイド表示時は薄いグレー） */}
          {showGuide && (
            <span className="text-gray-300">
              {targetString.slice(currentIndex)}
            </span>
          )}
        </div>
      </div>

      {/* 進捗バー */}
      <div className="mt-6">
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 transition-all duration-150 ease-out"
            style={{
              width: `${(currentIndex / targetString.length) * 100}%`,
            }}
          />
        </div>
        <p className="text-center text-sm text-gray-500 mt-2">
          {currentIndex} / {targetString.length}
        </p>
      </div>
    </div>
  );
};
