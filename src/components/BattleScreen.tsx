import { useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import type { Player } from '../store/gameStore';

const KANA_COLS = [
    ['わ', 'ら', 'や', 'ま', 'は', 'な', 'た', 'さ', 'か', 'あ'],
    ['', 'り', '', 'み', 'ひ', 'に', 'ち', 'し', 'き', 'い'],
    ['を', 'る', 'ゆ', 'む', 'ふ', 'ぬ', 'つ', 'す', 'く', 'う'],
    ['', 'れ', '', 'め', 'へ', 'ね', 'て', 'せ', 'け', 'え'],
    ['ん', 'ろ', 'よ', 'も', 'ほ', 'の', 'と', 'そ', 'こ', 'お'],
    ['', '', '', '', '', '', '', '', '', 'ー']
];

const PlayerBoard = ({ player, isCurrent, isMe }: { player: Player; isCurrent: boolean; isMe: boolean }) => {
    return (
        <div className={`p-3 md:p-6 rounded-xl transition-all duration-500 relative overflow-hidden ${isCurrent
            ? 'bg-shu/10 border-2 border-shu/40 glow-shu transform scale-[1.02]'
            : 'bg-sumi/30 border border-kin/5'}`}>

            {isCurrent && <div className="absolute inset-0 bg-shu/5 animate-pulse pointer-events-none"></div>}

            <div className="flex justify-between items-center mb-2 md:mb-4 relative z-10">
                <span className={`font-heading font-bold text-base md:text-xl tracking-wide flex items-center gap-1 md:gap-2 ${isCurrent ? 'text-kinari text-shadow' : 'text-hai'}`}>
                    {player.name}
                    {isMe && <span className="text-xs bg-shu/80 px-2 py-0.5 rounded-full text-kinari">あなた</span>}
                    {isCurrent && <span className="text-xs bg-kin/80 px-2 py-0.5 rounded-full text-ai font-bold animate-bounce">手番</span>}
                </span>
                {player.isEliminated && <span className="text-kinari font-bold tracking-wider text-sm bg-beni px-3 py-1 rounded-full shadow-lg">脱落</span>}
            </div>
            <div className="flex gap-1 md:gap-2 justify-center flex-nowrap">
                {player.displayWord.map((char, index) => {
                    const isRevealed = player.revealedIndices[index];
                    return (
                        <div
                            key={index}
                            className={`w-7 h-9 md:w-12 md:h-14 flex items-center justify-center rounded-lg font-bold text-sm md:text-xl shadow-lg transition-all duration-500 relative
                            ${isRevealed
                                    ? 'bg-gradient-to-br from-kin-light to-kin text-ai glow-kin transform scale-100'
                                    : 'bg-sumi/50 text-hai border border-hai/20'
                                }`}
                        >
                            {isRevealed ? char : '?'}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export const BattleScreen = () => {
    const {
        players,
        currentPlayerIndex,
        attack,
        logs,
        attackCount,
        attackedKanas,
        myPlayerId,
        subscribeToRoom,
    } = useGameStore();

    const currentPlayer = players[currentPlayerIndex];
    const isMyTurn = currentPlayer?.id === myPlayerId;

    // Subscribe to room updates
    useEffect(() => {
        const unsubscribe = subscribeToRoom();
        return unsubscribe;
    }, [subscribeToRoom]);

    const getKanaStatus = (kana: string): 'hit' | 'miss' | 'neutral' => {
        let revealed = false;
        players.forEach(p => {
            p.displayWord.forEach((c, i) => {
                if (c === kana) {
                    if (p.revealedIndices[i]) revealed = true;
                }
            });
        });
        if (revealed) return 'hit';
        if (attackedKanas.has(kana)) return 'miss';
        return 'neutral';
    };

    const handleAttack = async (kana: string) => {
        if (!isMyTurn) return;
        await attack(kana);
    };

    return (
        <div className="flex flex-col md:flex-row h-screen overflow-hidden text-kinari relative z-10">
            {/* Left: Board & Logs */}
            <div className="flex-1 p-4 md:p-8 overflow-y-auto space-y-6 pb-40 md:pb-8 scrollbar-thin scrollbar-thumb-kin/30 scrollbar-track-transparent">
                <div>
                    <h2 className="text-sm font-bold text-kin tracking-widest mb-4 flex items-center gap-2 font-heading">
                        <span className="text-lg">👥</span> 参加者
                    </h2>
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                        {players.map((p, i) => (
                            <PlayerBoard
                                key={p.id}
                                player={p}
                                isCurrent={i === currentPlayerIndex}
                                isMe={p.id === myPlayerId}
                            />
                        ))}
                    </div>
                </div>

                <details className="flex-1">
                    <summary className="text-sm font-bold text-kin tracking-widest mb-2 flex items-center gap-2 font-heading cursor-pointer select-none list-none [&::-webkit-details-marker]:hidden">
                        <span className="text-lg">📜</span> バトルログ
                        <span className="text-xs text-hai ml-auto">▶ タップで展開</span>
                    </summary>
                    <div className="washi rounded-xl p-4 max-h-64 overflow-y-auto space-y-3 font-sans text-sm scrollbar-thin scrollbar-thumb-hai/30 mt-2">
                        {logs.length === 0 && <div className="text-hai text-center py-10 font-heading">バトル開始！</div>}
                        {logs.map((log) => (
                            <div key={log.id} className={`flex items-start gap-3 px-3 py-2 rounded-xl transition-all
                                ${log.type === 'attack' ? 'bg-kon/40 border border-kin/10' : ''}
                                ${log.type === 'damage' ? 'bg-shu/10 border border-shu/20' : ''}
                                ${log.type === 'elimination' ? 'bg-beni/10 border border-beni/30 glow-shu' : ''}
                                ${log.type === 'info' ? 'text-hai' : ''}
                            `}>
                                <span className="text-lg mt-0.5">
                                    {log.type === 'attack' && '⚔️'}
                                    {log.type === 'damage' && '💥'}
                                    {log.type === 'elimination' && '💀'}
                                    {log.type === 'info' && 'ℹ️'}
                                </span>
                                <div className="leading-relaxed">
                                    {log.message}
                                </div>
                            </div>
                        ))}
                    </div>
                </details>
            </div>

            {/* Right: Controls (Keyboard) */}
            <div className="w-full md:w-[450px] washi-strong p-6 shadow-[-10px_0_30px_rgba(0,0,0,0.3)] flex flex-col border-t md:border-t-0 md:border-l border-kin/10 z-20">
                <div className="mb-3 md:mb-6 text-center">
                    <div className="flex items-center justify-center gap-2 md:gap-3 flex-wrap">
                        <span className={`text-lg md:text-2xl font-heading font-bold ${isMyTurn
                            ? 'text-shu text-shadow-lg animate-pulse'
                            : 'text-kin text-shadow'
                            }`}>
                            {isMyTurn ? 'あなたの番！' : currentPlayer?.name}
                        </span>
                        <div className="inline-flex items-center gap-1.5 bg-sumi/40 border border-kin/20 rounded-full py-1 px-3 md:py-1.5 md:px-5 shadow-inner">
                            <span className="text-kin-light text-xs md:text-sm">アクション</span>
                            <span className="font-heading font-bold text-base md:text-xl text-kinari">{attackCount + 1}</span>
                            <span className="text-hai text-[10px] md:text-xs">/ 2</span>
                        </div>
                    </div>

                    {!isMyTurn && (
                        <p className="text-hai text-xs md:text-sm mt-2">
                            {currentPlayer?.name} の攻撃を待っています...
                        </p>
                    )}
                </div>

                <div className="flex-1 overflow-y-auto scrollbar-none">
                    <div className="grid grid-cols-10 gap-1.5 p-1">
                        {KANA_COLS.flat().map((char, i) => {
                            if (!char) return <div key={i} />;
                            const status = getKanaStatus(char);

                            return (
                                <button
                                    key={i}
                                    onClick={() => handleAttack(char)}
                                    disabled={status !== 'neutral' || !isMyTurn}
                                    className={`
                                        aspect-square flex items-center justify-center rounded-lg font-bold text-base md:text-lg transition-all duration-200 relative overflow-hidden group
                                        ${status === 'hit'
                                            ? 'bg-gradient-to-br from-kin-light to-kin text-ai glow-kin scale-95 cursor-not-allowed font-black'
                                            : status === 'miss'
                                                ? 'bg-sumi/20 text-hai/30 scale-95 border border-hai/10 cursor-not-allowed line-through decoration-2'
                                                : !isMyTurn
                                                    ? 'bg-sumi/40 text-hai/60 border border-kin/5 cursor-not-allowed'
                                                    : 'bg-sumi/40 hover:bg-shu/30 text-kinari hover:text-kinari border border-kin/10 hover:border-shu/50 active:scale-90 hover:glow-shu'}
                                    `}
                                >
                                    <span className="relative z-10">{char}</span>
                                    {status === 'neutral' && isMyTurn && <div className="absolute inset-0 bg-gradient-to-br from-kin/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};
