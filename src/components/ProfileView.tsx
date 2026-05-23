import { User, LogOut, Music2, Heart, MessageSquare, Settings, Loader2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useState } from 'react';

interface ProfileViewProps {
  onAuthRequired: () => void;
}

export function ProfileView({ onAuthRequired }: ProfileViewProps) {
  const { user, signOut } = useAuth();
  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = async () => {
    setSigningOut(true);
    await signOut();
    setSigningOut(false);
  };

  if (!user) {
    return (
      <div className="text-center py-20 animate-slide-up">
        <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4">
          <User size={32} className="text-white/30" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Sign in to MoodBeat</h3>
        <p className="text-white/40 text-sm mb-6 max-w-xs mx-auto">
          Save your favorite moods, build personalized playlists, and chat with your AI music companion
        </p>
        <button onClick={onAuthRequired} className="btn-primary px-8 py-3">
          Sign In / Sign Up
        </button>

        <div className="grid grid-cols-3 gap-4 mt-10 max-w-sm mx-auto">
          {[
            { icon: Music2, label: 'Playlists', desc: 'Save unlimited playlists' },
            { icon: Heart, label: 'Favorites', desc: 'Like your top tracks' },
            { icon: MessageSquare, label: 'AI Chat', desc: 'Personalized for you' },
          ].map(f => (
            <div key={f.label} className="glass-card p-4 text-center">
              <f.icon size={20} className="text-emerald-400 mx-auto mb-2" />
              <p className="text-white text-xs font-medium">{f.label}</p>
              <p className="text-white/40 text-xs mt-0.5">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const joinDate = new Date(user.created_at || Date.now()).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="animate-slide-up space-y-4">
      {/* Profile header */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-2xl font-bold text-white shadow-lg shadow-emerald-500/20">
            {user.email?.[0].toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">{user.email?.split('@')[0]}</h2>
            <p className="text-white/40 text-sm">{user.email}</p>
            <p className="text-white/25 text-xs mt-0.5">Member since {joinDate}</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Playlists', value: '—', icon: Music2 },
          { label: 'Liked Songs', value: '—', icon: Heart },
          { label: 'Chats', value: '—', icon: MessageSquare },
        ].map(stat => (
          <div key={stat.label} className="glass-card p-4 text-center">
            <stat.icon size={18} className="text-emerald-400 mx-auto mb-2" />
            <p className="text-white font-bold text-lg">{stat.value}</p>
            <p className="text-white/40 text-xs">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Settings */}
      <div className="glass-card overflow-hidden">
        <div className="p-4 border-b border-white/5">
          <h3 className="text-white font-semibold flex items-center gap-2">
            <Settings size={16} className="text-white/40" />
            Settings
          </h3>
        </div>
        <div className="divide-y divide-white/5">
          {[
            { label: 'Email', value: user.email },
            { label: 'Account ID', value: user.id.split('-')[0] + '...' },
          ].map(item => (
            <div key={item.label} className="flex items-center justify-between px-4 py-3">
              <span className="text-white/50 text-sm">{item.label}</span>
              <span className="text-white/70 text-sm font-mono">{item.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Sign out */}
      <button
        onClick={handleSignOut}
        disabled={signingOut}
        className="w-full glass-card p-4 flex items-center justify-center gap-2 text-rose-400 hover:bg-rose-500/10 transition-all font-medium"
      >
        {signingOut ? <Loader2 size={16} className="animate-spin" /> : <LogOut size={16} />}
        Sign Out
      </button>
    </div>
  );
}
