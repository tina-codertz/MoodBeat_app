import { useState, useCallback } from 'react';
import { api } from '../lib/api';
import { Playlist, MoodCard } from '../types';

export function usePlaylists(userId: string | undefined) {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchPlaylists = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const data = await api.get<{ playlists: Playlist[] }>('/api/playlists');
      setPlaylists(data.playlists || []);
    } catch {
      setPlaylists([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const createPlaylist = useCallback(
    async (mood: MoodCard, songIds: string[]) => {
      if (!userId) return null;
      try {
        const data = await api.post<{ playlist: Playlist }>('/api/playlists', {
          name: `${mood.label} Vibes`,
          description: `A playlist for when you're feeling ${mood.label.toLowerCase()}`,
          cover_gradient: mood.gradient,
          song_ids: songIds,
        });
        await fetchPlaylists();
        return data.playlist;
      } catch {
        return null;
      }
    },
    [userId, fetchPlaylists],
  );

  const deletePlaylist = useCallback(async (id: string) => {
    await api.del(`/api/playlists/${id}`);
    setPlaylists((prev) => prev.filter((p) => p.id !== id));
  }, []);

  return { playlists, loading, fetchPlaylists, createPlaylist, deletePlaylist };
}
