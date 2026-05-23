import { Compass, ListMusic, MessageSquare, User, Music } from 'lucide-react';
import { AppView } from '../types';

interface NavigationProps {
  activeView: AppView;
  onViewChange: (view: AppView) => void;
  onAuthClick: () => void;
  userEmail?: string | null;
}

const NAV_ITEMS: { view: AppView; icon: React.ComponentType<{ size?: number; className?: string }>; label: string }[] = [
  { view: 'discover', icon: Compass, label: 'Discover' },
  { view: 'playlists', icon: ListMusic, label: 'Playlists' },
  { view: 'chat', icon: MessageSquare, label: 'AI Chat' },
  { view: 'profile', icon: User, label: 'Profile' },
];

export function Navigation({ activeView, onViewChange, onAuthClick, userEmail }: NavigationProps) {
  return (
    <>
      {/* Top bar */}
      <header className="fixed top-0 left-0 right-0 z-40">
        <div className="max-w-screen-lg mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Music size={18} className="text-white" />
            </div>
            <div>
              <h1 className="text-white font-bold text-lg leading-none">MoodBeat</h1>
              <p className="text-white/30 text-xs leading-none mt-0.5">Feel the Music</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {userEmail ? (
              <button
                onClick={() => onViewChange('profile')}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
              >
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center">
                  <span className="text-white text-xs font-bold">{userEmail[0].toUpperCase()}</span>
                </div>
                <span className="text-white/70 text-xs hidden sm:block truncate max-w-[100px]">{userEmail}</span>
              </button>
            ) : (
              <button onClick={onAuthClick} className="btn-primary text-sm px-4 py-2">
                Sign In
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Bottom nav */}
      <nav className="fixed bottom-20 left-1/2 -translate-x-1/2 z-40">
        <div className="glass-card px-2 py-2 flex items-center gap-1">
          {NAV_ITEMS.map(({ view, icon: Icon, label }) => (
            <button
              key={view}
              onClick={() => onViewChange(view)}
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all duration-200 ${
                activeView === view
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : 'text-white/40 hover:text-white/70 hover:bg-white/5'
              }`}
            >
              <Icon size={20} className={activeView === view ? 'text-emerald-400' : ''} />
              <span className="text-xs font-medium">{label}</span>
            </button>
          ))}
        </div>
      </nav>
    </>
  );
}
