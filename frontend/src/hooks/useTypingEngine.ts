import { useState, useCallback, useEffect, useRef } from "react";
import { TypingState } from "../types";
import { isNextCharValid, isInputComplete } from "../utils/romajiUtils";

interface UseTypingEngineProps {
  targetString: string;
  onComplete: (hasError: boolean) => void;
  onCorrectKey?: () => void;
  onErrorKey?: () => void;
}

interface UseTypingEngineReturn {
  state: TypingState;
  handleKeyDown: (e: KeyboardEvent) => void;
  reset: (newTarget: string) => void;
}

/**
 * タイピングエンジンカスタムフック
 * - 1文字ずつ判定（ローマ字の揺れ対応）
 * - 不正解時は入力を受け付けない（画面を一瞬赤くする）
 * - 最後の文字を入力したらAuto Next（Enter不要）
 */
export function useTypingEngine({
  targetString,
  onComplete,
  onCorrectKey,
  onErrorKey,
}: UseTypingEngineProps): UseTypingEngineReturn {
  const [state, setState] = useState<TypingState>({
    currentIndex: 0,
    targetString: targetString,
    typedString: "",
    isComplete: false,
    hasError: false,
  });

  const hasErrorOccurred = useRef(false);

  // targetStringが変わったらリセット
  useEffect(() => {
    // 空文字列の場合は何もしない（初期化待ち）
    if (!targetString) return;

    setState({
      currentIndex: 0,
      targetString: targetString,
      typedString: "",
      isComplete: false,
      hasError: false,
    });
    hasErrorOccurred.current = false;
  }, [targetString]);

  const reset = useCallback((newTarget: string) => {
    setState({
      currentIndex: 0,
      targetString: newTarget,
      typedString: "",
      isComplete: false,
      hasError: false,
    });
    hasErrorOccurred.current = false;
  }, []);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // IMEの入力やControl/Alt/Metaキーは無視
      if (e.isComposing || e.ctrlKey || e.altKey || e.metaKey) {
        return;
      }

      // 特殊キーは無視（Shift、Tab、Escapeなど）
      if (e.key.length !== 1) {
        return;
      }

      // 空文字列の場合は何もしない
      if (!targetString) {
        return;
      }

      e.preventDefault();

      setState((prev) => {
        if (prev.isComplete) {
          return prev;
        }

        // 空文字列チェック
        if (!prev.targetString) {
          return prev;
        }

        const inputChar = e.key;
        const newTypedString = prev.typedString + inputChar;

        // ローマ字の揺れを考慮した判定
        const isCorrect = isNextCharValid(
          prev.typedString,
          inputChar,
          prev.targetString
        );

        if (isCorrect) {
          // 正解音を鳴らす
          onCorrectKey?.();

          // 完了判定（揺れを考慮）
          const isComplete = isInputComplete(newTypedString, prev.targetString);

          // 完了時はAuto Next（コールバック実行）
          if (isComplete) {
            // 非同期でonCompleteを呼ぶ（state更新後に実行されるように）
            setTimeout(() => {
              onComplete(hasErrorOccurred.current);
            }, 0);
          }

          return {
            ...prev,
            currentIndex: newTypedString.length,
            typedString: newTypedString,
            isComplete,
            hasError: false,
          };
        } else {
          // 不正解音を鳴らす
          onErrorKey?.();

          // 不正解: エラーフラグを立てる（入力は受け付けない）
          hasErrorOccurred.current = true;
          return {
            ...prev,
            hasError: true,
          };
        }
      });

      // エラー表示を一定時間後に消す
      setTimeout(() => {
        setState((prev) => ({ ...prev, hasError: false }));
      }, 200);
    },
    [onComplete, onCorrectKey, onErrorKey, targetString]
  );

  return {
    state,
    handleKeyDown,
    reset,
  };
}
