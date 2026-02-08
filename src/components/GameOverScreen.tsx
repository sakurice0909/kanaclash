import { useGameStore } from '../store/gameStore';

export const GameOverScreen = () => {
    const { players, winnerId, restartGame, isHost, myPlayerId } = useGameStore();
    const winner = players.find(p => p.id === winnerId);
    const isWinner = winnerId === myPlayerId;

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 relative z-10">
            <div className="glass p-8 md:p-12 rounded-3xl shadow-2xl w-full max-w-2xl text-center backdrop-blur-xl border border-white/10 space-y-8">

                {/* Trophy Animation Container */}
                <div className="relative">
                    <div className="text-8xl md:text-9xl animate-bounce">
                        {isWinner ? '👑' : '🏆'}
                    </div>
                    <div className="absolute inset-0 bg-gradient-radial from-yellow-500/20 to-transparent rounded-full blur-3xl -z-10 animate-pulse"></div>
                </div>

                {/* Result Message */}
                <div className="space-y-4">
                    {isWinner ? (
                        <>
                            <h1 className="text-4xl md:text-6xl font-heading font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-300 animate-pulse">
                                YOU WIN!
                            </h1>
                            <p className="text-xl text-slate-300">おめでとうございます！</p>
                        </>
                    ) : (
                        <>
                            <h1 className="text-4xl md:text-6xl font-heading font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-300">
                                GAME OVER
                            </h1>
                            <p className="text-2xl text-slate-300">
                                勝者: <span className="text-yellow-400 font-bold">{winner?.name}</span>
                            </p>
                        </>
                    )}
                </div>

                {/* All Players Words Reveal */}
                <div className="space-y-4 pt-4">
                    <h2 className="text-sm font-bold text-indigo-300 uppercase tracking-widest">みんなの単語</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {players.map((player) => (
                            <div
                                key={player.id}
                                className={`p-4 rounded-2xl border transition-all ${player.id === winnerId
                                        ? 'bg-yellow-500/10 border-yellow-500/30'
                                        : player.id === myPlayerId
                                            ? 'bg-indigo-500/10 border-indigo-500/30'
                                            : 'bg-slate-900/30 border-white/5'
                                    }`}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <span className="font-bold text-white flex items-center gap-2">
                                        {player.name}
                                        {player.id === myPlayerId && <span className="text-xs bg-cyan-600 px-2 py-0.5 rounded-full">あなた</span>}
                                    </span>
                                    {player.id === winnerId && <span className="text-yellow-400">👑</span>}
                                </div>
                                <div className="flex gap-1 justify-center">
                                    {player.displayWord.map((char, i) => (
                                        <div
                                            key={i}
                                            className={`w-8 h-10 flex items-center justify-center rounded-lg text-lg font-bold ${char === '×'
                                                    ? 'bg-slate-800/30 text-slate-600'
                                                    : 'bg-indigo-200 text-indigo-900'
                                                }`}
                                        >
                                            {char}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Restart */}
                {isHost ? (
                    <button
                        onClick={restartGame}
                        className="w-full py-5 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 text-white font-heading font-bold text-2xl rounded-2xl transition-all shadow-xl active:scale-95"
                    >
                        もう一度プレイ
                    </button>
                ) : (
                    <div className="text-slate-400 py-4">
                        ホストが次のゲームを開始するのを待っています...
                    </div>
                )}
            </div>
        </div>
    );
};
