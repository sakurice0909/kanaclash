export const DAKUTEN_MAP: Record<string, string> = {
    'が': 'か', 'ぎ': 'き', 'ぐ': 'く', 'げ': 'け', 'ご': 'こ',
    'ざ': 'さ', 'じ': 'し', 'ず': 'す', 'ぜ': 'せ', 'ぞ': 'そ',
    'だ': 'た', 'ぢ': 'ち', 'づ': 'つ', 'で': 'て', 'ど': 'と',
    'ば': 'は', 'び': 'ひ', 'ぶ': 'ふ', 'べ': 'へ', 'ぼ': 'ほ',
    'ぱ': 'は', 'ぴ': 'ひ', 'ぷ': 'ふ', 'ぺ': 'へ', 'ぽ': 'ほ',
    'vu': 'u', 'ゔ': 'う',
};

export const SMALL_KANA_MAP: Record<string, string> = {
    'ぁ': 'あ', 'ぃ': 'い', 'ぅ': 'う', 'ぇ': 'え', 'ぉ': 'お',
    'っ': 'つ',
    'ゃ': 'や', 'ゅ': 'ゆ', 'ょ': 'よ',
    'ゎ': 'わ',
    'ヶ': 'ケ', 'ヵ': 'カ',
};

export function normalizeKana(input: string): string {
    let normalized = input;

    // 1. Convert to Hiragana (optional, but good for consistency)
    // For now, assume input is mostly Hiragana.

    // 2. Remove Dakuten/Handakuten
    normalized = normalized.split('').map(char => DAKUTEN_MAP[char] || char).join('');

    // 3. Convert Small Kana to Big Kana
    normalized = normalized.split('').map(char => SMALL_KANA_MAP[char] || char).join('');

    return normalized;
}

export function isValidWord(word: string): boolean {
    // Allow only Hiragana and 'ー' (prolonged sound) maybe?
    // The game rules say "Hiragana".
    // Also length check: 2-7 chars.
    if (word.length < 2 || word.length > 7) return false;

    // Regex for Hiragana and ー
    return /^[\u3040-\u309Fー]+$/.test(word);
}
