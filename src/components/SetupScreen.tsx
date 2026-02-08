import { useState } from 'react';
import { useGameStore } from '../store/gameStore';

export const SetupScreen = () => {
    const initGame = useGameStore((state) => state.initGame);
    const [theme, setTheme] = useState('動物');
    const [playerCount, setPlayerCount] = useState(2);
    const [playerNames, setPlayerNames] = useState(['Player 1', 'Player 2']);

    const handleStart = () => {
        initGame(theme || 'なんでも', playerNames);
    };

    const updatePlayerName = (index: number, name: string) => {
        const newNames = [...playerNames];
        newNames[index] = name;
        setPlayerNames(newNames);
    };

    const handlePlayerCountChange = (count: number) => {
        setPlayerCount(count);
        const newNames = Array(count).fill('').map((_, i) => playerNames[i] || `Player ${i + 1}`);
        setPlayerNames(newNames);
    };

    const setRandomTheme = () => {
        const themes = ["動物", "食べ物", "国名", "スポーツ", "職業", "学校にあるもの", "キッチンにあるもの", "赤いもの", "4文字の言葉"];
        const random = themes[Math.floor(Math.random() * themes.length)];
        setTheme(random);
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 relative z-10">
            <h1 className="text-6xl md:text-8xl font-heading font-black mb-12 text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-orange-400 to-red-400 drop-shadow-lg tracking-tight animate-float">
                あいうえバトル
            </h1>

            <div className="glass p-8 md:p-10 rounded-3xl shadow-2xl w-full max-w-lg space-y-10 backdrop-blur-xl border border-white/10">
                {/* Theme Input */}
                <div className="space-y-3">
                    <label className="block text-sm font-bold text-indigo-300 tracking-wider">お題 (THEME)</label>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={theme}
                            onChange={(e) => setTheme(e.target.value)}
                            className="flex-1 px-6 py-4 rounded-xl bg-slate-900/60 border border-indigo-500/30 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/20 focus:outline-none transition-all placeholder:text-slate-600 text-lg font-bold text-white shadow-inner"
                            placeholder="例：動物、食べ物"
                        />
                        <button
                            onClick={setRandomTheme}
                            className="px-4 py-3 bg-indigo-600/20 hover:bg-indigo-600/40 border border-indigo-500/30 rounded-xl text-indigo-300 transition-all active:scale-95"
                            title="ランダムなお題"
                        >
                            <span className="text-2xl">🎲</span>
                        </button>
                    </div>
                </div>

                {/* Player Count */}
                <div className="space-y-3">
                    <label className="block text-sm font-bold text-indigo-300 tracking-wider">参加人数 (PLAYERS)</label>
                    <div className="flex gap-3 bg-slate-900/40 p-1.5 rounded-xl border border-white/5">
                        {[2, 3, 4].map((count) => (
                            <button
                                key={count}
                                onClick={() => handlePlayerCountChange(count)}
                                className={`flex-1 py-3 rounded-lg transition-all duration-300 font-bold text-lg ${playerCount === count
                                    ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/30 ring-1 ring-white/20'
                                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                                    }`}
                            >
                                {count}人
                            </button>
                        ))}
                    </div>
                </div>

                {/* Player Names */}
                <div className="space-y-3">
                    <label className="block text-sm font-bold text-indigo-300 tracking-wider">名前 (NAMES)</label>
                    <div className="space-y-3">
                        {playerNames.map((name, idx) => (
                            <div key={idx} className="relative group">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-mono text-xs">P{idx + 1}</span>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => updatePlayerName(idx, e.target.value)}
                                    className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-slate-900/50 border border-slate-700/50 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20 focus:outline-none transition-all placeholder:text-slate-700 text-slate-200 focus:bg-slate-900/80"
                                    placeholder={`プレイヤー ${idx + 1}`}
                                />
                            </div>
                        ))}
                    </div>
                </div>

                <button
                    onClick={handleStart}
                    className="w-full py-5 bg-gradient-to-r from-emerald-500 to-teal-400 border-t border-white/20 text-white font-heading font-bold text-2xl rounded-2xl hover:brightness-110 hover:shadow-emerald-500/20 hover:-translate-y-0.5 active:scale-95 active:translate-y-0 transition-all shadow-xl shadow-emerald-900/30 mt-4 relative overflow-hidden group"
                >
                    <span className="relative z-10">ゲーム開始！</span>
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out blur-xl"></div>
                </button>
            </div>
        </div>
    );
};
