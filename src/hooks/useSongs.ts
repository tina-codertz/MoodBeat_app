import { useState, useCallback } from 'react';
import { api } from '../lib/api';
import { Song, MoodCard } from '../types';

export function useSongs() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchByMood = useCallback(async (mood: MoodCard) => {
    setLoading(true);
    try {
      const data = await api.get<{ songs: Song[] }>(
        `/api/songs?tags=${mood.tags.join(',')}`,
      );
      const sorted = (data.songs || []).sort((a, b) => {
        const aMatches = a.mood_tags.filter((t) => mood.tags.includes(t)).length;
        const bMatches = b.mood_tags.filter((t) => mood.tags.includes(t)).length;
        return bMatches - aMatches;
      });
      setSongs(sorted);
    } catch {
      setSongs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchByTags = useCallback(async (tags: string[]) => {
    setLoading(true);
    try {
      const data = await api.get<{ songs: Song[] }>(
        `/api/songs?tags=${tags.join(',')}`,
      );
      setSongs(data.songs || []);
    } catch {
      setSongs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.get<{ songs: Song[] }>('/api/songs');
      setSongs(data.songs || []);
    } catch {
      setSongs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  return { songs, loading, fetchByMood, fetchByTags, fetchAll };
}
