/*
  # MoodBeat Schema

  1. New Tables
    - `moods` - stores user mood sessions with text/emoji/context
      - `id` (uuid, pk)
      - `user_id` (uuid, FK to auth.users)
      - `label` (text) - mood label e.g. "Happy", "Melancholic"
      - `emoji` (text)
      - `description` (text) - user's free text
      - `energy_level` (int 1-10)
      - `color` (text) - hex color for dynamic theming
      - `created_at` (timestamptz)
    - `songs` - song catalog
      - `id` (uuid, pk)
      - `title` (text)
      - `artist` (text)
      - `album` (text)
      - `cover_url` (text)
      - `duration_ms` (int)
      - `mood_tags` (text[]) - mood associations
      - `genre` (text)
      - `bpm` (int)
      - `energy` (float 0-1)
      - `valence` (float 0-1)
    - `playlists` - named playlists
      - `id` (uuid, pk)
      - `user_id` (uuid, FK auth.users)
      - `name` (text)
      - `description` (text)
      - `mood_id` (uuid, FK moods)
      - `cover_gradient` (text) - CSS gradient string
      - `created_at` (timestamptz)
    - `playlist_songs` - junction table
      - `playlist_id` (uuid)
      - `song_id` (uuid)
      - `position` (int)
    - `saved_moods` - user bookmarked moods
      - `id` (uuid, pk)
      - `user_id` (uuid)
      - `mood_id` (uuid)
      - `created_at` (timestamptz)
    - `chat_messages` - AI chat history
      - `id` (uuid, pk)
      - `user_id` (uuid)
      - `role` (text) - 'user' or 'assistant'
      - `content` (text)
      - `created_at` (timestamptz)

  2. Security
    - RLS enabled on all tables
    - Users can only read/write their own data
    - Songs table is readable by all authenticated users
*/

-- Songs table (shared catalog, read by all auth users)
CREATE TABLE IF NOT EXISTS songs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL DEFAULT '',
  artist text NOT NULL DEFAULT '',
  album text DEFAULT '',
  cover_url text DEFAULT '',
  duration_ms integer DEFAULT 0,
  mood_tags text[] DEFAULT '{}',
  genre text DEFAULT '',
  bpm integer DEFAULT 120,
  energy float DEFAULT 0.5,
  valence float DEFAULT 0.5
);

ALTER TABLE songs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can read songs"
  ON songs FOR SELECT
  TO authenticated
  USING (true);

-- Moods table
CREATE TABLE IF NOT EXISTS moods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  label text NOT NULL DEFAULT '',
  emoji text DEFAULT '',
  description text DEFAULT '',
  energy_level integer DEFAULT 5,
  color text DEFAULT '#1db954',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE moods ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own moods"
  ON moods FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own moods"
  ON moods FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own moods"
  ON moods FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own moods"
  ON moods FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Playlists table
CREATE TABLE IF NOT EXISTS playlists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL DEFAULT '',
  description text DEFAULT '',
  mood_id uuid REFERENCES moods(id) ON DELETE SET NULL,
  cover_gradient text DEFAULT 'from-emerald-500 to-teal-700',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE playlists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own playlists"
  ON playlists FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own playlists"
  ON playlists FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own playlists"
  ON playlists FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own playlists"
  ON playlists FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Playlist songs junction
CREATE TABLE IF NOT EXISTS playlist_songs (
  playlist_id uuid NOT NULL REFERENCES playlists(id) ON DELETE CASCADE,
  song_id uuid NOT NULL REFERENCES songs(id) ON DELETE CASCADE,
  position integer DEFAULT 0,
  PRIMARY KEY (playlist_id, song_id)
);

ALTER TABLE playlist_songs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read playlist songs for own playlists"
  ON playlist_songs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM playlists
      WHERE playlists.id = playlist_songs.playlist_id
      AND playlists.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert playlist songs for own playlists"
  ON playlist_songs FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM playlists
      WHERE playlists.id = playlist_songs.playlist_id
      AND playlists.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete playlist songs for own playlists"
  ON playlist_songs FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM playlists
      WHERE playlists.id = playlist_songs.playlist_id
      AND playlists.user_id = auth.uid()
    )
  );

-- Chat messages
CREATE TABLE IF NOT EXISTS chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'user',
  content text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own chat messages"
  ON chat_messages FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own chat messages"
  ON chat_messages FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_moods_user_id ON moods(user_id);
CREATE INDEX IF NOT EXISTS idx_playlists_user_id ON playlists(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id ON chat_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_songs_mood_tags ON songs USING gin(mood_tags);
