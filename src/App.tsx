import { useState, useEffect } from 'react';
import { Navigation } from './components/Navigation';
import { MoodSelector } from './components/MoodSelector';
import { MusicRecommendations } from './components/MusicRecommendations';
import { AIChat } from './components/AIChat';
import { SavedPlaylists } from './components/SavedPlaylists';
import { ProfileView } from './components/ProfileView';
import { AuthModal } from './components/AuthModal';
import { AnimatedBackground } from './components/AnimatedBackground';
import { NowPlayingBar } from './components/NowPlayingBar';
import { useAuth } from './hooks/useAuth';
import { AppView, MoodCard, Song } from './types';

export default function App() {
  const { user, loading } = useAuth();
  const [activeView, setActiveView] = useState<AppView>('discover');
  const [selectedMood, setSelectedMood] = useState<MoodCard | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [nowPlaying, setNowPlaying] = useState<Song | null>(null);
  const [accentColor, setAccentColor] = useState('#22c55e');

  useEffect(() => {
    if (selectedMood) setAccentColor(selectedMood.color);
  }, [selectedMood]);

  const handleMoodSelect = (mood: MoodCard) => {
    setSelectedMood(mood);
  };

  const handleAuthRequired = () => {
    setShowAuth(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080810] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center mx-auto mb-3 animate-pulse-slow">
            <span className="text-2xl">🎵</span>
          </div>
          <p className="text-white/40 text-sm">Loading MoodBeat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-app relative overflow-hidden">
      <AnimatedBackground accentColor={accentColor} />

      {/* Background gradient blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
        <div
          className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full opacity-10 blur-3xl transition-all duration-1000"
          style={{ background: `radial-gradient(circle, ${accentColor}, transparent)` }}
        />
        <div
          className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full opacity-8 blur-3xl transition-all duration-1000"
          style={{ background: `radial-gradient(circle, ${accentColor}, transparent)` }}
        />
      </div>

      <Navigation
        activeView={activeView}
        onViewChange={setActiveView}
        onAuthClick={() => setShowAuth(true)}
        userEmail={user?.email}
      />

      <main className="relative z-10 max-w-screen-lg mx-auto px-4 pt-20 pb-40">
        {activeView === 'discover' && (
          <div>
            {selectedMood ? (
              <MusicRecommendations
                mood={selectedMood}
                userId={user?.id}
                onBack={() => setSelectedMood(null)}
                onAuthRequired={handleAuthRequired}
              />
            ) : (
              <MoodSelector
                onMoodSelect={handleMoodSelect}
                selectedMood={selectedMood}
              />
            )}
          </div>
        )}

        {activeView === 'playlists' && (
          <SavedPlaylists
            userId={user?.id}
            onAuthRequired={handleAuthRequired}
          />
        )}

        {activeView === 'chat' && (
          <AIChat
            userId={user?.id}
            onAuthRequired={handleAuthRequired}
            onMoodDetected={mood => {
              setSelectedMood(mood);
              setTimeout(() => setActiveView('discover'), 300);
            }}
          />
        )}

        {activeView === 'profile' && (
          <ProfileView onAuthRequired={handleAuthRequired} />
        )}
      </main>

      <NowPlayingBar song={nowPlaying} accentColor={accentColor} />

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </div>
  );
}
