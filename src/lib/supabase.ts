import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase credentials not found. Multiplayer features will be disabled.');
}

export const supabase = supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

// Types for database tables
export interface DbRoom {
    id: string;
    theme: string;
    phase: 'LOBBY' | 'INPUT' | 'BATTLE' | 'GAMEOVER';
    current_player_index: number;
    attack_count: number;
    host_id: string;
    attacked_kanas: string[];
    created_at: string;
}

export interface DbPlayer {
    id: string;
    room_id: string;
    name: string;
    display_word: string[];
    revealed_indices: boolean[];
    is_eliminated: boolean;
    is_winner: boolean;
    player_order: number;
    created_at: string;
}
