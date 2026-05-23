import { useEffect, useState } from 'react';
import { Loader2, Sparkles, ListMusic, ArrowLeft, Save, Check } from 'lucide-react';
import { SongCard } from './SongCard';
import { useSongs } from '../hooks/useSongs';
import { usePlaylists } from '../hooks/usePlaylists';
import { MoodCard, Song } from '../types';

interface MusicRecommendationsProps {
  mood: MoodCard;
  userId: string | undefined;
  onBack: () => void;
  onAuthRequired: () => void;
}

export function MusicRecommendations({ mood, userId, onBack, onAuthRequired }: MusicRecommendationsProps) {
  const { songs, loading, fetchByMood } = useSongs();
  const { createPlaylist } = usePlaylists(userId);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchByMood(mood);
  }, [mood, fetchByMood]);

  const handlePlay = (song: Song) => {
    setPlayingId(prev => prev === song.id ? null : song.id);
  };

  const handleSavePlaylist = async () => {
    if (!userId) {
      onAuthRequired();
      return;
    }
    setSaving(true);
    const result = await createPlaylist(mood, songs.map(s => s.id));
    setSaving(false);
    if (result) setSaved(true);
  };

  const avgEnergy = songs.length ? (songs.reduce((sum, s) => sum + s.energy, 0) / songs.length) : 0;
  const avgValence = songs.length ? (songs.reduce((sum, s) => sum + s.valence, 0) / songs.length) : 0;

  return (
    <div className="animate-slide-up">
      {/* Header */}
      <div className="flex items-start gap-4 mb-6">
        <button
          onClick={onBack}
          className="p-2 rounded-xl glass-card text-white/60 hover:text-white transition-colors mt-1"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <span className="text-3xl">{mood.emoji}</span>
            <h2 className="text-2xl font-bold text-white">{mood.label}</h2>
          </div>
          <p className="text-white/50 text-sm">{mood.description}</p>
        </div>
        <button
          onClick={handleSavePlaylist}
          disabled={saving || saved || songs.length === 0}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            saved
              ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-400'
              : 'btn-primary'
          } disabled:opacity-50`}
        >
          {saving ? (
            <Loader2 size={14} className="animate-spin" />
          ) : saved ? (
            <Check size={14} />
          ) : (
            <Save size={14} />
          )}
          {saved ? 'Saved!' : 'Save Playlist'}
        </button>
      </div>

      {/* Mood stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: 'Energy', value: Math.round(avgEnergy * 100), suffix: '%' },
          { label: 'Positivity', value: Math.round(avgValence * 100), suffix: '%' },
          { label: 'Songs', value: songs.length, suffix: '' },
        ].map(stat => (
          <div key={stat.label} className="glass-card p-4 text-center">
            <p className="text-2xl font-bold text-white">{stat.value}{stat.suffix}</p>
            <p className="text-white/40 text-xs mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* AI Banner */}
      <div className="flex items-center gap-3 p-4 rounded-xl mb-6 overflow-hidden relative"
        style={{ background: `linear-gradient(135deg, ${mood.color}15, ${mood.color}05)`, border: `1px solid ${mood.color}25` }}>
        <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: `${mood.color}30` }}>
          <Sparkles size={14} style={{ color: mood.color }} />
        </div>
        <p className="text-white/70 text-sm">
          <span className="font-semibold text-white">AI curated</span> {songs.length} tracks matching your{' '}
          <span style={{ color: mood.color }} className="font-medium">{mood.label.toLowerCase()}</span> vibe
        </p>
      </div>

      {/* Songs */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-full border-2 border-white/10 flex items-center justify-center">
              <Loader2 size={24} className="text-emerald-400 animate-spin" />
            </div>
            <div className="absolute inset-0 rounded-full animate-ping border border-emerald-500/30" />
          </div>
          <p className="text-white/50 text-sm">Finding your perfect tracks...</p>
        </div>
      ) : songs.length === 0 ? (
        <div className="text-center py-16">
          <ListMusic size={48} className="text-white/20 mx-auto mb-4" />
          <p className="text-white/50">No songs found for this mood.</p>
          <button onClick={onBack} className="mt-4 text-emerald-400 hover:text-emerald-300 text-sm transition-colors">
            Try a different mood
          </button>
        </div>
      ) : (
        <div className="glass-card overflow-hidden">
          <div className="p-4 border-b border-white/5">
            <h3 className="text-white font-semibold flex items-center gap-2">
              <ListMusic size={16} className="text-emerald-400" />
              Recommended Tracks
            </h3>
          </div>
          <div className="p-2">
            {songs.map((song, i) => (
              <SongCard
                key={song.id}
                song={song}
                index={i}
                isPlaying={playingId === song.id}
                onPlay={handlePlay}
                accentColor={mood.color}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
