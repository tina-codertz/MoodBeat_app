import {
  Smile,
  Zap,
  Coffee,
  Frown,
  Heart,
  Target,
  Moon,
  Flame,
  CloudDrizzle,
  Sun,
  MoonStar,
  Swords,
  Dumbbell,
  BookOpen,
  Car,
  ChefHat,
  BedDouble,
  PartyPopper,
  Leaf,
  Activity,
  Sparkles,
  CloudRain,
  Code,
  Music,
  Check,
  type LucideIcon,
} from 'lucide-react';

const ICON_MAP: Record<string, LucideIcon> = {
  Smile,
  Zap,
  Coffee,
  Frown,
  Heart,
  Target,
  Moon,
  Flame,
  CloudDrizzle,
  Sun,
  MoonStar,
  Swords,
  Dumbbell,
  BookOpen,
  Car,
  ChefHat,
  BedDouble,
  PartyPopper,
  Leaf,
  Activity,
  Sparkles,
  CloudRain,
  Code,
  Music,
  Check,
};

interface MoodIconProps {
  name: string;
  size?: number;
  className?: string;
}

export function MoodIcon({ name, size = 24, className }: MoodIconProps) {
  const Icon = ICON_MAP[name];
  if (!Icon) return null;
  return <Icon size={size} className={className} />;
}
