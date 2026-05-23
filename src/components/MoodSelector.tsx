import { useState } from 'react';
import { Sparkles, Search, Zap, Check } from 'lucide-react';
import { MOOD_CARDS, ACTIVITY_CARDS } from '../data/moods';
import { MoodCard } from '../types';
import { MoodIcon } from '../lib/icons';

interface MoodSelectorProps {
  onMoodSelect: (mood: MoodCard) => void;
  selectedMood: MoodCard | null;
}

export function MoodSelector({ onMoodSelect, selectedMood }: MoodSelectorProps) {
  const [customText, setCustomText] = useState('');
  const [activeTab, setActiveTab] = useState<'mood' | 'activity'>('mood');

  const handleCustomSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customText.trim()) return;
    const text = customText.toLowerCase();
    const matched = MOOD_CARDS.find(m =>
      m.label.toLowerCase().includes(text) ||
      m.tags.some(t => text.includes(t)) ||
      text.includes(m.label.toLowerCase())
    );
    if (matched) {
      onMoodSelect(matched);
    } else {
      const custom: MoodCard = {
        label: customText,
        icon: 'Sparkles',
        description: customText,
        color: '#22c55e',
        gradient: 'from-emerald-400 via-teal-500 to-cyan-600',
        energy_level: 5,
        tags: text.split(' ').filter(w => w.length > 2),
      };
      onMoodSelect(custom);
    }
    setCustomText('');
  };

  const handleActivitySelect = (activity: typeof ACTIVITY_CARDS[0]) => {
    const matched = MOOD_CARDS.find(m => m.tags.some(t => activity.tags.includes(t)));
    if (matched) {
      onMoodSelect({ ...matched, label: activity.label, icon: activity.icon });
    }
  };

  return (
    <div className="animate-slide-up">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm mb-4">
          <Sparkles size={14} />
          <span>AI-Powered Recommendations</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-3 leading-tight">
          How are you feeling<br />
          <span className="text-gradient">right now?</span>
        </h1>
        <p className="text-white/50 text-lg">Pick a mood, activity, or describe your vibe</p>
      </div>

      {/* Search bar */}
      <form onSubmit={handleCustomSearch} className="relative mb-8 max-w-xl mx-auto">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
        <input
          type="text"
          value={customText}
          onChange={e => setCustomText(e.target.value)}
          placeholder="Describe your mood... &quot;late night nostalgic&quot;, &quot;pre-workout hype&quot;"
          className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-16 py-4 text-white placeholder-white/30 focus:outline-none focus:border-emerald-500/40 focus:bg-white/8 transition-all text-sm"
        />
        <button
          type="submit"
          disabled={!customText.trim()}
          className="absolute right-3 top-1/2 -translate-y-1/2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-30 disabled:cursor-not-allowed text-white rounded-xl px-3 py-2 text-sm font-medium transition-all flex items-center gap-1"
        >
          <Zap size={14} />
        </button>
      </form>

      {/* Tab selector */}
      <div className="flex gap-1 p-1 bg-white/5 rounded-xl mb-6 max-w-xs mx-auto">
        {(['mood', 'activity'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
              activeTab === tab
                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                : 'text-white/50 hover:text-white'
            }`}
          >
            {tab === 'mood' ? 'Moods' : 'Activities'}
          </button>
        ))}
      </div>

      {/* Mood cards */}
      {activeTab === 'mood' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {MOOD_CARDS.map(mood => (
            <button
              key={mood.label}
              onClick={() => onMoodSelect(mood)}
              className={`mood-card group relative overflow-hidden rounded-2xl p-4 text-left transition-all duration-300 ${
                selectedMood?.label === mood.label
                  ? 'ring-2 ring-emerald-400 ring-offset-2 ring-offset-transparent scale-105'
                  : 'hover:scale-105'
              }`}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${mood.gradient} opacity-20 group-hover:opacity-30 transition-opacity`} />
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity"
                style={{ background: `radial-gradient(circle at 50% 50%, ${mood.color}, transparent)` }}
              />
              <div className="relative">
                <div className="mb-2" style={{ color: mood.color }}>
                  <MoodIcon name={mood.icon} size={28} />
                </div>
                <p className="font-semibold text-white text-sm">{mood.label}</p>
                <p className="text-white/50 text-xs mt-0.5">{mood.description}</p>
                <div className="mt-2 flex items-center gap-1">
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div
                        key={i}
                        className={`h-1 w-3 rounded-full transition-all ${
                          i < Math.ceil(mood.energy_level / 2)
                            ? 'opacity-100'
                            : 'opacity-20'
                        }`}
                        style={{ background: i < Math.ceil(mood.energy_level / 2) ? mood.color : 'white' }}
                      />
                    ))}
                  </div>
                </div>
              </div>
              {selectedMood?.label === mood.label && (
                <div className="absolute top-2 right-2">
                  <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                    <Check size={12} className="text-white" />
                  </div>
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Activity cards */}
      {activeTab === 'activity' && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {ACTIVITY_CARDS.map(activity => (
            <button
              key={activity.label}
              onClick={() => handleActivitySelect(activity)}
              className="glass-card p-5 text-center hover:scale-105 transition-all duration-200 group"
            >
              <div className="flex justify-center mb-2 text-white/80 group-hover:scale-110 transition-transform">
                <MoodIcon name={activity.icon} size={28} />
              </div>
              <p className="text-white font-medium text-sm">{activity.label}</p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
