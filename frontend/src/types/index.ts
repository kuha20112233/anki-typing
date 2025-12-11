// 単語の型定義
export interface Word {
  id: number;
  english: string;
  japanese_view: string;
  japanese_romaji: string;
  status: "new" | "learning" | "review" | "mastered";
  next_review_at: string | null;
  interval: number;
  mistake_count: number;
  created_at: string;
}

// ゲームモード
export type GameMode = "english" | "japanese" | "double";

// 学習結果アイテム
export interface StudyResultItem {
  word_id: number;
  is_correct: boolean;
}

// 統計情報
export interface Stats {
  total_words: number;
  mastered_words: number;
  learning_words: number;
  new_words: number;
  review_words: number;
}

// CSVアップロードレスポンス
export interface UploadResponse {
  imported: number;
  skipped: number;
  message: string;
}

// ゲーム内の単語状態
export interface GameWord extends Word {
  isCorrect?: boolean;
  typingTime?: number;
}

// ゲーム結果
export interface GameResult {
  totalWords: number;
  correctCount: number;
  incorrectCount: number;
  totalTime: number;
  accuracy: number;
  results: StudyResultItem[];
}

// タイピングエンジンの状態
export interface TypingState {
  currentIndex: number;
  targetString: string;
  typedString: string;
  isComplete: boolean;
  hasError: boolean;
}
