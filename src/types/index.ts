export interface Song {
  id: string;
  title: string;
  artist: string;
  album: string;
  cover_url: string;
  duration_ms: number;
  mood_tags: string[];
  genre: string;
  bpm: number;
  energy: number;
  valence: number;
}

export interface Playlist {
  id: string;
  user_id: string;
  name: string;
  description: string;
  cover_gradient: string;
  created_at: string;
  songs?: Song[];
}

export interface ChatMessage {
  id: string;
  user_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

export interface MoodCard {
  label: string;
  icon: string;
  description: string;
  color: string;
  gradient: string;
  energy_level: number;
  tags: string[];
}

export type AppView = 'discover' | 'playlists' | 'chat' | 'profile';
