/**
 * ローマ字入力の揺れ対応
 * シンプルなアプローチ：入力バリエーションを生成してマッチング
 */

// ローマ字の揺れパターン
const ROMAJI_PATTERNS: [string, string][] = [
  // 3文字 → 2文字
  ["shi", "si"],
  ["chi", "ti"],
  ["tsu", "tu"],
  ["sha", "sya"],
  ["shu", "syu"],
  ["sho", "syo"],
  ["cha", "tya"],
  ["chu", "tyu"],
  ["cho", "tyo"],
  // 2文字 → 2文字
  ["fu", "hu"],
  ["ji", "zi"],
  ["ja", "zya"],
  ["ju", "zyu"],
  ["jo", "zyo"],
];

/**
 * 目標文字列のすべてのバリエーションを生成
 */
function generateVariants(target: string): string[] {
  let variants = [target.toLowerCase()];

  // 各パターンについて置換バリエーションを追加
  for (const [from, to] of ROMAJI_PATTERNS) {
    const newVariants: string[] = [];
    for (const v of variants) {
      newVariants.push(v);
      // from → to の置換
      if (v.includes(from)) {
        newVariants.push(v.split(from).join(to));
      }
      // to → from の置換
      if (v.includes(to)) {
        newVariants.push(v.split(to).join(from));
      }
    }
    variants = [...new Set(newVariants)];
  }

  // nn/n の揺れ対応
  const withNVariants: string[] = [];
  for (const v of variants) {
    withNVariants.push(v);
    // n が単独で「ん」になる場所を nn でも許容
    // 簡易版：末尾のn、または n + 子音 の場所
    let modified = v;
    for (let i = 0; i < v.length; i++) {
      if (v[i] === "n" && v[i + 1] !== "n") {
        const next = v[i + 1];
        // 母音とy以外の後ろ、または末尾
        if (!next || !"aiueoy".includes(next)) {
          const variant = v.slice(0, i + 1) + "n" + v.slice(i + 1);
          withNVariants.push(variant);
        }
      }
    }
  }

  return [...new Set(withNVariants)];
}

/**
 * 入力が有効かチェック
 */
export function isNextCharValid(
  currentTyped: string,
  nextChar: string,
  target: string
): boolean {
  const newTyped = (currentTyped + nextChar).toLowerCase();
  const variants = generateVariants(target);

  return variants.some((v) => v.startsWith(newTyped));
}

/**
 * 入力完了判定
 */
export function isInputComplete(typed: string, target: string): boolean {
  const typedLower = typed.toLowerCase();
  const variants = generateVariants(target);

  return variants.some((v) => v === typedLower);
}

/**
 * マッチしているバリエーションを取得
 */
function getMatchingVariant(typed: string, target: string): string | null {
  const typedLower = typed.toLowerCase();
  const variants = generateVariants(target);

  for (const v of variants) {
    if (v.startsWith(typedLower)) {
      return v;
    }
  }
  return null;
}

/**
 * 残りのガイド文字列を取得
 * 入力済み部分を除いた、マッチするバリエーションの残り部分を返す
 */
export function getRemainingGuide(typed: string, target: string): string {
  if (!typed) return target;

  const matchingVariant = getMatchingVariant(typed, target);
  if (matchingVariant) {
    // マッチしたバリエーションの残り部分を返す
    return matchingVariant.slice(typed.length);
  }

  // マッチしない場合は目標文字列全体
  return target;
}
