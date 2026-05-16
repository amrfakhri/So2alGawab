import React, { useEffect, useRef } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AVPlaybackStatus, ResizeMode, Video } from 'expo-av';

import { alpha, gradients, layout, radius } from '../../../shared/theme/tokens';
import { AudioPlayer } from './AudioPlayer';

interface QuestionMediaCardProps {
  mediaUrl: string;
  mediaType: 'image' | 'video' | 'audio';
  onMediaPlayingChange?: (playing: boolean) => void;
}

export function QuestionMediaCard({ mediaUrl, mediaType, onMediaPlayingChange }: QuestionMediaCardProps) {
  const videoRef = useRef<Video>(null);
  // Track last reported play state to avoid calling onMediaPlayingChange on every status tick
  const lastVideoPlaying = useRef<boolean | null>(null);

  // Stop video playback when this card unmounts (question changes or screen leaves)
  useEffect(() => {
    return () => {
      videoRef.current?.stopAsync().catch(() => {});
    };
  }, []);

  function handleVideoStatus(status: AVPlaybackStatus) {
    if (!status.isLoaded) return;
    const playing = status.isPlaying;
    if (playing !== lastVideoPlaying.current) {
      lastVideoPlaying.current = playing;
      onMediaPlayingChange?.(playing);
    }
  }

  return (
    <View style={styles.shell}>
      <LinearGradient
        colors={gradients.questionCard}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.border} />

      {mediaType === 'image' && (
        <Image
          source={{ uri: mediaUrl }}
          style={styles.fill}
          resizeMode="contain"
        />
      )}
      {mediaType === 'video' && (
        <Video
          ref={videoRef}
          source={{ uri: mediaUrl }}
          style={styles.fill}
          useNativeControls
          resizeMode={ResizeMode.CONTAIN}
          onPlaybackStatusUpdate={handleVideoStatus}
        />
      )}
      {mediaType === 'audio' && (
        <View style={styles.audioWrap}>
          <AudioPlayer uri={mediaUrl} onPlayingChange={onMediaPlayingChange} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    height: layout.mediaHeight,
    borderRadius: radius['2xl'],
    overflow: 'hidden',
    padding: 12,
  },
  border: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: radius['2xl'],
    borderWidth: 1,
    borderColor: alpha.white[8],
  },
  fill: {
    flex: 1,
    width: '100%',
    borderRadius: radius.lg,
  },
  audioWrap: {
    flex: 1,
    justifyContent: 'center',
  },
});
