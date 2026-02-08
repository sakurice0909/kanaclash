import { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { normalizeKana, isValidWord } from '../utils/kana';

export const InputScreen = () => {
    const { players, currentPlayerIndex, setPlayerWord, theme } = useGameStore();
    const currentPlayer = players[currentPlayerIndex];

    const [input, setInput] = useState('');
    const [error, setError] = useState('');
    const [isRevealed, setIsRevealed] = useState(false);

    const handleConfirm = () => {
        // Validation: Check for Hiragana and prolonged sound mark
        if (!/^[\u3040-\u309Fー]+$/.test(input)) {
            setError('ひらがなのみ入力してください');
            return;
        }

        if (!isValidWord(input)) {
            setError('2〜7文字のひらがなを入力してください');
            return;
        }
        setPlayerWord(currentPlayer.id, input);
        setInput('');
        setError('');
        setIsRevealed(false);
    };

    const normalizedInput = normalizeKana(input);

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

                {!isRevealed ? (
                    <div className="space-y-8 py-8 animate-in fade-in zoom-in duration-500">
                        <div className="space-y-4">
                            <h3 className="text-xl md:text-2xl font-bold text-slate-300">この人に端末を渡してください</h3>
                            <div className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br from-indigo-300 via-purple-300 to-pink-300 py-4 inline-block drop-shadow-lg font-heading">
                                {currentPlayer.name}
                            </div>
                        </div>

                        <div className="bg-slate-900/50 p-6 rounded-2xl border border-white/5 max-w-md mx-auto">
                            <p className="text-slate-400 text-sm leading-relaxed">
                                ⚠️ 他の人には画面を見せないでください。<br />
                                準備ができたら下のボタンを押してください。
                            </p>
                        </div>

                        <button
                            onClick={() => setIsRevealed(true)}
                            className="w-full max-w-md py-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold text-xl transition-all shadow-lg hover:shadow-indigo-500/25 active:scale-95 group relative overflow-hidden"
                        >
                            <span className="relative z-10">私が {currentPlayer.name} です (確認)</span>
                            <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                        </button>
                    </div>
                ) : (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div>
                            <h3 className="text-2xl font-heading font-bold mb-2">単語を入力してください</h3>
                            <p className="text-sm text-slate-400">
                                2〜7文字のひらがな (濁点・半濁点は自動で削除されます)
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
                                    className="w-full px-6 py-5 text-center text-3xl font-bold rounded-2xl bg-slate-900/60 border border-slate-600/50 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none placeholder:text-slate-700 transition-all text-white tracking-widest shadow-inner composition:bg-indigo-900/50"
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
                            決定して次へ
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
