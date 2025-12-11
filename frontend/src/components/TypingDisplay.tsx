import React from "react";
import { getRemainingGuide } from "../utils/romajiUtils";

interface TypingDisplayProps {
  /** 問題文（表示用） */
  questionText: string;
  /** 入力対象の文字列（ローマ字） */
  targetString: string;
  /** 入力済み文字列 */
  typedString: string;
  /** 現在の入力位置 */
  currentIndex: number;
  /** エラー状態 */
  hasError: boolean;
  /** ガイドを表示するか */
  showGuide?: boolean;
  /** 日本語表示（ひらがな/カタカナ）- ガイド用 */
  japaneseHint?: string;
}

/**
 * タイピング表示コンポーネント
 * - 問題文を大きく表示
 * - 日本語ヒント（ひらがな）を表示
 * - 入力ガイド（薄い文字）と入力済み（濃い文字）を表示
 * - エラー時は背景を赤くフラッシュ
 */
export const TypingDisplay: React.FC<TypingDisplayProps> = ({
  questionText,
  targetString,
  typedString,
  hasError,
  showGuide = true,
  japaneseHint,
}) => {
  // 残りの文字を計算（揺れ対応）
  const remainingChars = getRemainingGuide(typedString, targetString);

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

      {/* 日本語ヒント（ローマ字入力時） */}
      {showGuide && japaneseHint && (
        <div className="text-center mb-4">
          <p className="text-2xl text-gray-600">{japaneseHint}</p>
        </div>
      )}

      {/* 入力エリア */}
      <div className="text-center">
        <p className="text-sm text-gray-500 mb-2">入力</p>
        <div className="font-mono text-3xl tracking-wider min-h-[48px] flex justify-center items-center">
          {/* 入力済み文字（濃い青） */}
          <span className="text-blue-600">{typedString}</span>

          {/* カーソル */}
          <span className="animate-pulse text-blue-400">|</span>

          {/* 残りの文字（ガイド表示時は薄いグレー） */}
          {showGuide && <span className="text-gray-300">{remainingChars}</span>}
        </div>
      </div>

      {/* 進捗バー */}
      <div className="mt-6">
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 transition-all duration-150 ease-out"
            style={{
              width: `${
                targetString.length > 0
                  ? (typedString.length /
                      (typedString.length + remainingChars.length)) *
                    100
                  : 0
              }%`,
            }}
          />
        </div>
        <p className="text-center text-sm text-gray-500 mt-2">
          {typedString.length} / {typedString.length + remainingChars.length}
        </p>
      </div>
    </div>
  );
};
