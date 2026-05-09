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
  type Icon as PhosphorIcon,
} from 'phosphor-react-native';
import { Settings, Info } from 'lucide-react-native';

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
  | 'close' | 'check' | 'circle'
  // Utility / settings (Lucide)
  | 'settings' | 'info';

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
};

export function AppIcon({ name, size = 24, color = '#000000', weight = 'regular' }: AppIconProps) {
  if (name === 'settings') {
    return <Settings size={size} color={color} strokeWidth={2} />;
  }
  if (name === 'info') {
    return <Info size={size} color={color} strokeWidth={2} />;
  }

  const PhIcon = PHOSPHOR_MAP[name];
  if (!PhIcon) return null;
  return <PhIcon size={size} color={color} weight={weight} />;
}
