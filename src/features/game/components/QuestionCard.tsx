import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { ResizeMode, Video } from 'expo-av';
import { useTranslation } from 'react-i18next';

import { Question } from '../types/game';
import { colors } from '../../../shared/theme/colors';
import { AudioPlayer } from './AudioPlayer';

interface QuestionCardProps {
  categoryName: string;
  subcategoryName: string;
  question: Question;
  hint: string | null;
}

export function QuestionCard({
  categoryName,
  subcategoryName,
  question,
  hint,
}: QuestionCardProps) {
  const { t } = useTranslation('game');

  return (
    <View style={styles.card}>
      <View style={styles.metaRow}>
        <View style={styles.metaCopy}>
          <Text style={styles.category}>{categoryName}</Text>
          <Text style={styles.subcategory}>{subcategoryName}</Text>
        </View>
        <Text style={styles.points}>
          {t('question_card.points', { points: question.points })}
        </Text>
      </View>

      {question.mediaUrl ? (
        <>
          {question.mediaType === 'image' && (
            <View style={styles.imageFrame}>
              <Image
                source={{ uri: question.mediaUrl }}
                style={styles.image}
                resizeMode="cover"
              />
            </View>
          )}

          {question.mediaType === 'video' && (
            <View style={styles.videoFrame}>
              <Video
                source={{ uri: question.mediaUrl }}
                style={styles.video}
                useNativeControls
                resizeMode={ResizeMode.CONTAIN}
              />
            </View>
          )}

          {question.mediaType === 'audio' && (
            <View style={styles.audioFrame}>
              <AudioPlayer uri={question.mediaUrl} />
            </View>
          )}
        </>
      ) : null}

      <Text style={styles.prompt}>{question.prompt}</Text>

      {hint ? (
        <View style={styles.hintBox}>
          <Text style={styles.hintLabel}>{t('question_card.hint_label')}</Text>
          <Text style={styles.hintText}>{hint}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 14,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  metaCopy: {
    flex: 1,
    gap: 4,
  },
  category: {
    color: colors.secondary,
    fontWeight: '800',
    fontSize: 14,
    textAlign: 'right',
  },
  subcategory: {
    color: colors.mutedText,
    fontWeight: '600',
    fontSize: 13,
    textAlign: 'right',
  },
  points: {
    color: colors.primary,
    fontWeight: '800',
    fontSize: 14,
  },
  imageFrame: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#EDD2BE',
  },
  image: {
    width: '100%',
    height: 220,
  },
  videoFrame: {
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#000000',
    borderWidth: 1,
    borderColor: '#EDD2BE',
  },
  video: {
    width: '100%',
    height: 220,
  },
  audioFrame: {
    backgroundColor: '#FFF5EA',
    borderRadius: 20,
    paddingVertical: 28,
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: '#F1D8C5',
    alignItems: 'center',
  },
  prompt: {
    color: colors.text,
    fontSize: 24,
    lineHeight: 36,
    fontWeight: '800',
    textAlign: 'right',
  },
  hintBox: {
    backgroundColor: '#FFF5EA',
    borderRadius: 16,
    padding: 14,
    gap: 6,
  },
  hintLabel: {
    color: colors.primaryDark,
    fontWeight: '800',
    textAlign: 'right',
  },
  hintText: {
    color: colors.text,
    lineHeight: 22,
    textAlign: 'right',
  },
});
