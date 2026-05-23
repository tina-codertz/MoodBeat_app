import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, Music, Sparkles, CloudRain, Dumbbell, Code, Heart, Moon, type LucideIcon } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { ChatMessage } from '../types';
import { MOOD_CARDS } from '../data/moods';

interface AIChatProps {
  userId: string | undefined;
  onAuthRequired: () => void;
  onMoodDetected?: (mood: typeof MOOD_CARDS[0]) => void;
}

const SYSTEM_CONTEXT = `You are MoodBeat's AI music assistant. You help users discover music based on their emotions, activities, and preferences. You know about all music genres, moods, and can suggest songs and playlists. Keep responses concise, enthusiastic, and music-focused. When you detect a mood or activity, mention it. Always suggest 2-3 specific song/artist recommendations when relevant. Available moods: ${MOOD_CARDS.map(m => m.label).join(', ')}.`;

const QUICK_PROMPTS: { text: string; icon: LucideIcon }[] = [
  { text: "What should I listen to when it's raining?", icon: CloudRain },
  { text: "Songs to hype me up before a workout", icon: Dumbbell },
  { text: "Chill beats for late night coding", icon: Code },
  { text: "Romantic playlist for a date night", icon: Heart },
  { text: "I'm feeling nostalgic, suggest something", icon: Moon },
];

function generateAIResponse(userMessage: string): string {
  const msg = userMessage.toLowerCase();

  if (msg.includes('rain') || msg.includes('rainy') || msg.includes('storm')) {
    return `Perfect rainy day music exists! For that cozy, introspective vibe I'd suggest:\n\n• **"Heat Waves"** by Glass Animals — dreamy and melancholic\n• **"drivers license"** by Olivia Rodrigo — emotionally raw\n• **Lo-fi study beats** — perfect background for rainy afternoons\n\nShall I build you a rainy day playlist?`;
  }
  if (msg.includes('workout') || msg.includes('gym') || msg.includes('run') || msg.includes('exercise')) {
    return `Time to crush it! Here's what'll get your blood pumping:\n\n• **"Industry Baby"** by Lil Nas X & Jack Harlow — unstoppable energy\n• **"good 4 u"** by Olivia Rodrigo — angry energy works great\n• **"Blinding Lights"** by The Weeknd — perfect BPM for running\n\nI can create a full workout playlist with tracks above 140 BPM!`;
  }
  if (msg.includes('sad') || msg.includes('heartbreak') || msg.includes('breakup') || msg.includes('cry')) {
    return `Sometimes we just need to feel it fully. Here are songs that understand:\n\n• **"drivers license"** by Olivia Rodrigo — raw heartbreak\n• **"Ghost"** by Justin Bieber — quiet grief\n• **"Anti-Hero"** by Taylor Swift — self-reflective sadness\n\nMusic can be healing. Would you like a playlist to help process those feelings?`;
  }
  if (msg.includes('happy') || msg.includes('joy') || msg.includes('excited') || msg.includes('good mood')) {
    return `Spread those good vibes! Here's what matches your energy:\n\n• **"Levitating"** by Dua Lipa — pure euphoria\n• **"About Damn Time"** by Lizzo — celebrate yourself\n• **"Watermelon Sugar"** by Harry Styles — carefree summer feeling\n\nLet me curate a happiness playlist for you!`;
  }
  if (msg.includes('chill') || msg.includes('relax') || msg.includes('calm') || msg.includes('study') || msg.includes('focus') || msg.includes('code')) {
    return `Getting into the zone — these tracks will help you focus:\n\n• **"Lo-Fi Study Beats"** — perfect concentration background\n• **"Peaches"** by Justin Bieber — mellow R&B vibes\n• **"Mood"** by 24kGoldn — effortlessly chill\n\nWant a focus playlist curated for deep work sessions?`;
  }
  if (msg.includes('romantic') || msg.includes('love') || msg.includes('date') || msg.includes('crush')) {
    return `Setting the mood for love — these will do the trick:\n\n• **"Golden Hour"** by JVKE — genuinely magical\n• **"Kiss Me More"** by Doja Cat ft. SZA — smooth and sensual\n• **"Fly Me to the Moon"** by Frank Sinatra — timeless classic\n\nShould I build the perfect date night playlist?`;
  }
  if (msg.includes('nostalgic') || msg.includes('memories') || msg.includes('throwback') || msg.includes('old')) {
    return `Diving into the past — these songs hit different:\n\n• **"Running Up That Hill"** by Kate Bush — timeless and powerful\n• **"Heat Waves"** by Glass Animals — dreamy nostalgia\n• **"Midnight Rain"** by Taylor Swift — late-night reflections\n\nNostalgia is such a beautiful feeling. Want a full throwback playlist?`;
  }
  if (msg.includes('night') || msg.includes('midnight') || msg.includes('late')) {
    return `Late night energy hits different. Here's the perfect soundtrack:\n\n• **"Blinding Lights"** by The Weeknd — iconic night drive anthem\n• **"Save Your Tears"** by The Weeknd — melancholic night vibes\n• **"Midnight Rain"** by Taylor Swift — made for midnight\n\nThe night is yours. Want a full late-night playlist?`;
  }
  if (msg.includes('dance') || msg.includes('party') || msg.includes('club')) {
    return `Let's get the party started! These are guaranteed floor-fillers:\n\n• **"Levitating"** by Dua Lipa — impossible not to dance\n• **"Shivers"** by Ed Sheeran — infectious energy\n• **"About Damn Time"** by Lizzo — everyone dances to this\n\nI can create the ultimate party playlist — just say the word!`;
  }
  if (msg.includes('playlist') || msg.includes('create') || msg.includes('make') || msg.includes('build')) {
    return `I'd love to create a playlist for you! Tell me:\n\n1. What's your current **mood or vibe**?\n2. Any specific **activity** you're doing?\n3. Any **genre preferences**?\n\nWith that info I can curate something perfectly tailored to you.`;
  }
  if (msg.includes('hello') || msg.includes('hi') || msg.includes('hey') || msg.includes('what') || msg.includes('who are you')) {
    return `Hey there! I'm **MoodBeat AI** — your personal music companion.\n\nI can:\n• Recommend songs based on your **mood or emotion**\n• Suggest playlists for any **activity**\n• Help you discover music that fits your **vibe**\n• Answer any music-related questions\n\nJust tell me how you're feeling or what you're up to, and I'll find the perfect soundtrack for your moment!`;
  }

  const moods = ['sad', 'happy', 'energetic', 'chill', 'romantic', 'nostalgic'];
  const detectedMood = moods.find(m => msg.includes(m));

  if (detectedMood) {
    return `I can feel that ${detectedMood} energy! Let me suggest some tracks that match perfectly. Try selecting the **${detectedMood.charAt(0).toUpperCase() + detectedMood.slice(1)}** mood on the Discover page for a full AI-curated playlist, or tell me more about what you're looking for!`;
  }

  return `That's a great vibe to explore! Music is all about matching the moment. Could you tell me:\n\n• What **emotion** best describes how you're feeling?\n• What **activity** are you doing?\n• Any specific **genre** you're in the mood for?\n\nI'll find the perfect tracks for your exact moment!`;
}

