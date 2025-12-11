import React from "react";
import { GameMode } from "../types";

interface ModeSelectProps {
  onSelectMode: (mode: GameMode) => void;
  disabled?: boolean;
}

/**
 * ゲームモード選択コンポーネント
 */
export const ModeSelect: React.FC<ModeSelectProps> = ({
  onSelectMode,
  disabled,
}) => {
  const modes: {
    mode: GameMode;
    title: string;
    description: string;
    icon: string;
  }[] = [
    {
      mode: "english",
      title: "English Mode",
      description: "日本語を見て英単語を入力",
      icon: "🇬🇧",
    },
    {
      mode: "japanese",
      title: "Japanese Mode",
      description: "英単語を見てローマ字で日本語を入力",
      icon: "🇯🇵",
    },
    {
      mode: "double",
      title: "Double Mode",
      description: "両方を連続で入力（記憶定着）",
      icon: "🔄",
    },
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        🎮 ゲームモード選択
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {modes.map(({ mode, title, description, icon }) => (
          <button
            key={mode}
            onClick={() => onSelectMode(mode)}
            disabled={disabled}
            className={`
              p-6 rounded-xl border-2 transition-all duration-200
              ${
                disabled
                  ? "border-gray-200 bg-gray-100 cursor-not-allowed opacity-50"
                  : "border-gray-200 hover:border-blue-500 hover:bg-blue-50 hover:shadow-md cursor-pointer"
              }
            `}
          >
            <div className="text-4xl mb-3">{icon}</div>
            <h4 className="font-semibold text-gray-800 mb-1">{title}</h4>
            <p className="text-sm text-gray-500">{description}</p>
          </button>
        ))}
      </div>

      {disabled && (
        <p className="mt-4 text-center text-gray-500 text-sm">
          ⚠️ 単語をインポートしてからゲームを開始してください
        </p>
      )}
    </div>
  );
};
