import { useState, useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { normalizeKana, isValidWord } from '../utils/kana';

export const InputScreen = () => {
    const {
        players,
        theme,
        myPlayerId,
        setMyWord,
        subscribeToRoom,
    } = useGameStore();

    const [input, setInput] = useState('');
    const [error, setError] = useState('');
    const [submitted, setSubmitted] = useState(false);

    // Subscribe to room updates
    useEffect(() => {
        const unsubscribe = subscribeToRoom();
        return unsubscribe;
    }, [subscribeToRoom]);

    // Check if already submitted
    const myPlayer = players.find(p => p.id === myPlayerId);
    const hasSubmitted = myPlayer && myPlayer.displayWord.length > 0;

    const handleConfirm = async () => {
        // Validation
        if (!/^[\u3040-\u309Fー]+$/.test(input)) {
            setError('ひらがなのみ入力してください');
            return;
        }

        if (!isValidWord(input)) {
            setError('2〜7文字のひらがなを入力してください');
            return;
        }

        await setMyWord(input);
        setSubmitted(true);
        setError('');
    };

    const normalizedInput = normalizeKana(input);

    // Players who have submitted
    const submittedCount = players.filter(p => p.displayWord.length > 0).length;

    if (hasSubmitted || submitted) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-4 relative z-10">
                <div className="washi p-8 md:p-12 rounded-2xl w-full max-w-2xl space-y-8 text-center">
                    <div className="space-y-2">
                        <h2 className="text-sm font-bold text-kin tracking-widest font-heading">お題</h2>
                        <div className="text-3xl md:text-4xl font-heading font-bold text-kinari text-shadow">
                            {theme}
                        </div>
                    </div>

                    <div className="py-8">
                        <div className="text-6xl mb-4">✅</div>
                        <h3 className="text-2xl font-bold text-matcha-light mb-4 font-heading">単語を登録しました</h3>
                        <p className="text-hai">他のプレイヤーの入力を待っています...</p>
                    </div>

                    {/* Progress */}
                    <div className="space-y-4">
                        <div className="flex justify-center gap-2 flex-wrap">
                            {players.map((player) => (
                                <div
                                    key={player.id}
                                    className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${player.displayWord.length > 0
                                        ? 'bg-matcha/20 border border-matcha/40 text-matcha-light'
                                        : 'bg-sumi/30 border border-hai/20 text-hai'
                                        }`}
                                >
                                    {player.name}
                                    {player.displayWord.length > 0 && ' ✓'}
                                </div>
                            ))}
                        </div>
                        <p className="text-hai text-sm">
                            {submittedCount} / {players.length} 人が入力完了
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 relative z-10 w-full">
            <div className="washi p-8 md:p-12 rounded-2xl w-full max-w-2xl space-y-8 text-center">
                {/* Header Section */}
                <div className="space-y-2">
                    <h2 className="text-sm font-bold text-kin tracking-widest mb-1 font-heading">お題</h2>
                    <div className="text-3xl md:text-4xl font-heading font-bold text-kinari text-shadow">
                        {theme}
                    </div>
                </div>

                <div className="space-y-8">
                    <div>
                        <h3 className="text-2xl font-heading font-bold mb-2 text-kinari">あなたの単語を入力</h3>
                        <p className="text-sm text-hai">
                            2〜7文字のひらがな (他の人には見えません)
                        </p>
                    </div>

                    <div className="relative max-w-lg mx-auto">
                        {/* Slots Visualization */}
                        <div className="flex justify-center gap-2 mb-6 h-16">
                            {[...Array(7)].map((_, i) => {
                                const char = normalizedInput[i];
                                return (
                                    <div
                                        key={i}
                                        className={`
                                            w-10 h-14 md:w-12 md:h-16 rounded-lg flex items-center justify-center text-2xl font-bold border-2 transition-all duration-300
                                            ${char
                                                ? 'bg-kin/10 border-kin/60 text-kin-light glow-kin'
                                                : 'bg-sumi/30 border-hai/20 text-hai/40'}
                                        `}
                                    >
                                        {char || ''}
                                    </div>
                                );
                            })}
                        </div>

                        <div className="relative">
                            <input
                                type="text"
                                inputMode="text"
                                enterKeyHint="done"
                                value={input}
                                onChange={(e) => {
                                    setInput(e.target.value);
                                    setError('');
                                }}
                                className="w-full px-6 py-5 text-center text-3xl font-bold rounded-xl bg-sumi/60 border border-kin/20 focus:border-kin focus:ring-4 focus:ring-kin/10 focus:outline-none placeholder:text-hai/30 transition-all text-kinari tracking-widest shadow-inner"
                                placeholder="ひらがな"
                                autoFocus
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
                                        handleConfirm();
                                    }
                                }}
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="bg-shu/10 border border-shu/20 text-shu-light px-4 py-3 rounded-xl animate-pulse">
                            ⚠️ {error}
                        </div>
                    )}

                    <button
                        onClick={handleConfirm}
                        disabled={!input}
                        className="w-full py-5 bg-gradient-to-r from-shu to-shu-dark hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-heading font-bold text-xl text-kinari shadow-lg transition-all active:scale-95 border-b-4 border-shu-dark/50"
                    >
                        決定
                    </button>

                    {/* Other players progress */}
                    <div className="text-hai text-sm">
                        {submittedCount} / {players.length} 人が入力完了
                    </div>
                </div>
            </div>
        </div>
    );
};
