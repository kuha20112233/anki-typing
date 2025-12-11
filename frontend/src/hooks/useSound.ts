import { useCallback, useRef } from "react";

/**
 * 効果音カスタムフック
 * Web Audio APIを使用してシンプルな効果音を生成
 */
export function useSound() {
  const audioContextRef = useRef<AudioContext | null>(null);

  // AudioContextの初期化（ユーザー操作後に呼ばれる必要がある）
  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
    }
    return audioContextRef.current;
  }, []);

  // タイプ音（キーボード打鍵音風の短いクリック音）
  const playTypeSound = useCallback(() => {
    try {
      const ctx = getAudioContext();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      oscillator.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(ctx.destination);

      // ノイズっぽい高周波でクリック感を出す
      oscillator.frequency.value = 1800;
      oscillator.type = "square";

      // ハイパスフィルターでカチッとした音に
      filter.type = "highpass";
      filter.frequency.value = 1000;

      // 非常に短く、小さい音量
      gainNode.gain.setValueAtTime(0.03, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.03);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.03);
    } catch (e) {
      console.warn("効果音の再生に失敗:", e);
    }
  }, [getAudioContext]);

  // 不正解音（低いピッチのブザー音）
  const playErrorSound = useCallback(() => {
    try {
      const ctx = getAudioContext();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      // 低めの周波数で警告音
      oscillator.frequency.value = 200; // G3付近
      oscillator.type = "square"; // 角張った音

      // 音量を小さめに
      gainNode.gain.setValueAtTime(0.08, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.15);
    } catch (e) {
      console.warn("効果音の再生に失敗:", e);
    }
  }, [getAudioContext]);

  // 単語完了音（心地よい上昇音）
  const playWordCompleteSound = useCallback(() => {
    try {
      const ctx = getAudioContext();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      // 上昇するピッチで達成感
      oscillator.frequency.setValueAtTime(600, ctx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(
        900,
        ctx.currentTime + 0.1
      );
      oscillator.type = "sine";

      gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.15);
    } catch (e) {
      console.warn("効果音の再生に失敗:", e);
    }
  }, [getAudioContext]);

  // 全問完了音（メロディックな音）
  const playCompleteSound = useCallback(() => {
    try {
      const ctx = getAudioContext();
      const notes = [523.25, 659.25, 783.99]; // C5, E5, G5（ドミソ）

      notes.forEach((freq, i) => {
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.frequency.value = freq;
        oscillator.type = "sine";

        const startTime = ctx.currentTime + i * 0.1;
        gainNode.gain.setValueAtTime(0.1, startTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.2);

        oscillator.start(startTime);
        oscillator.stop(startTime + 0.2);
      });
    } catch (e) {
      console.warn("効果音の再生に失敗:", e);
    }
  }, [getAudioContext]);

  return {
    playTypeSound,
    playErrorSound,
    playWordCompleteSound,
    playCompleteSound,
  };
}
