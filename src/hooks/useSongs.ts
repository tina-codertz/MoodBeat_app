import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Song, MoodCard } from '../types';

export function useSongs() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchByMood = useCallback(async (mood: MoodCard) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('songs')
        .select('*')
        .overlaps('mood_tags', mood.tags)
        .limit(12);

      if (error) throw error;

      const sorted = (data || []).sort((a, b) => {
        const aMatches = a.mood_tags.filter((t: string) => mood.tags.includes(t)).length;
        const bMatches = b.mood_tags.filter((t: string) => mood.tags.includes(t)).length;
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
      const { data, error } = await supabase
        .from('songs')
        .select('*')
        .overlaps('mood_tags', tags)
        .limit(10);

      if (error) throw error;
      setSongs(data || []);
    } catch {
      setSongs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('songs').select('*').limit(20);
      if (error) throw error;
      setSongs(data || []);
    } catch {
      setSongs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  return { songs, loading, fetchByMood, fetchByTags, fetchAll };
}
