import React from "react";
import { Stats } from "../types";

interface StatsCardProps {
  stats: Stats;
  loading?: boolean;
}

/**
 * 統計情報カードコンポーネント
 */
export const StatsCard: React.FC<StatsCardProps> = ({ stats, loading }) => {
  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="grid grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  const items = [
    { label: "総単語数", value: stats.total_words, color: "text-gray-700" },
    { label: "新規", value: stats.new_words, color: "text-blue-600" },
    { label: "学習中", value: stats.learning_words, color: "text-yellow-600" },
    { label: "復習待ち", value: stats.review_words, color: "text-orange-600" },
    { label: "マスター", value: stats.mastered_words, color: "text-green-600" },
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">📊 学習状況</h3>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        {items.map((item) => (
          <div
            key={item.label}
            className="text-center p-3 bg-gray-50 rounded-lg"
          >
            <p className={`text-2xl font-bold ${item.color}`}>{item.value}</p>
            <p className="text-sm text-gray-500">{item.label}</p>
          </div>
        ))}
      </div>

      {/* 進捗バー */}
      {stats.total_words > 0 && (
        <div className="mt-4">
          <div className="h-3 bg-gray-200 rounded-full overflow-hidden flex">
            <div
              className="bg-green-500 transition-all"
              style={{
                width: `${(stats.mastered_words / stats.total_words) * 100}%`,
              }}
            />
            <div
              className="bg-orange-500 transition-all"
              style={{
                width: `${(stats.review_words / stats.total_words) * 100}%`,
              }}
            />
            <div
              className="bg-yellow-500 transition-all"
              style={{
                width: `${(stats.learning_words / stats.total_words) * 100}%`,
              }}
            />
            <div
              className="bg-blue-500 transition-all"
              style={{
                width: `${(stats.new_words / stats.total_words) * 100}%`,
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
