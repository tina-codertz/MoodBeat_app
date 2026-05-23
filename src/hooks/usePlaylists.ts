import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Playlist, MoodCard } from '../types';

export function usePlaylists(userId: string | undefined) {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchPlaylists = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('playlists')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setPlaylists(data || []);
    } catch {
      setPlaylists([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const createPlaylist = useCallback(async (mood: MoodCard, songIds: string[]) => {
    if (!userId) return null;
    try {
      const { data: playlist, error: plError } = await supabase
        .from('playlists')
        .insert({
          user_id: userId,
          name: `${mood.label} Vibes`,
          description: `A playlist for when you're feeling ${mood.label.toLowerCase()}`,
          cover_gradient: mood.gradient,
        })
        .select()
        .single();

      if (plError || !playlist) throw plError;

      if (songIds.length > 0) {
        const rows = songIds.map((sid, i) => ({
          playlist_id: playlist.id,
          song_id: sid,
          position: i,
        }));
        await supabase.from('playlist_songs').insert(rows);
      }

      await fetchPlaylists();
      return playlist;
    } catch {
      return null;
    }
  }, [userId, fetchPlaylists]);

  const deletePlaylist = useCallback(async (id: string) => {
    await supabase.from('playlists').delete().eq('id', id);
    setPlaylists(prev => prev.filter(p => p.id !== id));
  }, []);

  return { playlists, loading, fetchPlaylists, createPlaylist, deletePlaylist };
}
