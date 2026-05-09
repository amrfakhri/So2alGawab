import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Audio, AVPlaybackStatus } from 'expo-av';
import { useTranslation } from 'react-i18next';

import { colors } from '../../../shared/theme/colors';
import { AppIcon } from '../../../shared/components/AppIcon';

interface AudioPlayerProps {
  uri: string;
}

export function AudioPlayer({ uri }: AudioPlayerProps) {
  const { t } = useTranslation('game');
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    return () => {
      sound?.unloadAsync();
    };
  }, [sound]);

  async function togglePlay() {
    if (isLoading) return;

    if (sound) {
      if (isPlaying) {
        await sound.pauseAsync();
        setIsPlaying(false);
      } else {
        await sound.playAsync();
        setIsPlaying(true);
      }
      return;
    }

    setIsLoading(true);
    try {
      await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: true },
        (status: AVPlaybackStatus) => {
          if (status.isLoaded && status.didJustFinish) {
            setIsPlaying(false);
          }
        },
      );
      setSound(newSound);
      setIsPlaying(true);
    } catch {
      // Loading failure is handled silently so the user can retry
    } finally {
      setIsLoading(false);
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
