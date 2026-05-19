import React from 'react';
import {
  Check,
  X,
  Circle,
  Play,
  Pause,
  Music,
  Image,
  FileText,
  Shuffle,
  MonitorPlay,
  Phone,
  Scissors,
  Diamond,
  Hourglass,
  Handshake,
  Crown,
  LoaderCircle,
  Trophy,
  ChevronRight,
  Settings,
  Settings2,
  Info,
  Search,
  Globe2,
  Bell,
  House,
  Gamepad2,
  User,
  type LucideIcon,
} from 'lucide-react-native';

export type AppIconWeight = 'thin' | 'light' | 'regular' | 'bold' | 'fill' | 'duotone';

export type AppIconName =
  // Media / playback
  | 'play' | 'pause' | 'audio-loading'
  // Game states / TV
  | 'waiting' | 'trophy' | 'handshake' | 'crown' | 'cast-tv' | 'music-note'
  // Lifelines / assists
  | 'lifeline-call' | 'lifeline-discard' | 'lifeline-reward'
  // Content-type badges
  | 'image-type' | 'text-type' | 'mixed-type'
  // Generic UI
  | 'close' | 'check' | 'circle' | 'caret-right'
  // Utility / settings
  | 'settings' | 'settings-2' | 'info' | 'search' | 'globe'
  // Navigation / Home
  | 'bell' | 'home-tab' | 'gamepad' | 'profile' | 'leaderboard';

export interface AppIconProps {
  name: AppIconName;
  size?: number;
  color?: string;
  weight?: AppIconWeight;
}

const ICON_MAP: Record<AppIconName, LucideIcon> = {
  'play':             Play,
  'pause':            Pause,
  'audio-loading':    LoaderCircle,
  'waiting':          Hourglass,
  'trophy':           Trophy,
  'handshake':        Handshake,
  'crown':            Crown,
  'cast-tv':          MonitorPlay,
  'music-note':       Music,
  'lifeline-call':    Phone,
  'lifeline-discard': Scissors,
  'lifeline-reward':  Diamond,
  'image-type':       Image,
  'text-type':        FileText,
  'mixed-type':       Shuffle,
  'close':            X,
  'check':            Check,
  'circle':           Circle,
  'caret-right':      ChevronRight,
  'settings':         Settings,
  'settings-2':       Settings2,
  'info':             Info,
  'search':           Search,
  'globe':            Globe2,
  'bell':             Bell,
  'home-tab':         House,
  'gamepad':          Gamepad2,
  'profile':          User,
  'leaderboard':      Trophy,
};

export function AppIcon({ name, size = 24, color = '#000000', weight = 'regular' }: AppIconProps) {
  const Icon = ICON_MAP[name];
  if (!Icon) return null;
  const fill = weight === 'fill' ? color : 'none';
  return <Icon size={size} color={color} fill={fill} strokeWidth={2} />;
}
