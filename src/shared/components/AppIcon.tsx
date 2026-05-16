import React from 'react';
import {
  CheckIcon,
  XIcon,
  CircleIcon,
  PlayIcon,
  PauseIcon,
  MusicNoteIcon,
  ImageIcon,
  ArticleIcon,
  ShuffleIcon,
  MonitorPlayIcon,
  PhoneIcon,
  ScissorsIcon,
  DiamondIcon,
  HourglassIcon,
  HandshakeIcon,
  CrownIcon,
  CircleNotchIcon,
  TrophyIcon,
  CaretRightIcon,
  type Icon as PhosphorIcon,
} from 'phosphor-react-native';
import { Settings, Info, Search, Globe2, Bell, House, Gamepad2, User, Trophy as LucideTrophy } from 'lucide-react-native';

// Phosphor: gameplay, TV, emotional moments, assists, timers, celebrations, status
// Lucide:   utility/system UI, settings, navigation, technical actions

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
  // Utility / settings (Lucide)
  | 'settings' | 'info' | 'search' | 'globe'
  // Navigation / Home (Lucide)
  | 'bell' | 'home-tab' | 'gamepad' | 'profile' | 'leaderboard';

export interface AppIconProps {
  name: AppIconName;
  size?: number;
  color?: string;
  weight?: AppIconWeight;
}

const PHOSPHOR_MAP: Partial<Record<AppIconName, PhosphorIcon>> = {
  'play':             PlayIcon,
  'pause':            PauseIcon,
  'audio-loading':    CircleNotchIcon,
  'waiting':          HourglassIcon,
  'trophy':           TrophyIcon,
  'handshake':        HandshakeIcon,
  'crown':            CrownIcon,
  'cast-tv':          MonitorPlayIcon,
  'music-note':       MusicNoteIcon,
  'lifeline-call':    PhoneIcon,
  'lifeline-discard': ScissorsIcon,
  'lifeline-reward':  DiamondIcon,
  'image-type':       ImageIcon,
  'text-type':        ArticleIcon,
  'mixed-type':       ShuffleIcon,
  'close':            XIcon,
  'check':            CheckIcon,
  'circle':           CircleIcon,
  'caret-right':      CaretRightIcon,
};

export function AppIcon({ name, size = 24, color = '#000000', weight = 'regular' }: AppIconProps) {
  if (name === 'settings')    return <Settings size={size} color={color} strokeWidth={2} />;
  if (name === 'info')        return <Info size={size} color={color} strokeWidth={2} />;
  if (name === 'search')      return <Search size={size} color={color} strokeWidth={2} />;
  if (name === 'globe')       return <Globe2 size={size} color={color} strokeWidth={2} />;
  if (name === 'bell')        return <Bell size={size} color={color} strokeWidth={2} />;
  if (name === 'home-tab')    return <House size={size} color={color} strokeWidth={2} />;
  if (name === 'gamepad')     return <Gamepad2 size={size} color={color} strokeWidth={2} />;
  if (name === 'profile')     return <User size={size} color={color} strokeWidth={2} />;
  if (name === 'leaderboard') return <LucideTrophy size={size} color={color} strokeWidth={2} />;

  const PhIcon = PHOSPHOR_MAP[name];
  if (!PhIcon) return null;
  return <PhIcon size={size} color={color} weight={weight} />;
}
