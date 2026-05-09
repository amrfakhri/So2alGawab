import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Audio, AVPlaybackStatus } from 'expo-av';

import { colors } from '../../../shared/theme/colors';

interface AudioPlayerProps {
  uri: string;
}

export function AudioPlayer({ uri }: AudioPlayerProps) {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    return () => {
      sound?.unloadAsync();
    };
  }, [sound]);

  async function togglePlay() {
    if (isLoading) {
      return;
    }

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
      // if loading fails, reset silently so the user can retry
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Pressable
        onPress={togglePlay}
        disabled={isLoading}
        style={({ pressed }) => [styles.playButton, pressed && styles.playButtonPressed]}
      >
        <Text style={styles.playIcon}>
          {isLoading ? '…' : isPlaying ? '⏸' : '▶'}
        </Text>
      </Pressable>
      <Text style={styles.label}>
        {isLoading ? 'جاري التحميل…' : isPlaying ? 'جاري التشغيل' : 'اضغط للتشغيل'}
      </Text>
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
  playIcon: {
    fontSize: 30,
    color: '#FFFFFF',
  },
  label: {
    color: colors.primaryDark,
    fontWeight: '700',
    fontSize: 14,
  },
});
