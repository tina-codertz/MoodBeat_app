import { useState, useEffect } from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2, Heart } from 'lucide-react';
import { Song } from '../types';

interface NowPlayingBarProps {
  song: Song | null;
  accentColor?: string;
}

export function NowPlayingBar({ song, accentColor = '#22c55e' }: NowPlayingBarProps) {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    if (song) {
      setPlaying(true);
      setProgress(0);
    }
  }, [song]);

  useEffect(() => {
    if (!playing || !song) return;
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) { setPlaying(false); return 100; }
        return p + (100 / (song.duration_ms / 1000));
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [playing, song]);

  if (!song) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 p-3">
      <div className="max-w-screen-lg mx-auto glass-card px-4 py-3">
        <div className="flex items-center gap-4">
          <img
            src={song.cover_url}
            alt={song.album}
            className="w-11 h-11 rounded-lg object-cover flex-shrink-0"
            onError={e => {
              (e.target as HTMLImageElement).src = 'https://images.pexels.com/photos/1699161/pexels-photo-1699161.jpeg?auto=compress&cs=tinysrgb&w=300';
            }}
          />
          <div className="flex-1 min-w-0 hidden sm:block">
            <p className="text-white text-sm font-medium truncate">{song.title}</p>
            <p className="text-white/50 text-xs truncate">{song.artist}</p>
          </div>

          <div className="flex items-center gap-3 mx-auto sm:mx-0">
            <button className="text-white/40 hover:text-white transition-colors">
              <SkipBack size={18} />
            </button>
            <button
              onClick={() => setPlaying(!playing)}
              className="w-9 h-9 rounded-full flex items-center justify-center transition-all hover:scale-105"
              style={{ background: accentColor }}
            >
              {playing
                ? <Pause size={16} className="text-white" />
                : <Play size={16} className="text-white" fill="currentColor" />
              }
            </button>
            <button className="text-white/40 hover:text-white transition-colors">
              <SkipForward size={18} />
            </button>
          </div>

          <div className="flex-1 hidden md:block">
            <div
              className="h-1 bg-white/10 rounded-full overflow-hidden cursor-pointer"
              onClick={e => {
                const rect = e.currentTarget.getBoundingClientRect();
                setProgress(((e.clientX - rect.left) / rect.width) * 100);
              }}
            >
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${progress}%`, background: accentColor }}
              />
            </div>
          </div>

          <div className="flex items-center gap-2 ml-auto sm:ml-0">
            <button
              onClick={() => setLiked(!liked)}
              className={`p-1.5 rounded-lg transition-colors ${liked ? 'text-rose-400' : 'text-white/30 hover:text-white'}`}
            >
              <Heart size={16} fill={liked ? 'currentColor' : 'none'} />
            </button>
            <Volume2 size={16} className="text-white/30 hidden sm:block" />
          </div>
        </div>
      </div>
    </div>
  );
}
