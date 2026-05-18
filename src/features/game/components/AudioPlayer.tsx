import React, { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useAudioPlayer, useAudioPlayerStatus, setAudioModeAsync } from 'expo-audio';
import { useTranslation } from 'react-i18next';
import { colors } from '../../../shared/theme/colors';
import { AppIcon } from '../../../shared/components/AppIcon';

interface AudioPlayerProps {
  uri: string;
  onPlayingChange?: (playing: boolean) => void;
}

export function AudioPlayer({ uri, onPlayingChange }: AudioPlayerProps) {
  const { t } = useTranslation('game');

  // useAudioPlayer auto-releases the player when the component unmounts.
  const player = useAudioPlayer({ uri });
  const status = useAudioPlayerStatus(player);

  // Enable playback through iOS silent switch once on mount.
  useEffect(() => {
    setAudioModeAsync({ playsInSilentMode: true }).catch(() => {});
  }, []);

  // Notify parent whenever the playing state changes.
  useEffect(() => {
    onPlayingChange?.(status.playing);
  }, [status.playing]);

  // Notify parent when a non-looping track finishes.
  useEffect(() => {
    if (status.didJustFinish) {
      onPlayingChange?.(false);
    }
  }, [status.didJustFinish]);

  const isLoading = !status.isLoaded;
  const isPlaying = status.playing;

  function togglePlay() {
    if (isLoading) return;
    if (isPlaying) {
      player.pause();
    } else {
      player.play();
    }
  }

  const statusLabel = isLoading
    ? t('audio.loading')
    : isPlaying
      ? t('audio.playing')
      : t('audio.tap_to_play');

  return (
    <View style={styles.container}>
      <Pressable
        onPress={togglePlay}
        disabled={isLoading}
        style={({ pressed }) => [styles.playButton, pressed && styles.playButtonPressed]}
      >
        <AppIcon
          name={isLoading ? 'audio-loading' : isPlaying ? 'pause' : 'play'}
          size={30}
          color="#FFFFFF"
          weight={isLoading ? 'regular' : 'fill'}
        />
      </Pressable>
      <Text style={styles.label}>{statusLabel}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 14,
  },
  playButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButtonPressed: {
    backgroundColor: colors.primaryDark,
  },
  label: {
    color: colors.primaryDark,
    fontWeight: '700',
    fontSize: 14,
  },
});
