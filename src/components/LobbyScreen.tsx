import { useState, useEffect } from 'react';
import { useGameStore } from '../store/gameStore';

export const LobbyScreen = () => {
    const {
        roomId,
        isHost,
        players,
        loading,
        error,
        myPlayerId,
        createRoom,
        joinRoom,
        setTheme,
        startGame,
        subscribeToRoom,
    } = useGameStore();

    const [mode, setMode] = useState<'select' | 'create' | 'join'>('select');
    const [playerName, setPlayerName] = useState('');
    const [inputRoomId, setInputRoomId] = useState('');
    const [localTheme, setLocalTheme] = useState('動物');

    // Check URL for room ID
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const urlRoomId = params.get('room');
        if (urlRoomId) {
            setInputRoomId(urlRoomId);
            setMode('join');
        }
    }, []);

    // Subscribe to room updates when in a room
    useEffect(() => {
        if (roomId) {
            const unsubscribe = subscribeToRoom();
            return unsubscribe;
        }
    }, [roomId, subscribeToRoom]);

    const handleCreate = async () => {
        if (!playerName.trim()) return;
        const newRoomId = await createRoom(playerName.trim());
        if (newRoomId) {
            window.history.pushState({}, '', `?room=${newRoomId}`);
        }
    };

    const handleJoin = async () => {
        if (!playerName.trim() || !inputRoomId.trim()) return;
        await joinRoom(inputRoomId.trim(), playerName.trim());
    };

    const handleStartGame = async () => {
        await setTheme(localTheme || 'なんでも');
        await startGame();
    };

    const copyRoomLink = () => {
        const url = `${window.location.origin}${window.location.pathname}?room=${roomId}`;
        navigator.clipboard.writeText(url);
    };

    const setRandomTheme = () => {
        const themes = ["動物", "食べ物", "国名", "スポーツ", "職業", "学校にあるもの", "キッチンにあるもの", "赤いもの", "4文字の言葉"];
        setLocalTheme(themes[Math.floor(Math.random() * themes.length)]);
    };

    // In a room - show lobby
    if (roomId) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-4 relative z-10">
                <h1 className="text-5xl md:text-7xl font-heading font-black mb-8 text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-orange-400 to-red-400 drop-shadow-lg tracking-tight">
                    KanaClash
                </h1>

                <div className="glass p-8 md:p-10 rounded-3xl shadow-2xl w-full max-w-lg space-y-8 backdrop-blur-xl border border-white/10">
                    {/* Room Info */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-bold text-indigo-300 uppercase tracking-widest">ルームID</span>
                            <button
                                onClick={copyRoomLink}
                                className="text-xs bg-indigo-600/30 hover:bg-indigo-600/50 px-3 py-1.5 rounded-full transition-all"
                            >
                                📋 リンクをコピー
                            </button>
                        </div>
                        <div className="bg-slate-900/60 p-4 rounded-xl text-center font-mono text-lg text-white break-all">
                            {roomId}
                        </div>
                    </div>

                    {/* Theme (Host only) */}
                    {isHost && (
                        <div className="space-y-3">
                            <label className="block text-sm font-bold text-indigo-300 tracking-wider">お題 (THEME)</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={localTheme}
                                    onChange={(e) => setLocalTheme(e.target.value)}
                                    className="flex-1 px-4 py-3 rounded-xl bg-slate-900/60 border border-indigo-500/30 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none text-white"
                                    placeholder="例：動物、食べ物"
                                />
                                <button
                                    onClick={setRandomTheme}
                                    className="px-4 py-3 bg-indigo-600/20 hover:bg-indigo-600/40 border border-indigo-500/30 rounded-xl text-indigo-300 transition-all"
                                >
                                    🎲
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Players */}
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-bold text-indigo-300 uppercase tracking-widest">
                                参加者 ({players.length}/4)
                            </span>
                        </div>
                        <div className="space-y-2">
                            {players.map((player, idx) => (
                                <div
                                    key={player.id}
                                    className={`flex items-center justify-between p-3 rounded-xl transition-all ${player.id === myPlayerId
                                        ? 'bg-indigo-600/30 border border-indigo-400/50'
                                        : 'bg-slate-900/40 border border-white/5'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="text-slate-500 text-sm font-mono">P{idx + 1}</span>
                                        <span className="font-bold">{player.name}</span>
                                        {player.id === myPlayerId && (
                                            <span className="text-xs bg-indigo-500 px-2 py-0.5 rounded-full">あなた</span>
                                        )}
                                    </div>
                                    {isHost && players[0]?.id === player.id && (
                                        <span className="text-xs text-yellow-400">👑 ホスト</span>
                                    )}
                                </div>
                            ))}

                            {players.length < 4 && (
                                <div className="p-3 rounded-xl bg-slate-900/20 border border-dashed border-slate-700/50 text-slate-600 text-center">
                                    待機中...
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Start Button (Host only) */}
                    {isHost ? (
                        <button
                            onClick={handleStartGame}
                            disabled={players.length < 2}
                            className="w-full py-5 bg-gradient-to-r from-emerald-500 to-teal-400 text-white font-heading font-bold text-2xl rounded-2xl hover:brightness-110 active:scale-95 transition-all shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {players.length < 2 ? '2人以上必要です' : 'ゲーム開始！'}
                        </button>
                    ) : (
                        <div className="text-center text-slate-400 py-4">
                            ホストがゲームを開始するのを待っています...
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // Not in a room - show create/join options
    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 relative z-10">
            <h1 className="text-6xl md:text-8xl font-heading font-black mb-12 text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-orange-400 to-red-400 drop-shadow-lg tracking-tight animate-float">
                KanaClash
            </h1>

            <div className="glass p-8 md:p-10 rounded-3xl shadow-2xl w-full max-w-lg space-y-8 backdrop-blur-xl border border-white/10">
                {error && (
                    <div className="bg-red-500/20 border border-red-500/30 text-red-300 px-4 py-3 rounded-xl">
                        ⚠️ {error}
                    </div>
                )}

                {mode === 'select' && (
                    <div className="space-y-4">
                        <button
                            onClick={() => setMode('create')}
                            className="w-full py-5 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-heading font-bold text-xl rounded-2xl hover:brightness-110 active:scale-95 transition-all shadow-xl"
                        >
                            ルームを作成
                        </button>
                        <button
                            onClick={() => setMode('join')}
                            className="w-full py-5 bg-slate-700/50 hover:bg-slate-700/70 text-white font-heading font-bold text-xl rounded-2xl transition-all border border-white/10"
                        >
                            ルームに参加
                        </button>
                    </div>
                )}

                {mode === 'create' && (
                    <div className="space-y-6">
                        <button
                            onClick={() => setMode('select')}
                            className="text-slate-400 hover:text-white transition-colors"
                        >
                            ← 戻る
                        </button>

                        <div className="space-y-3">
                            <label className="block text-sm font-bold text-indigo-300 tracking-wider">あなたの名前</label>
                            <input
                                type="text"
                                value={playerName}
                                onChange={(e) => setPlayerName(e.target.value)}
                                className="w-full px-6 py-4 rounded-xl bg-slate-900/60 border border-indigo-500/30 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/20 focus:outline-none text-lg text-white"
                                placeholder="名前を入力"
                                autoFocus
                            />
                        </div>

                        <button
                            onClick={handleCreate}
                            disabled={!playerName.trim() || loading}
                            className="w-full py-5 bg-gradient-to-r from-emerald-500 to-teal-400 text-white font-heading font-bold text-xl rounded-2xl hover:brightness-110 active:scale-95 transition-all shadow-xl disabled:opacity-50"
                        >
                            {loading ? '作成中...' : 'ルームを作成'}
                        </button>
                    </div>
                )}

                {mode === 'join' && (
                    <div className="space-y-6">
                        <button
                            onClick={() => setMode('select')}
                            className="text-slate-400 hover:text-white transition-colors"
                        >
                            ← 戻る
                        </button>

                        <div className="space-y-3">
                            <label className="block text-sm font-bold text-indigo-300 tracking-wider">あなたの名前</label>
                            <input
                                type="text"
                                value={playerName}
                                onChange={(e) => setPlayerName(e.target.value)}
                                className="w-full px-6 py-4 rounded-xl bg-slate-900/60 border border-indigo-500/30 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/20 focus:outline-none text-lg text-white"
                                placeholder="名前を入力"
                                autoFocus
                            />
                        </div>

                        <div className="space-y-3">
                            <label className="block text-sm font-bold text-indigo-300 tracking-wider">ルームID</label>
                            <input
                                type="text"
                                value={inputRoomId}
                                onChange={(e) => setInputRoomId(e.target.value)}
                                className="w-full px-6 py-4 rounded-xl bg-slate-900/60 border border-indigo-500/30 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/20 focus:outline-none text-lg text-white font-mono"
                                placeholder="ルームIDを入力"
                            />
                        </div>

                        <button
                            onClick={handleJoin}
                            disabled={!playerName.trim() || !inputRoomId.trim() || loading}
                            className="w-full py-5 bg-gradient-to-r from-emerald-500 to-teal-400 text-white font-heading font-bold text-xl rounded-2xl hover:brightness-110 active:scale-95 transition-all shadow-xl disabled:opacity-50"
                        >
                            {loading ? '参加中...' : 'ルームに参加'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
