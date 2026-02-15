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
                <h1 className="text-5xl md:text-7xl font-heading font-bold mb-8 text-kinari text-shadow-lg tracking-wider">
                    <span className="text-kin">Kana</span><span className="text-shu">Clash</span>
                </h1>

                <div className="washi p-8 md:p-10 rounded-2xl w-full max-w-lg space-y-8">
                    {/* Room Info */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-bold text-kin tracking-widest font-heading">ルームID</span>
                            <button
                                onClick={copyRoomLink}
                                className="text-xs bg-kin/10 hover:bg-kin/20 text-kin-light px-3 py-1.5 rounded-full transition-all border border-kin/20"
                            >
                                📋 リンクをコピー
                            </button>
                        </div>
                        <div className="bg-sumi/60 p-4 rounded-xl text-center font-mono text-lg text-kinari break-all border border-kin/10">
                            {roomId}
                        </div>
                    </div>

                    {/* Theme (Host only) */}
                    {isHost && (
                        <div className="space-y-3">
                            <label className="block text-sm font-bold text-kin tracking-wider font-heading">お題</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={localTheme}
                                    onChange={(e) => setLocalTheme(e.target.value)}
                                    className="flex-1 px-4 py-3 rounded-xl bg-sumi/60 border border-kin/20 focus:border-kin focus:ring-2 focus:ring-kin/20 focus:outline-none text-kinari"
                                    placeholder="例：動物、食べ物"
                                />
                                <button
                                    onClick={setRandomTheme}
                                    className="px-4 py-3 bg-sumi/40 hover:bg-sumi/60 border border-kin/20 rounded-xl text-kin transition-all"
                                >
                                    🎲
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Players */}
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-bold text-kin tracking-widest font-heading">
                                参加者 ({players.length}/4)
                            </span>
                        </div>
                        <div className="space-y-2">
                            {players.map((player, idx) => (
                                <div
                                    key={player.id}
                                    className={`flex items-center justify-between p-3 rounded-xl transition-all ${player.id === myPlayerId
                                        ? 'bg-shu/10 border border-shu/30'
                                        : 'bg-sumi/30 border border-kin/5'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="text-hai text-sm font-mono">P{idx + 1}</span>
                                        <span className="font-bold text-kinari">{player.name}</span>
                                        {player.id === myPlayerId && (
                                            <span className="text-xs bg-shu/80 px-2 py-0.5 rounded-full text-kinari">あなた</span>
                                        )}
                                    </div>
                                    {isHost && players[0]?.id === player.id && (
                                        <span className="text-xs text-kin">👑 ホスト</span>
                                    )}
                                </div>
                            ))}

                            {players.length < 4 && (
                                <div className="p-3 rounded-xl bg-sumi/10 border border-dashed border-hai/20 text-hai text-center">
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
                            className="w-full py-5 bg-gradient-to-r from-shu to-shu-dark text-kinari font-heading font-bold text-2xl rounded-xl hover:brightness-110 active:scale-95 transition-all shadow-xl border-b-4 border-shu-dark/50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {players.length < 2 ? '2人以上必要です' : 'ゲーム開始'}
                        </button>
                    ) : (
                        <div className="text-center text-hai py-4 font-heading">
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
            <h1 className="text-6xl md:text-8xl font-heading font-bold mb-12 tracking-wider animate-float text-shadow-lg">
                <span className="text-kin">Kana</span><span className="text-shu">Clash</span>
            </h1>

            <div className="washi p-8 md:p-10 rounded-2xl w-full max-w-lg space-y-8">
                {error && (
                    <div className="bg-shu/10 border border-shu/30 text-shu-light px-4 py-3 rounded-xl">
                        ⚠️ {error}
                    </div>
                )}

                {mode === 'select' && (
                    <div className="space-y-4">
                        <button
                            onClick={() => setMode('create')}
                            className="w-full py-5 bg-gradient-to-r from-shu to-shu-dark text-kinari font-heading font-bold text-xl rounded-xl hover:brightness-110 active:scale-95 transition-all shadow-xl border-b-4 border-shu-dark/50"
                        >
                            ルームを作成
                        </button>
                        <button
                            onClick={() => setMode('join')}
                            className="w-full py-5 bg-sumi/50 hover:bg-sumi/70 text-kinari font-heading font-bold text-xl rounded-xl transition-all border border-kin/10 border-b-4 border-sumi/80"
                        >
                            ルームに参加
                        </button>
                    </div>
                )}

                {mode === 'create' && (
                    <div className="space-y-6">
                        <button
                            onClick={() => setMode('select')}
                            className="text-hai hover:text-kinari transition-colors font-heading"
                        >
                            ← 戻る
                        </button>

                        <div className="space-y-3">
                            <label className="block text-sm font-bold text-kin tracking-wider font-heading">あなたの名前</label>
                            <input
                                type="text"
                                value={playerName}
                                onChange={(e) => setPlayerName(e.target.value)}
                                className="w-full px-6 py-4 rounded-xl bg-sumi/60 border border-kin/20 focus:border-kin focus:ring-4 focus:ring-kin/10 focus:outline-none text-lg text-kinari"
                                placeholder="名前を入力"
                                autoFocus
                            />
                        </div>

                        <button
                            onClick={handleCreate}
                            disabled={!playerName.trim() || loading}
                            className="w-full py-5 bg-gradient-to-r from-shu to-shu-dark text-kinari font-heading font-bold text-xl rounded-xl hover:brightness-110 active:scale-95 transition-all shadow-xl border-b-4 border-shu-dark/50 disabled:opacity-50"
                        >
                            {loading ? '作成中...' : 'ルームを作成'}
                        </button>
                    </div>
                )}

                {mode === 'join' && (
                    <div className="space-y-6">
                        <button
                            onClick={() => setMode('select')}
                            className="text-hai hover:text-kinari transition-colors font-heading"
                        >
                            ← 戻る
                        </button>

                        <div className="space-y-3">
                            <label className="block text-sm font-bold text-kin tracking-wider font-heading">あなたの名前</label>
                            <input
                                type="text"
                                value={playerName}
                                onChange={(e) => setPlayerName(e.target.value)}
                                className="w-full px-6 py-4 rounded-xl bg-sumi/60 border border-kin/20 focus:border-kin focus:ring-4 focus:ring-kin/10 focus:outline-none text-lg text-kinari"
                                placeholder="名前を入力"
                                autoFocus
                            />
                        </div>

                        <div className="space-y-3">
                            <label className="block text-sm font-bold text-kin tracking-wider font-heading">ルームID</label>
                            <input
                                type="text"
                                value={inputRoomId}
                                onChange={(e) => setInputRoomId(e.target.value)}
                                className="w-full px-6 py-4 rounded-xl bg-sumi/60 border border-kin/20 focus:border-kin focus:ring-4 focus:ring-kin/10 focus:outline-none text-lg text-kinari font-mono"
                                placeholder="ルームIDを入力"
                            />
                        </div>

                        <button
                            onClick={handleJoin}
                            disabled={!playerName.trim() || !inputRoomId.trim() || loading}
                            className="w-full py-5 bg-gradient-to-r from-shu to-shu-dark text-kinari font-heading font-bold text-xl rounded-xl hover:brightness-110 active:scale-95 transition-all shadow-xl border-b-4 border-shu-dark/50 disabled:opacity-50"
                        >
                            {loading ? '参加中...' : 'ルームに参加'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
