import React, { useEffect } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { VideoView, useVideoPlayer } from 'expo-video';

import { alpha, gradients, layout, radius } from '../../../shared/theme/tokens';
import { AudioPlayer } from './AudioPlayer';

interface QuestionMediaCardProps {
  mediaUrl: string;
  mediaType: 'image' | 'video' | 'audio';
  onMediaPlayingChange?: (playing: boolean) => void;
}

export function QuestionMediaCard({ mediaUrl, mediaType, onMediaPlayingChange }: QuestionMediaCardProps) {
  // useVideoPlayer auto-releases the player when the component unmounts.
  const player = useVideoPlayer(
    mediaType === 'video' ? { uri: mediaUrl } : null,
    (p) => {
      p.loop = false;
    },
  );

  // Subscribe to playing-state changes and forward them to the parent.
  useEffect(() => {
    if (mediaType !== 'video') return;

    const sub = player.addListener('playingChange', ({ isPlaying }) => {
      onMediaPlayingChange?.(isPlaying);
    });

    return () => sub.remove();
  }, [mediaType, onMediaPlayingChange]);

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
        <VideoView
          player={player}
          style={styles.fill}
          nativeControls
          contentFit="contain"
          allowsFullscreen
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
