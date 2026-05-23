import { useEffect, useState } from 'react';
import {
  Loader2,
  ListMusic,
  Trash2,
  Play,
  ChevronRight,
  Music2,
} from 'lucide-react';
import { usePlaylists } from '../hooks/usePlaylists';
import { api } from '../lib/api';
import { Song } from '../types';

interface SavedPlaylistsProps {
  userId: string | undefined;
  onAuthRequired: () => void;
}

export function SavedPlaylists({ userId, onAuthRequired }: SavedPlaylistsProps) {
  const { playlists, loading, fetchPlaylists, deletePlaylist } =
    usePlaylists(userId);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [playlistSongs, setPlaylistSongs] = useState<
    Record<string, Song[]>
  >({});
  const [loadingSongs, setLoadingSongs] = useState<string | null>(null);

  useEffect(() => {
    if (userId) {
      fetchPlaylists();
    }
  }, [userId, fetchPlaylists]);

  const toggleExpand = async (playlistId: string) => {
    if (expandedId === playlistId) {
      setExpandedId(null);
      return;
    }
    setExpandedId(playlistId);
    if (playlistSongs[playlistId]) return;

    setLoadingSongs(playlistId);
    try {
      const data = await api.get<{ songs: Song[] }>(
        `/api/playlists/${playlistId}/songs`,
      );
      setPlaylistSongs((prev) => ({
        ...prev,
        [playlistId]: data.songs || [],
      }));
    } catch {
      setPlaylistSongs((prev) => ({ ...prev, [playlistId]: [] }));
    }
    setLoadingSongs(null);
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await deletePlaylist(id);
    if (expandedId === id) setExpandedId(null);
  };

  if (!userId) {
    return (
      <div className="text-center py-20">
        <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4">
          <ListMusic size={28} className="text-white/30" />
        </div>
        <h3 className="text-white font-semibold mb-2">
          Sign in to save playlists
        </h3>
        <p className="text-white/40 text-sm mb-6">
          Your personalized playlists will appear here
        </p>
        <button onClick={onAuthRequired} className="btn-primary px-6 py-2.5">
          Sign In
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={28} className="text-emerald-400 animate-spin" />
      </div>
    );
  }

  if (playlists.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4">
          <Music2 size={28} className="text-white/30" />
        </div>
        <h3 className="text-white font-semibold mb-2">No playlists yet</h3>
        <p className="text-white/40 text-sm">
          Select a mood on the Discover tab and save your playlist
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3 animate-slide-up">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Your Playlists</h2>
          <p className="text-white/40 text-sm mt-0.5">
            {playlists.length} saved playlist
            {playlists.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {playlists.map((playlist, index) => {
        const isExpanded = expandedId === playlist.id;
        const songs = playlistSongs[playlist.id] || [];

        return (
          <div
            key={playlist.id}
            className="glass-card overflow-hidden animate-fade-in"
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <div
              className="flex items-center gap-4 p-4 cursor-pointer hover:bg-white/5 transition-colors"
              onClick={() => toggleExpand(playlist.id)}
            >
              <div
                className={`w-14 h-14 rounded-xl bg-gradient-to-br ${playlist.cover_gradient} flex items-center justify-center flex-shrink-0 relative overflow-hidden`}
              >
                <ListMusic size={22} className="text-white/80" />
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 hover:opacity-100 transition-opacity">
                  <Play size={18} className="text-white" fill="white" />
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="text-white font-semibold truncate">
                  {playlist.name}
                </h3>
                <p className="text-white/40 text-xs mt-0.5 truncate">
                  {playlist.description}
                </p>
                <p className="text-white/25 text-xs mt-1">
                  {new Date(playlist.created_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => handleDelete(playlist.id, e)}
                  className="p-2 rounded-lg text-white/20 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
                >
                  <Trash2 size={14} />
                </button>
                <ChevronRight
                  size={16}
                  className={`text-white/30 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}
                />
              </div>
            </div>

            {isExpanded && (
              <div className="border-t border-white/5 p-3 animate-fade-in">
                {loadingSongs === playlist.id ? (
                  <div className="flex justify-center py-4">
                    <Loader2
                      size={18}
                      className="text-emerald-400 animate-spin"
                    />
                  </div>
                ) : songs.length === 0 ? (
                  <p className="text-white/30 text-sm text-center py-4">
                    No tracks in this playlist
                  </p>
                ) : (
                  <div className="space-y-1">
                    {songs.map((song, i) => (
                      <div
                        key={song.id}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors group"
                      >
                        <span className="text-white/20 text-xs w-5 text-center">
                          {i + 1}
                        </span>
                        <img
                          src={song.cover_url}
                          alt={song.title}
                          className="w-9 h-9 rounded-lg object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              'https://images.pexels.com/photos/1699161/pexels-photo-1699161.jpeg?auto=compress&cs=tinysrgb&w=300';
                          }}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm font-medium truncate">
                            {song.title}
                          </p>
                          <p className="text-white/40 text-xs truncate">
                            {song.artist}
                          </p>
                        </div>
                        <span className="text-white/20 text-xs hidden sm:block">
                          {song.genre}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
