import React, { useRef, useState } from "react";
import { uploadCSV } from "../hooks/useApi";
import { UploadResponse } from "../types";

interface CSVUploaderProps {
  onUploadComplete: (result: UploadResponse) => void;
}

/**
 * CSVアップローダーコンポーネント
 */
export const CSVUploader: React.FC<CSVUploaderProps> = ({
  onUploadComplete,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFileSelect = async (file: File) => {
    if (!file.name.endsWith(".csv")) {
      setError("CSVファイルのみアップロード可能です");
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const result = await uploadCSV(file);
      onUploadComplete(result);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "アップロードに失敗しました"
      );
    } finally {
      setUploading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        📁 CSVインポート
      </h3>

      <div
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
          transition-colors duration-200
          ${
            dragOver
              ? "border-blue-500 bg-blue-50"
              : "border-gray-300 hover:border-gray-400"
          }
          ${uploading ? "opacity-50 pointer-events-none" : ""}
        `}
        onClick={() => fileInputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleInputChange}
          className="hidden"
        />

        {uploading ? (
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent mb-2" />
            <p className="text-gray-600">アップロード中...</p>
          </div>
        ) : (
          <>
            <div className="text-4xl mb-2">📄</div>
            <p className="text-gray-600 mb-1">
              クリックまたはドラッグ＆ドロップ
            </p>
            <p className="text-sm text-gray-400">
              CSV形式: english, japanese_view, japanese_romaji
            </p>
          </>
        )}
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm">❌ {error}</p>
        </div>
      )}
    </div>
  );
};
