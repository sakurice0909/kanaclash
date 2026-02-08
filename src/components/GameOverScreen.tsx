import { useGameStore } from '../store/gameStore';

export const GameOverScreen = () => {
    const { players, winnerId, restartGame } = useGameStore();
    const winner = players.find(p => p.id === winnerId);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 relative z-10 overflow-hidden">
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-red-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
            </div>

            <h1 className="text-7xl md:text-9xl font-heading font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-orange-400 to-red-400 mb-12 drop-shadow-lg animate-bounce duration-[2000ms]">
                優勝！
            </h1>

            <div className="glass p-12 rounded-3xl shadow-2xl text-center mb-16 backdrop-blur-xl border border-yellow-500/30 relative overflow-hidden group animate-float">
                <div className="absolute inset-0 bg-gradient-to-t from-yellow-500/20 to-transparent opacity-50"></div>
                <p className="text-xl text-yellow-200 mb-2 uppercase tracking-[0.2em] font-bold relative z-10">WINNER</p>
                <div className="text-5xl md:text-7xl font-heading font-bold text-white relative z-10 drop-shadow-md">
                    {winner?.name || '不明'}
                </div>
            </div>

            <div className="w-full max-w-lg relative z-10">
                <div className="glass p-6 rounded-2xl space-y-4">
                    <h3 className="text-xl text-slate-300 font-bold mb-4 border-b border-white/10 pb-2 flex items-center gap-2">
                        <span>🏆</span> 最終結果
                    </h3>
                    {players.map((p, i) => (
                        <div key={p.id} className="flex justify-between items-center bg-slate-900/40 p-4 rounded-xl border border-white/5 backdrop-blur-sm">
                            <div className="flex items-center gap-3">
                                <span className={`font-bold font-heading ${p.id === winnerId ? 'text-yellow-400' : 'text-slate-400'}`}>
                                    {i + 1}. {p.name}
                                </span>
                                {p.id === winnerId && <span className="text-xs bg-yellow-500/20 text-yellow-300 px-2 py-0.5 rounded border border-yellow-500/30">KING</span>}
                            </div>
                            <div className="flex gap-1">
                                {p.displayWord.map((char, index) => (
                                    <span key={index} className="w-8 h-8 flex items-center justify-center bg-slate-800 rounded-lg text-slate-200 font-bold border border-slate-700 shadow-sm">
                                        {char}
                                    </span>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <button
                onClick={restartGame}
                className="mt-12 px-12 py-5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-2xl font-bold text-xl shadow-[0_0_20px_rgba(16,185,129,0.4)] hover:shadow-[0_0_40px_rgba(16,185,129,0.6)] transform transition hover:-translate-y-1 active:scale-95 relative z-10 border-t border-white/20"
            >
                もう一度遊ぶ
            </button>
        </div>
    );
};
