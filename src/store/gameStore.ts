import { create } from 'zustand';
import { supabase, type DbPlayer } from '../lib/supabase';
import { normalizeKana } from '../utils/kana';

export type Phase = 'LOBBY' | 'INPUT' | 'BATTLE' | 'GAMEOVER';

export interface Player {
    id: string;
    name: string;
    displayWord: string[];
    revealedIndices: boolean[];
    isEliminated: boolean;
    isWinner: boolean;
}

export interface GameLog {
    id: string;
    message: string;
    type: 'info' | 'attack' | 'damage' | 'elimination';
}

// Get or create player ID from session storage
const getOrCreatePlayerId = (): string => {
    let playerId = sessionStorage.getItem('kanaclash_player_id');
    if (!playerId) {
        playerId = crypto.randomUUID();
        sessionStorage.setItem('kanaclash_player_id', playerId);
    }
    return playerId;
};

interface GameState {
    // Room state
    roomId: string | null;
    isHost: boolean;
    myPlayerId: string;

    // Game state
    phase: Phase;
    theme: string;
    players: Player[];
    currentPlayerIndex: number;
    attackCount: number;
    logs: GameLog[];
    winnerId: string | null;
    attackedKanas: Set<string>;

    // Connection state
    isOnline: boolean;
    loading: boolean;
    error: string | null;

    // Actions
    createRoom: (hostName: string) => Promise<string | null>;
    joinRoom: (roomId: string, playerName: string) => Promise<boolean>;
    leaveRoom: () => void;
    setTheme: (theme: string) => Promise<void>;
    startGame: () => Promise<void>;
    setMyWord: (word: string) => Promise<void>;
    attack: (kana: string) => Promise<void>;
    restartGame: () => void;
    subscribeToRoom: () => () => void;
}

