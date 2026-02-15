import { useEffect } from 'react';
import { useGameStore } from '../store/gameStore';

export const GameOverScreen = () => {
    const { players, winnerId, restartGame, isHost, myPlayerId, subscribeToRoom } = useGameStore();
    const winner = players.find(p => p.id === winnerId);
    const isWinner = winnerId === myPlayerId;

    // Subscribe to room updates
    useEffect(() => {
        const unsubscribe = subscribeToRoom();
        return unsubscribe;
    }, [subscribeToRoom]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 relative z-10">
            <div className="washi p-8 md:p-12 rounded-2xl w-full max-w-2xl text-center space-y-8">

                {/* Trophy Animation Container */}
                <div className="relative">
                    <div className="text-8xl md:text-9xl animate-bounce">
                        {isWinner ? '👑' : '🏆'}
                    </div>
                    <div className="absolute inset-0 bg-gradient-radial from-kin/20 to-transparent rounded-full blur-3xl -z-10 animate-pulse"></div>
                </div>

                {/* Result Message */}
                <div className="space-y-4">
                    {isWinner ? (
                        <>
                            <h1 className="text-4xl md:text-6xl font-heading font-bold text-kin text-shadow-lg animate-pulse">
                                勝利！
                            </h1>
                            <p className="text-xl text-kinari">おめでとうございます</p>
                        </>
                    ) : (
                        <>
                            <h1 className="text-4xl md:text-6xl font-heading font-bold text-kinari text-shadow-lg">
                                終了
                            </h1>
                            <p className="text-2xl text-kinari">
                                勝者: <span className="text-kin font-bold font-heading">{winner?.name}</span>
                            </p>
                        </>
                    )}
                </div>

                {/* All Players Words Reveal */}
                <div className="space-y-4 pt-4">
                    <h2 className="text-sm font-bold text-kin tracking-widest font-heading">みんなの単語</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {players.map((player) => (
                            <div
                                key={player.id}
                                className={`p-4 rounded-xl border transition-all ${player.id === winnerId
                                    ? 'bg-kin/10 border-kin/30 glow-kin'
                                    : player.id === myPlayerId
                                        ? 'bg-shu/10 border-shu/20'
                                        : 'bg-sumi/30 border-kin/5'
                                    }`}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <span className="font-bold text-kinari flex items-center gap-2">
                                        {player.name}
                                        {player.id === myPlayerId && <span className="text-xs bg-shu/80 px-2 py-0.5 rounded-full text-kinari">あなた</span>}
                                    </span>
                                    {player.id === winnerId && <span className="text-kin">👑</span>}
                                </div>
                                <div className="flex gap-1 justify-center">
                                    {player.displayWord.map((char, i) => (
                                        <div
                                            key={i}
                                            className={`w-8 h-10 flex items-center justify-center rounded-lg text-lg font-bold ${char === '×'
                                                ? 'bg-sumi/30 text-hai'
                                                : 'bg-gradient-to-br from-kin-light to-kin text-ai'
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
                        className="w-full py-5 bg-gradient-to-r from-shu to-shu-dark hover:brightness-110 text-kinari font-heading font-bold text-2xl rounded-xl transition-all shadow-xl active:scale-95 border-b-4 border-shu-dark/50"
                    >
                        もう一度プレイ
                    </button>
                ) : (
                    <div className="text-hai py-4 font-heading">
                        ホストが次のゲームを開始するのを待っています...
                    </div>
                )}
            </div>
        </div>
    );
};
