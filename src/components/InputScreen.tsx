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
                <div className="glass p-8 md:p-12 rounded-3xl shadow-2xl w-full max-w-2xl space-y-8 text-center backdrop-blur-xl border border-white/10">
                    <div className="space-y-2">
                        <h2 className="text-sm font-bold text-indigo-300 uppercase tracking-widest">お題</h2>
                        <div className="text-3xl md:text-4xl font-heading font-bold text-white">
                            {theme}
                        </div>
                    </div>

                    <div className="py-8">
                        <div className="text-6xl mb-4">✅</div>
                        <h3 className="text-2xl font-bold text-emerald-400 mb-4">単語を登録しました！</h3>
                        <p className="text-slate-400">他のプレイヤーの入力を待っています...</p>
                    </div>

                    {/* Progress */}
                    <div className="space-y-4">
                        <div className="flex justify-center gap-2">
                            {players.map((player) => (
                                <div
                                    key={player.id}
                                    className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${player.displayWord.length > 0
                                            ? 'bg-emerald-600/30 border border-emerald-500/50 text-emerald-300'
                                            : 'bg-slate-800/50 border border-slate-700/50 text-slate-500'
                                        }`}
                                >
                                    {player.name}
                                    {player.displayWord.length > 0 && ' ✓'}
                                </div>
                            ))}
                        </div>
                        <p className="text-slate-500 text-sm">
                            {submittedCount} / {players.length} 人が入力完了
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 relative z-10 w-full">
            <div className="glass p-8 md:p-12 rounded-3xl shadow-2xl w-full max-w-2xl space-y-8 text-center backdrop-blur-xl border border-white/10">
                {/* Header Section */}
                <div className="space-y-2">
                    <h2 className="text-sm font-bold text-indigo-300 uppercase tracking-widest mb-1">お題 (THEME)</h2>
                    <div className="text-3xl md:text-4xl font-heading font-bold text-white drop-shadow-md">
                        {theme}
                    </div>
                </div>

                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div>
                        <h3 className="text-2xl font-heading font-bold mb-2">あなたの単語を入力</h3>
                        <p className="text-sm text-slate-400">
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
                                                ? 'bg-indigo-600/20 border-indigo-400 text-indigo-100 shadow-[0_0_10px_rgba(99,102,241,0.3)]'
                                                : 'bg-slate-800/30 border-slate-700/50 text-slate-600'}
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
                                className="w-full px-6 py-5 text-center text-3xl font-bold rounded-2xl bg-slate-900/60 border border-slate-600/50 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none placeholder:text-slate-700 transition-all text-white tracking-widest shadow-inner"
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
                        <div className="bg-red-500/10 border border-red-500/20 text-red-300 px-4 py-3 rounded-xl animate-pulse">
                            ⚠️ {error}
                        </div>
                    )}

                    <button
                        onClick={handleConfirm}
                        disabled={!input}
                        className="w-full py-5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 disabled:opacity-50 disabled:cursor-not-allowed rounded-2xl font-bold text-xl text-white shadow-lg shadow-emerald-900/20 transition-all active:scale-95 border-t border-white/20"
                    >
                        決定
                    </button>

                    {/* Other players progress */}
                    <div className="text-slate-500 text-sm">
                        {submittedCount} / {players.length} 人が入力完了
                    </div>
                </div>
            </div>
        </div>
    );
};