export const useGameStore = create<GameState>((set, get) => ({
    // Initial state
    roomId: null,
    isHost: false,
    myPlayerId: getOrCreatePlayerId(),
    phase: 'LOBBY',
    theme: '',
    players: [],
    currentPlayerIndex: 0,
    attackCount: 0,
    logs: [],
    winnerId: null,
    attackedKanas: new Set<string>(),
    isOnline: !!supabase,
    loading: false,
    error: null,

    createRoom: async (hostName: string) => {
        if (!supabase) {
            set({ error: 'Supabase not configured - check environment variables' });
            return null;
        }

        set({ loading: true, error: null });
        const myPlayerId = get().myPlayerId;

        try {
            // Clean up: delete any existing player records for this player
            await supabase.from('players').delete().eq('id', myPlayerId);

            // Housekeeping: delete rooms older than 24 hours
            const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
            await supabase.from('rooms').delete().lt('created_at', yesterday);

            console.log('Creating room with host_id:', myPlayerId);

            // Generate 6-digit room ID (100000-999999)
            const generateRoomId = () => {
                return String(Math.floor(100000 + Math.random() * 900000));
            };

            let roomId = generateRoomId();
            let attempts = 0;
            let roomData = null;
            let roomError = null;

            // Try up to 5 times in case of ID collision
            while (attempts < 5) {
                const result = await supabase
                    .from('rooms')
                    .insert({
                        id: roomId,
                        host_id: myPlayerId,
                        phase: 'LOBBY',
                        theme: '',
                    })
                    .select()
                    .single();

                if (!result.error) {
                    roomData = result.data;
                    break;
                }

                // If duplicate key error, try another ID
                if (result.error.code === '23505') {
                    roomId = generateRoomId();
                    attempts++;
                } else {
                    roomError = result.error;
                    break;
                }
            }

            if (roomError || !roomData) {
                console.error('Room creation error:', roomError);
                throw new Error(`Room error: ${roomError?.message || 'Failed after retries'} (${roomError?.code || 'unknown'})`);
            }

            console.log('Room created:', roomData);

            const { error: playerError } = await supabase
                .from('players')
                .insert({
                    id: myPlayerId,
                    room_id: roomData.id,
                    name: hostName,
                    player_order: 0,
                });

            if (playerError) {
                console.error('Player creation error:', playerError);
                throw new Error(`Player error: ${playerError.message} (${playerError.code})`);
            }

            set({
                roomId: roomData.id,
                isHost: true,
                phase: 'LOBBY',
                players: [{
                    id: myPlayerId,
                    name: hostName,
                    displayWord: [],
                    revealedIndices: new Array(7).fill(false),
                    isEliminated: false,
                    isWinner: false,
                }],
                loading: false,
            });

            return roomData.id;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to create room';
            console.error('Create room failed:', err);
            set({ error: errorMessage, loading: false });
            return null;
        }
    },

    joinRoom: async (roomId: string, playerName: string) => {
        if (!supabase) {
            set({ error: 'Supabase not configured' });
            return false;
        }

        set({ loading: true, error: null });
        const myPlayerId = get().myPlayerId;

        try {
            // Clean up: delete any existing player records for this player
            await supabase.from('players').delete().eq('id', myPlayerId);

            const { data: roomData, error: roomError } = await supabase
                .from('rooms')
                .select()
                .eq('id', roomId)
                .single();

            if (roomError) throw new Error('ルームが見つかりません');
            if (roomData.phase !== 'LOBBY') throw new Error('ゲームが既に開始しています');

            const { count } = await supabase
                .from('players')
                .select('*', { count: 'exact', head: true })
                .eq('room_id', roomId);

            if ((count || 0) >= 4) throw new Error('ルームが満員です');

            const { data: existingPlayer } = await supabase
                .from('players')
                .select()
                .eq('room_id', roomId)
                .eq('id', myPlayerId)
                .single();

            if (!existingPlayer) {
                const { error: playerError } = await supabase
                    .from('players')
                    .insert({
                        id: myPlayerId,
                        room_id: roomId,
                        name: playerName,
                        player_order: count || 0,
                    });

                if (playerError) throw playerError;
            }

            set({
                roomId: roomId,
                isHost: roomData.host_id === myPlayerId,
                phase: roomData.phase as Phase,
                theme: roomData.theme || '',
                loading: false,
            });

            return true;
        } catch (err) {
            set({ error: err instanceof Error ? err.message : 'Failed to join room', loading: false });
            return false;
        }
    },

    leaveRoom: () => {
        const { roomId, myPlayerId } = get();
        if (supabase && roomId) {
            supabase.from('players').delete().eq('id', myPlayerId).eq('room_id', roomId);
        }
        set({
            roomId: null,
            isHost: false,
            phase: 'LOBBY',
            theme: '',
            players: [],
            currentPlayerIndex: 0,
            attackCount: 0,
            logs: [],
            winnerId: null,
            attackedKanas: new Set(),
        });
    },

    setTheme: async (theme: string) => {
        const { roomId, isHost } = get();
        if (!supabase || !roomId || !isHost) return;

        await supabase.from('rooms').update({ theme }).eq('id', roomId);
        set({ theme });
    },

    startGame: async () => {
        const { roomId, isHost, theme } = get();
        if (!supabase || !roomId || !isHost) return;

        // Reset room state
        await supabase.from('rooms').update({
            phase: 'INPUT',
            theme: theme || 'なんでも',
            current_player_index: 0,
            attack_count: 0,
            attacked_kanas: [],
        }).eq('id', roomId);

        // Reset all players' game state
        await supabase.from('players').update({
            display_word: [],
            revealed_indices: [false, false, false, false, false, false, false],
            is_eliminated: false,
            is_winner: false,
        }).eq('room_id', roomId);

        // Reset local state
        set({
            logs: [],
            winnerId: null,
            currentPlayerIndex: 0,
            attackCount: 0,
            attackedKanas: new Set(),
        });
    },

    setMyWord: async (word: string) => {
        const { roomId, myPlayerId, players } = get();
        if (!supabase || !roomId) return;

        const normalized = normalizeKana(word);
        const displayWord = normalized.split('');
        while (displayWord.length < 7) {
            displayWord.push('×');
        }

        // Update in Supabase
        await supabase.from('players').update({
            display_word: displayWord,
            revealed_indices: new Array(7).fill(false),
        }).eq('id', myPlayerId).eq('room_id', roomId);

        // Also update local state immediately
        const updatedPlayers = players.map(p =>
            p.id === myPlayerId
                ? { ...p, displayWord, revealedIndices: new Array(7).fill(false) }
                : p
        );
        set({ players: updatedPlayers });

        // Immediately check if all players have words and transition to BATTLE
        // Fetch fresh data from server to avoid race condition
        const { data: freshPlayers } = await supabase
            .from('players')
            .select()
            .eq('room_id', roomId);

        if (freshPlayers && freshPlayers.length >= 2) {
            const allHaveWords = freshPlayers.every((p: DbPlayer) =>
                p.display_word && p.display_word.length > 0 && p.display_word[0] !== ''
            );
            if (allHaveWords) {
                await supabase.from('rooms').update({ phase: 'BATTLE' }).eq('id', roomId);
            }
        }
    },

    attack: async (kana: string) => {
        const { roomId, players, currentPlayerIndex, attackCount, attackedKanas, logs } = get();
        if (!supabase || !roomId) return;

        const attacker = players[currentPlayerIndex];
        let hit = false;
        const newLogs: GameLog[] = [...logs];

        newLogs.unshift({
            id: Date.now().toString() + '-atk',
            message: `${attacker.name} の攻撃: "${kana}"`,
            type: 'attack',
        });

        // Process attack for each player
        for (const player of players) {
            let playerHit = false;
            const newRevealed = player.displayWord.map((char, idx) => {
                if (player.revealedIndices[idx]) return true;
                if (char === kana) {
                    playerHit = true;
                    return true;
                }
                return false;
            });

            if (playerHit) {
                hit = true;
                newLogs.unshift({
                    id: Date.now().toString() + `-hit-${player.name}`,
                    message: `${player.name} にヒット！`,
                    type: 'damage',
                });

                // Check elimination
                const isAlive = player.displayWord.some((char, idx) => char !== '×' && !newRevealed[idx]);

                // Update player in database
                await supabase.from('players').update({
                    revealed_indices: newRevealed,
                    is_eliminated: !isAlive,
                }).eq('id', player.id).eq('room_id', roomId);

                // Update local player object for immediate win check
                if (!isAlive) {
                    player.isEliminated = true;
                }
            }
        }

        // Calculate next turn
        let nextIndex = currentPlayerIndex;
        let nextAttackCount = attackCount;

        if (hit) {
            if (attackCount < 1) {
                nextAttackCount++;
                newLogs.unshift({
                    id: Date.now().toString() + '-bonus',
                    message: `${attacker.name} はもう一度攻撃できます！`,
                    type: 'info',
                });
            } else {
                nextIndex = (currentPlayerIndex + 1) % players.length;
                nextAttackCount = 0;
            }
        } else {
            newLogs.unshift({
                id: Date.now().toString() + '-miss',
                message: `ミス！`,
                type: 'info',
            });
            nextIndex = (currentPlayerIndex + 1) % players.length;
            nextAttackCount = 0;
        }

        // Skip eliminated players
        let attempts = 0;
        // Use updated players list (with isEliminated updated above)
        const currentPlayers = get().players;
        while (currentPlayers[nextIndex]?.isEliminated && attempts < currentPlayers.length) {
            nextIndex = (nextIndex + 1) % currentPlayers.length;
            attempts++;
        }

        // Check win condition
        const activePlayers = currentPlayers.filter(p => !p.isEliminated);
        let newPhase: Phase = 'BATTLE';
        let winnerId = null;

        if (activePlayers.length <= 1) {
            newPhase = 'GAMEOVER';
            if (activePlayers.length === 1) {
                winnerId = activePlayers[0].id;
                newLogs.unshift({
                    id: Date.now().toString() + '-win',
                    message: `${activePlayers[0].name} の勝利！`,
                    type: 'elimination',
                });

                await supabase.from('players').update({ is_winner: true })
                    .eq('id', winnerId).eq('room_id', roomId);
            }
        }

        const newAttackedKanas = new Set(attackedKanas);
        newAttackedKanas.add(kana);

        // Update room state
        await supabase.from('rooms').update({
            current_player_index: nextIndex,
            attack_count: nextAttackCount,
            phase: newPhase,
            attacked_kanas: Array.from(newAttackedKanas),
        }).eq('id', roomId);

        set({
            logs: newLogs,
            winnerId,
            phase: newPhase, // Immediately update phase locally
        });
    },

    restartGame: async () => {
        const { roomId, isHost } = get();
        if (!supabase || !roomId || !isHost) return;

        // Reset room state
        await supabase.from('rooms').update({
            phase: 'LOBBY',
            theme: '',
            current_player_index: 0,
            attack_count: 0,
            attacked_kanas: [],
        }).eq('id', roomId);

        // Reset all players' game state
        await supabase.from('players').update({
            display_word: [],
            revealed_indices: [false, false, false, false, false, false, false],
            is_eliminated: false,
            is_winner: false,
        }).eq('room_id', roomId);

        // Reset local state
        set({
            phase: 'LOBBY',
            theme: '',
            logs: [],
            winnerId: null,
            currentPlayerIndex: 0,
            attackCount: 0,
            attackedKanas: new Set(),
            players: get().players.map(p => ({
                ...p,
                displayWord: [],
                revealedIndices: new Array(7).fill(false),
                isEliminated: false,
                isWinner: false
            }))
        });
    },

    subscribeToRoom: () => {
        const { roomId } = get();
        if (!supabase || !roomId) return () => { };

        const fetchPlayers = async () => {
            if (!supabase) return;
            const { data } = await supabase
                .from('players')
                .select()
                .eq('room_id', roomId)
                .order('player_order');

            if (data) {
                const players: Player[] = data.map((p: DbPlayer) => ({
                    id: p.id,
                    name: p.name,
                    displayWord: p.display_word || [],
                    revealedIndices: p.revealed_indices || new Array(7).fill(false),
                    isEliminated: p.is_eliminated,
                    isWinner: p.is_winner,
                }));
                set({ players });

                // Check if all players have words (for auto-transition to BATTLE)
                const { phase } = get();
                // Update winnerId based on fetched players
                const winner = players.find(p => p.isWinner);
                // Only update winnerId if we are in GAMEOVER or if it changed (to void resetting it prematurely)
                if (phase === 'GAMEOVER' || winner) {
                    set({ winnerId: winner ? winner.id : null });
                }

                if (phase === 'INPUT' && players.length >= 2) {
                    const allHaveWords = players.every(p => p.displayWord.length > 0);
                    if (allHaveWords && supabase) {
                        await supabase.from('rooms').update({ phase: 'BATTLE' }).eq('id', roomId);
                    }
                }
            }
        };

        const fetchRoom = async () => {
            if (!supabase) return;
            const { data } = await supabase
                .from('rooms')
                .select()
                .eq('id', roomId)
                .single();

            if (data) {
                const newPhase = data.phase as Phase;
                console.log('Fetch room phase:', newPhase);

                // If transitioning to LOBBY (restart or initial join), reset local state
                // Previous check (currentPhase === 'GAMEOVER') might be too strict if state updates are out of sync
                if (newPhase === 'LOBBY') {
                    console.log('Resetting state for LOBBY phase');
                    set({
                        phase: newPhase,
                        theme: data.theme,
                        logs: [],
                        winnerId: null,
                        currentPlayerIndex: 0,
                        attackCount: 0,
                        attackedKanas: new Set(),
                        // Also reset players local state to be safe
                        players: get().players.map(p => ({
                            ...p,
                            displayWord: [],
                            revealedIndices: new Array(7).fill(false),
                            isEliminated: false,
                            isWinner: false
                        }))
                    });
                } else {
                    set({
                        phase: newPhase,
                        theme: data.theme,
                        currentPlayerIndex: data.current_player_index,
                        attackCount: data.attack_count,
                        attackedKanas: new Set(data.attacked_kanas || []),
                    });
                }
            }
        };

        // Initial fetch
        fetchPlayers();
        fetchRoom();

        // Polling as fallback (every 2 seconds)
        const pollInterval = setInterval(() => {
            fetchPlayers();
            fetchRoom();
        }, 2000);

        // Also try Realtime subscription
        const channel = supabase
            .channel(`room:${roomId}`)
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'rooms', filter: `id=eq.${roomId}` },
                (payload) => {
                    console.log('Room update received:', payload);
                    fetchRoom();
                }
            )
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'players', filter: `room_id=eq.${roomId}` },
                (payload) => {
                    console.log('Player update received:', payload);
                    fetchPlayers();
                }
            )
            .subscribe((status) => {
                console.log('Realtime subscription status:', status);
            });

        return () => {
            clearInterval(pollInterval);
            if (supabase) supabase.removeChannel(channel);
        };
    },
}));
