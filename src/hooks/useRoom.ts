import { useState, useEffect, useCallback } from 'react';
import { supabase, type DbRoom, type DbPlayer } from '../lib/supabase';

// Generate a unique player ID for this browser session
const getOrCreatePlayerId = (): string => {
    let playerId = sessionStorage.getItem('kanaclash_player_id');
    if (!playerId) {
        playerId = crypto.randomUUID();
        sessionStorage.setItem('kanaclash_player_id', playerId);
    }
    return playerId;
};

export const useRoom = () => {
    const [room, setRoom] = useState<DbRoom | null>(null);
    const [players, setPlayers] = useState<DbPlayer[]>([]);
    const [myPlayerId] = useState(getOrCreatePlayerId);
    const [isHost, setIsHost] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Create a new room
    const createRoom = useCallback(async (hostName: string): Promise<string | null> => {
        if (!supabase) {
            setError('Supabase not configured');
            return null;
        }

        setLoading(true);
        setError(null);

        try {
            // Create room
            const { data: roomData, error: roomError } = await supabase
                .from('rooms')
                .insert({
                    host_id: myPlayerId,
                    phase: 'LOBBY',
                    theme: '',
                })
                .select()
                .single();

            if (roomError) throw roomError;

            // Add host as first player
            const { error: playerError } = await supabase
                .from('players')
                .insert({
                    id: myPlayerId,
                    room_id: roomData.id,
                    name: hostName,
                    player_order: 0,
                });

            if (playerError) throw playerError;

            setRoom(roomData);
            setIsHost(true);
            return roomData.id;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create room');
            return null;
        } finally {
            setLoading(false);
        }
    }, [myPlayerId]);

    // Join an existing room
    const joinRoom = useCallback(async (roomId: string, playerName: string): Promise<boolean> => {
        if (!supabase) {
            setError('Supabase not configured');
            return false;
        }

        setLoading(true);
        setError(null);

        try {
            // Get room
            const { data: roomData, error: roomError } = await supabase
                .from('rooms')
                .select()
                .eq('id', roomId)
                .single();

            if (roomError) throw new Error('Room not found');
            if (roomData.phase !== 'LOBBY') throw new Error('Game already started');

            // Get current player count
            const { count } = await supabase
                .from('players')
                .select('*', { count: 'exact', head: true })
                .eq('room_id', roomId);

            if ((count || 0) >= 4) throw new Error('Room is full');

            // Check if already in room
            const { data: existingPlayer } = await supabase
                .from('players')
                .select()
                .eq('room_id', roomId)
                .eq('id', myPlayerId)
                .single();

            if (!existingPlayer) {
                // Add player
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

            setRoom(roomData);
            setIsHost(roomData.host_id === myPlayerId);
            return true;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to join room');
            return false;
        } finally {
            setLoading(false);
        }
    }, [myPlayerId]);

    // Update room state
    const updateRoom = useCallback(async (updates: Partial<DbRoom>) => {
        if (!supabase || !room) return;

        await supabase
            .from('rooms')
            .update(updates)
            .eq('id', room.id);
    }, [room]);

    // Update player state
    const updatePlayer = useCallback(async (playerId: string, updates: Partial<DbPlayer>) => {
        if (!supabase || !room) return;

        await supabase
            .from('players')
            .update(updates)
            .eq('id', playerId)
            .eq('room_id', room.id);
    }, [room]);

    // Update my word
    const setMyWord = useCallback(async (displayWord: string[]) => {
        if (!supabase || !room) return;

        await supabase
            .from('players')
            .update({ display_word: displayWord })
            .eq('id', myPlayerId)
            .eq('room_id', room.id);
    }, [room, myPlayerId]);

    // Subscribe to room and player changes
    useEffect(() => {
        if (!supabase || !room) return;

        // Fetch initial players
        const fetchPlayers = async () => {
            if (!supabase) return;
            const { data } = await supabase
                .from('players')
                .select()
                .eq('room_id', room.id)
                .order('player_order');
            if (data) setPlayers(data);
        };
        fetchPlayers();

        // Subscribe to room changes
        const roomChannel = supabase
            .channel(`room:${room.id}`)
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'rooms', filter: `id=eq.${room.id}` },
                (payload) => {
                    if (payload.eventType === 'UPDATE') {
                        setRoom(payload.new as DbRoom);
                    }
                }
            )
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'players', filter: `room_id=eq.${room.id}` },
                () => {
                    // Refetch all players on any change
                    fetchPlayers();
                }
            )
            .subscribe();

        return () => {
            if (supabase) supabase.removeChannel(roomChannel);
        };
    }, [room?.id]);

    // Leave room
    const leaveRoom = useCallback(async () => {
        if (!supabase || !room) return;

        await supabase
            .from('players')
            .delete()
            .eq('id', myPlayerId)
            .eq('room_id', room.id);

        setRoom(null);
        setPlayers([]);
        setIsHost(false);
    }, [room, myPlayerId]);

    return {
        room,
        players,
        myPlayerId,
        isHost,
        loading,
        error,
        createRoom,
        joinRoom,
        updateRoom,
        updatePlayer,
        setMyWord,
        leaveRoom,
    };
};
