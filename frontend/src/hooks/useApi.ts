import {
  Word,
  Stats,
  UploadResponse,
  StudyResultItem,
  GameMode,
} from "../types";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

/**
 * API呼び出しユーティリティ
 */
async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || `API Error: ${response.status}`);
  }

  return response.json();
}

/**
 * 学習セッション用の単語を取得
 */
export async function getStudySession(
  mode: GameMode = "english",
  limit: number = 10
): Promise<Word[]> {
  return fetchApi<Word[]>(`/study/session?mode=${mode}&limit=${limit}`);
}

/**
 * 学習結果を送信
 */
export async function submitStudyResult(
  results: StudyResultItem[]
): Promise<{ message: string; updated_count: number }> {
  return fetchApi("/study/result", {
    method: "POST",
    body: JSON.stringify({ results }),
  });
}

/**
 * 統計情報を取得
 */
export async function getStats(): Promise<Stats> {
  return fetchApi<Stats>("/stats");
}

/**
 * CSVファイルをアップロード
 */
export async function uploadCSV(file: File): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const url = `${API_BASE_URL}/words/upload`;
  const response = await fetch(url, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || `Upload Error: ${response.status}`);
  }

  return response.json();
}

/**
 * すべての単語を取得
 */
export async function getAllWords(
  skip: number = 0,
  limit: number = 100
): Promise<Word[]> {
  return fetchApi<Word[]>(`/words/?skip=${skip}&limit=${limit}`);
}
