import { useState } from 'react';
import { Play, Pause, Heart, Plus } from 'lucide-react';
import { Song } from '../types';

interface SongCardProps {
  song: Song;
  index: number;
  isPlaying?: boolean;
  onPlay?: (song: Song) => void;
  onSave?: (song: Song) => void;
  accentColor?: string;
}

function formatDuration(ms: number): string {
  const secs = Math.floor(ms / 1000);
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function SongCard({ song, index, isPlaying, onPlay, onSave, accentColor = '#22c55e' }: SongCardProps) {
  const [liked, setLiked] = useState(false);

  return (
    <div className="group flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-all duration-200 cursor-pointer animate-fade-in">
      <div className="w-6 text-center flex-shrink-0">
        {isPlaying ? (
          <div className="flex items-end gap-0.5 h-4 justify-center">
            {[1, 2, 3].map(i => (
              <div
                key={i}
                className="w-0.5 rounded-full animate-pulse"
                style={{
                  height: `${[60, 100, 75][i - 1]}%`,
                  background: accentColor,
                  animationDelay: `${i * 0.15}s`,
                }}
              />
            ))}
          </div>
        ) : (
          <span className="text-white/30 text-sm group-hover:hidden">{index + 1}</span>
        )}
        <button
          onClick={() => onPlay?.(song)}
          className="hidden group-hover:flex items-center justify-center text-white"
        >
          {isPlaying ? <Pause size={14} /> : <Play size={14} fill="currentColor" />}
        </button>
      </div>

      <div className="relative flex-shrink-0">
        <img
          src={song.cover_url}
          alt={song.album}
          className="w-12 h-12 rounded-lg object-cover"
          onError={e => {
            (e.target as HTMLImageElement).src = `https://images.pexels.com/photos/1699161/pexels-photo-1699161.jpeg?auto=compress&cs=tinysrgb&w=300`;
          }}
        />
        {isPlaying && (
          <div className="absolute inset-0 rounded-lg flex items-center justify-center bg-black/40">
            <div className="w-4 h-4 rounded-full bg-white/90 flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: accentColor }} />
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className={`font-medium truncate text-sm ${isPlaying ? 'text-emerald-400' : 'text-white'}`}>
          {song.title}
        </p>
        <p className="text-white/50 text-xs truncate">{song.artist}</p>
      </div>

      <div className="hidden sm:flex items-center gap-1 flex-wrap max-w-[140px]">
        {song.mood_tags.slice(0, 2).map(tag => (
          <span key={tag} className="tag-pill text-xs">{tag}</span>
        ))}
      </div>

      <div className="flex items-center gap-3 ml-auto">
        <span className="text-white/30 text-xs hidden sm:block">{formatDuration(song.duration_ms)}</span>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={e => { e.stopPropagation(); setLiked(!liked); }}
            className={`p-1.5 rounded-lg transition-colors ${liked ? 'text-rose-400' : 'text-white/40 hover:text-white'}`}
          >
            <Heart size={14} fill={liked ? 'currentColor' : 'none'} />
          </button>
          <button
            onClick={e => { e.stopPropagation(); onSave?.(song); }}
            className="p-1.5 rounded-lg text-white/40 hover:text-white transition-colors"
          >
            <Plus size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