export function AIChat({ userId, onAuthRequired, onMoodDetected }: AIChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      user_id: '',
      role: 'assistant',
      content: `Hey! I'm your **MoodBeat AI** — tell me how you're feeling or what you're up to, and I'll find the perfect music for your moment. Try asking about workouts, rainy days, late-night vibes, heartbreak playlists — anything!`,
      created_at: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;
    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      user_id: userId || '',
      role: 'user',
      content: text,
      created_at: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    if (userId) {
      supabase.from('chat_messages').insert({ user_id: userId, role: 'user', content: text }).then(() => {});
    }

    await new Promise(r => setTimeout(r, 800 + Math.random() * 600));

    const aiText = generateAIResponse(text);
    const aiMsg: ChatMessage = {
      id: `a-${Date.now()}`,
      user_id: '',
      role: 'assistant',
      content: aiText,
      created_at: new Date().toISOString(),
    };

    setIsTyping(false);
    setMessages(prev => [...prev, aiMsg]);

    if (userId) {
      supabase.from('chat_messages').insert({ user_id: userId, role: 'assistant', content: aiText }).then(() => {});
    }

    const textLower = text.toLowerCase();
    const detectedMoodCard = MOOD_CARDS.find(m =>
      textLower.includes(m.label.toLowerCase()) ||
      m.tags.some(tag => textLower.includes(tag))
    );
    if (detectedMoodCard && onMoodDetected) {
      onMoodDetected(detectedMoodCard);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const renderMessage = (content: string) => {
    return content.split('\n').map((line, i) => {
      const boldLine = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      const bullet = line.startsWith('•');
      return (
        <p
          key={i}
          className={`${bullet ? 'ml-1' : ''} ${i > 0 ? 'mt-1' : ''} text-sm leading-relaxed`}
          dangerouslySetInnerHTML={{ __html: boldLine }}
        />
      );
    });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-200px)] min-h-[500px]">
      {/* Header */}
      <div className="glass-card p-4 mb-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center animate-pulse-slow">
          <Bot size={18} className="text-white" />
        </div>
        <div>
          <h3 className="text-white font-semibold text-sm">MoodBeat AI</h3>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-white/40 text-xs">Online · Music Expert</span>
          </div>
        </div>
        <div className="ml-auto">
          <Sparkles size={16} className="text-emerald-400/60" />
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1 mb-4 scrollbar-thin">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex gap-3 animate-fade-in ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${
              msg.role === 'assistant'
                ? 'bg-gradient-to-br from-emerald-400 to-teal-600'
                : 'bg-white/10 border border-white/20'
            }`}>
              {msg.role === 'assistant'
                ? <Music size={14} className="text-white" />
                : <User size={14} className="text-white/70" />
              }
            </div>
            <div className={`max-w-[80%] px-4 py-3 rounded-2xl ${
              msg.role === 'user'
                ? 'bg-emerald-500/20 border border-emerald-500/20 text-white rounded-tr-sm'
                : 'bg-white/5 border border-white/10 text-white/90 rounded-tl-sm'
            }`}>
              {renderMessage(msg.content)}
              <p className="text-white/25 text-xs mt-2">
                {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex gap-3 animate-fade-in">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center flex-shrink-0">
              <Music size={14} className="text-white" />
            </div>
            <div className="bg-white/5 border border-white/10 px-4 py-3 rounded-2xl rounded-tl-sm">
              <div className="flex items-center gap-1">
                {[0, 1, 2].map(i => (
                  <div
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick prompts */}
      <div className="flex gap-2 mb-3 overflow-x-auto pb-1">
        {QUICK_PROMPTS.map(p => {
          const Icon = p.icon;
          return (
            <button
              key={p.text}
              onClick={() => sendMessage(p.text)}
              className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 text-xs transition-all"
            >
              <Icon size={12} />
              <span className="whitespace-nowrap">{p.text.split(' ').slice(0, 4).join(' ')}...</span>
            </button>
          );
        })}
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="flex gap-3">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Describe your mood or ask for recommendations..."
          className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-emerald-500/40 text-sm transition-all"
        />
        <button
          type="submit"
          disabled={!input.trim() || isTyping}
          className="w-12 h-12 rounded-2xl btn-primary flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  );
}
