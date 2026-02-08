import { create } from 'zustand';
import { normalizeKana } from '../utils/kana';

export type Phase = 'SETUP' | 'INPUT' | 'BATTLE' | 'GAMEOVER';

export interface Player {
    id: string;
    name: string;
    rawWord: string; // The original input
    normalizedWord: string; // The word used for logic (e.g. "が" -> "か")
    displayWord: string[]; // Array of characters to display (handling fills)
    revealedIndices: boolean[]; // true if the index is revealed
    isEliminated: boolean;
    isWinner: boolean;
}

export interface GameLog {
    id: string;
    message: string;
    type: 'info' | 'attack' | 'damage' | 'elimination';
}

interface GameState {
    phase: Phase;
    theme: string;
    players: Player[];
    currentPlayerIndex: number;
    attackCount: number; // 0, 1 (max 2 actions per turn if hit)
    logs: GameLog[];
    winnerId: string | null;
    attackedKanas: Set<string>; // 攻撃された文字の履歴

    // Actions
    initGame: (theme: string, playerNames: string[]) => void;
    setPlayerWord: (playerId: string, word: string) => void;
    nextPhase: () => void; // Manually advance SETUP -> INPUT -> BATTLE
    attack: (kana: string) => void;
    restartGame: () => void;
}

export const useGameStore = create<GameState>((set, get) => ({
    phase: 'SETUP',
    theme: '',
    players: [],
    currentPlayerIndex: 0,
    attackCount: 0,
    logs: [],
    winnerId: null,
    attackedKanas: new Set<string>(),

    initGame: (theme, playerNames) => {
        const players: Player[] = playerNames.map((name, i) => ({
            id: `p${i}`,
            name,
            rawWord: '',
            normalizedWord: '',
            displayWord: [],
            revealedIndices: [],
            isEliminated: false,
            isWinner: false,
        }));
        set({
            phase: 'INPUT',
            theme,
            players,
            currentPlayerIndex: 0,
            attackCount: 0,
            logs: [{ id: 'init', message: `ゲーム開始！ お題: ${theme}`, type: 'info' }],
            winnerId: null,
            attackedKanas: new Set<string>(),
        });
    },

    setPlayerWord: (playerId, word) => {
        // word is raw. normalize it.
        // Length check should be done in UI, but safe to clamp here or validate.
        // For now assume valid 2-7 chars.
        const normalized = normalizeKana(word);

        // Create display word (max 7 chars, fill rest with '×'?)
        // Rule: "2-7 chars". "Empty slots filled with ×".
        // Wait, the physical game has fixed slots? 
        // "6文字以下の場合は、余ったちょっかんくんに「×」を書く"
        // So usually length is fixed to 7? Or flexible? 
        // The board seems to have limit. Let's fix to 7 slots for UI consistency.
        const displayWord = normalized.split('');
        while (displayWord.length < 7) {
            displayWord.push('×');
        }

        set((state) => ({
            players: state.players.map((p) =>
                p.id === playerId
                    ? {
                        ...p,
                        rawWord: word,
                        normalizedWord: normalized,
                        displayWord,
                        revealedIndices: new Array(7).fill(false), // All hidden initially, including fillers.
                    }
                    : p
            ),
            // Auto-advance current player in INPUT phase
            currentPlayerIndex:
                state.phase === 'INPUT'
                    ? (state.currentPlayerIndex + 1) % state.players.length
                    : state.currentPlayerIndex,
        }));

        // Check if all players have words
        const state = get();
        if (state.phase === 'INPUT' && state.players.every(p => p.normalizedWord.length > 0)) {
            // All inputs done. Move to BATTLE.
            set({ phase: 'BATTLE', currentPlayerIndex: 0 });
        }
    },

    nextPhase: () => {
        // Helper to force phase transition if needed
    },

    attack: (kana) => {
        const state = get();
        const attacker = state.players[state.currentPlayerIndex];
        let hit = false;
        let newLogs: GameLog[] = [...state.logs];

        newLogs.unshift({
            id: Date.now().toString() + '-atk',
            message: `${attacker.name} の攻撃: "${kana}"`,
            type: 'attack',
        });

        const newPlayers = state.players.map((p) => {
            let playerHit = false;
            const newRevealed = p.displayWord.map((char, idx) => {
                if (p.revealedIndices[idx]) return true; // Already revealed
                if (char === kana) {
                    playerHit = true;
                    return true;
                }
                return false;
            });

            if (playerHit) {
                hit = true;
                newLogs.unshift({
                    id: Date.now().toString() + `-hit-${p.name}`,
                    message: `${p.name} にヒット！`,
                    type: 'damage',
                });
            }

            // Check elimination
            // All non-'×' characters revealed?
            const isAlive = p.displayWord.some((char, idx) => char !== '×' && !newRevealed[idx]);

            return {
                ...p,
                revealedIndices: newRevealed,
                isEliminated: !isAlive,
            };
        });

        // Determine next turn
        let nextIndex = state.currentPlayerIndex;
        let nextAttackCount = state.attackCount;

        if (hit) {
            // Bonus attack! Max 2 attacks per turn.
            // 0 -> 1. 1 -> End turn.
            if (state.attackCount < 1) {
                nextAttackCount++;
                newLogs.unshift({
                    id: Date.now().toString() + '-bonus',
                    message: `${attacker.name} はもう一度攻撃できます！`,
                    type: 'info',
                });
            } else {
                // End turn (Max 2 reached)
                nextIndex = (state.currentPlayerIndex + 1) % state.players.length;
                nextAttackCount = 0;
            }
        } else {
            // Miss -> End turn
            newLogs.unshift({
                id: Date.now().toString() + '-miss',
                message: `ミス！`,
                type: 'info',
            });
            nextIndex = (state.currentPlayerIndex + 1) % state.players.length;
            nextAttackCount = 0;
        }

        // Skip eliminated players for next turn
        // (Simple loop to find next valid player)
        let attempts = 0;
        while (newPlayers[nextIndex].isEliminated && attempts < newPlayers.length) {
            nextIndex = (nextIndex + 1) % newPlayers.length;
            attempts++;
        }

        // Check Win Condition
        const activePlayers = newPlayers.filter(p => !p.isEliminated);
        let newPhase = state.phase;
        let winnerId = null;

        if (activePlayers.length === 1) {
            newPhase = 'GAMEOVER';
            winnerId = activePlayers[0].id;
            newLogs.unshift({
                id: Date.now().toString() + '-win',
                message: `${activePlayers[0].name} の勝利！`,
                type: 'elimination',
            });
        }

        const newAttackedKanas = new Set(state.attackedKanas);
        newAttackedKanas.add(kana);

        set({
            players: newPlayers,
            logs: newLogs,
            currentPlayerIndex: nextIndex,
            attackCount: nextAttackCount,
            phase: newPhase,
            winnerId,
            attackedKanas: newAttackedKanas,
        });
    },

    restartGame: () => {
        set({
            phase: 'SETUP',
            theme: '',
            players: [],
            currentPlayerIndex: 0,
            attackCount: 0,
            logs: [],
            winnerId: null,
            attackedKanas: new Set<string>(),
        });
    }
}));
