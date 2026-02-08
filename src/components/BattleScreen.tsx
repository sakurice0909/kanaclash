import { useGameStore } from '../store/gameStore';
import type { Player } from '../store/gameStore';
import { useEffect, useRef } from 'react';

const KANA_COLS = [
    ['わ', 'ら', 'や', 'ま', 'は', 'な', 'た', 'さ', 'か', 'あ'],
    ['', 'り', '', 'み', 'ひ', 'に', 'ち', 'し', 'き', 'い'],
    ['を', 'る', 'ゆ', 'む', 'ふ', 'ぬ', 'つ', 'す', 'く', 'う'],
    ['', 'れ', '', 'め', 'へ', 'ね', 'て', 'せ', 'け', 'え'],
    ['ん', 'ろ', 'よ', 'も', 'ほ', 'の', 'と', 'そ', 'こ', 'お'],
    ['', '', '', '', '', '', '', '', '', 'ー']
];

const PlayerBoard = ({ player, isCurrent }: { player: Player; isCurrent: boolean }) => {
    return (
        <div className={`p-6 rounded-2xl transition-all duration-500 relative overflow-hidden ${isCurrent
            ? 'bg-indigo-900/40 border-2 border-indigo-400/50 shadow-[0_0_30px_rgba(99,102,241,0.2)] transform scale-[1.02]'
            : 'bg-slate-900/30 border border-white/5'}`}>

            {/* Active Indicator Glow */}
            {isCurrent && <div className="absolute inset-0 bg-indigo-500/10 animate-pulse pointer-events-none"></div>}

            <div className="flex justify-between items-center mb-4 relative z-10">
                <span className={`font-heading font-bold text-xl tracking-wide flex items-center gap-2 ${isCurrent ? 'text-indigo-200 drop-shadow-sm' : 'text-slate-400'}`}>
                    {player.name}
                    {isCurrent && <span className="text-xs bg-indigo-500 px-2 py-0.5 rounded-full text-white animate-bounce">TURN</span>}
                </span>
                {player.isEliminated && <span className="text-white font-bold tracking-wider text-sm bg-rose-500 px-3 py-1 rounded-full shadow-lg shadow-rose-900/50">脱落</span>}
            </div>
            <div className="flex gap-2 justify-center flex-wrap">
                {player.displayWord.map((char, index) => {
                    const isRevealed = player.revealedIndices[index];
                    return (
                        <div
                            key={index}
                            className={`w-10 h-12 md:w-12 md:h-14 flex items-center justify-center rounded-xl font-bold text-xl shadow-lg transition-all duration-500 relative
                            ${isRevealed
                                    ? 'bg-gradient-to-br from-indigo-100 to-indigo-300 text-indigo-900 shadow-[0_4px_10px_rgba(99,102,241,0.4)] transform scale-100 rotate-0'
                                    : 'bg-slate-800/50 text-slate-600 border border-slate-700/50 inner-shadow transform'
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
    const { players, currentPlayerIndex, attack, logs, attackCount, attackedKanas } = useGameStore();
    const currentPlayer = players[currentPlayerIndex];

    const logsStartRef = useRef<HTMLDivElement>(null);

    // Auto-scroll logs to top (newest first)
    useEffect(() => {
        // Small delay to ensure DOM is updated
        const timer = setTimeout(() => {
            logsStartRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 50);
        return () => clearTimeout(timer);
    }, [logs]);

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

    return (
        <div className="flex flex-col md:flex-row h-screen overflow-hidden text-slate-200 relative z-10">
            {/* Left: Board & Logs */}
            <div className="flex-1 p-4 md:p-8 overflow-y-auto space-y-6 pb-40 md:pb-8 scrollbar-thin scrollbar-thumb-indigo-500/30 scrollbar-track-transparent">
                <div>
                    <h2 className="text-sm font-bold text-indigo-300 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <span className="text-lg">👥</span> 参加者
                    </h2>
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                        {players.map((p, i) => (
                            <PlayerBoard key={p.id} player={p} isCurrent={i === currentPlayerIndex} />
                        ))}
                    </div>
                </div>

                <div className="flex-1 min-h-[200px]">
                    <h2 className="text-sm font-bold text-indigo-300 uppercase tracking-widest mb-2 flex items-center gap-2">
                        <span className="text-lg">📜</span> バトルログ
                    </h2>
                    <div className="glass rounded-2xl p-4 h-64 overflow-y-auto space-y-3 font-sans text-sm border-0 shadow-inner scrollbar-thin scrollbar-thumb-slate-600/50">
                        {logs.length === 0 && <div className="text-slate-500 text-center py-10">バトル開始！</div>}
                        <div ref={logsStartRef} />
                        {logs.map((log) => (
                            <div key={log.id} className={`flex items-start gap-3 px-3 py-2 rounded-xl transition-all animate-in slide-in-from-left-2 duration-300
                                ${log.type === 'attack' ? 'bg-cyan-950/20 border border-cyan-500/10' : ''}
                                ${log.type === 'damage' ? 'bg-rose-950/30 border border-rose-500/20' : ''}
                                ${log.type === 'elimination' ? 'bg-amber-950/40 border border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.1)]' : ''}
                                ${log.type === 'info' ? 'text-slate-400' : ''}
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
                </div>
            </div>

            {/* Right: Controls (Keyboard) */}
            <div className="w-full md:w-[450px] glass-strong p-6 shadow-[-10px_0_30px_rgba(0,0,0,0.3)] flex flex-col border-t md:border-t-0 md:border-l border-white/10 z-20 backdrop-blur-2xl">
                <div className="mb-6 text-center">
                    <h3 className="text-indigo-300 text-xs font-bold uppercase tracking-widest mb-2">現在のターン</h3>
                    <div className="text-4xl font-heading font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-cyan-300 to-indigo-300 my-3 drop-shadow-sm animate-pulse">
                        {currentPlayer.name}
                    </div>
                    <div className="inline-flex items-center gap-2 bg-indigo-950/40 border border-indigo-500/30 rounded-full py-1.5 px-5 shadow-inner">
                        <span className="text-indigo-200 text-sm">アクション</span>
                        <span className="font-heading font-bold text-xl text-white">{attackCount + 1}</span>
                        <span className="text-indigo-200 text-xs">/ 2 (ヒット時)</span>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto scrollbar-none">
                    <div className="grid grid-cols-10 gap-1.5 p-1">
                        {KANA_COLS.flat().map((char, i) => {
                            if (!char) return <div key={i} />;
                            const status = getKanaStatus(char);

                            return (
                                <button
                                    key={i}
                                    onClick={() => attack(char)}
                                    disabled={status !== 'neutral'}
                                    className={`
                                        aspect-square flex items-center justify-center rounded-lg font-bold text-base md:text-lg transition-all duration-200 relative overflow-hidden group
                                        ${status === 'hit'
                                            ? 'bg-emerald-600/80 text-white shadow-[0_0_10px_rgba(16,185,129,0.5)] scale-95 border-none cursor-not-allowed'
                                            : status === 'miss'
                                                ? 'bg-slate-800/30 text-slate-600 scale-95 border border-slate-700/30 cursor-not-allowed line-through decoration-2'
                                                : 'bg-slate-700/40 hover:bg-indigo-600/60 text-slate-300 hover:text-white border border-white/5 hover:border-indigo-400/50 active:scale-90'}
                                    `}
                                >
                                    <span className="relative z-10">{char}</span>
                                    {status === 'neutral' && <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};
