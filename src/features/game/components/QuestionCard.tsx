import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { ResizeMode, Video } from 'expo-av';
import { useTranslation } from 'react-i18next';

import { Question } from '../types/game';
import { alpha, dark, palette, r, spacing, textStyle } from '../../../shared/theme/tokens';
import { AudioPlayer } from './AudioPlayer';
import { useLocale } from '../../../localization/useLocale';

interface QuestionCardProps {
  categoryName: string;
  subcategoryName: string;
  question: Question;
  hint: string | null;
}

export function QuestionCard({ categoryName, subcategoryName, question, hint }: QuestionCardProps) {
  const { t } = useTranslation('game');
  const { textAlign, rowLTR } = useLocale('game');

  return (
    <View style={styles.card}>
      <View style={[styles.metaRow, { flexDirection: rowLTR }]}>
        <View style={styles.metaCopy}>
          <Text style={[styles.category,    { textAlign }]}>{categoryName}</Text>
          <Text style={[styles.subcategory, { textAlign }]}>{subcategoryName}</Text>
        </View>
        <View style={styles.pointsBadge}>
          <Text style={styles.pointsText}>
            {t('question_card.points', { points: question.points })}
          </Text>
        </View>
      </View>

      {question.mediaUrl ? (
        <>
          {question.mediaType === 'image' && (
            <View style={styles.imageFrame}>
              <Image
                source={{ uri: question.mediaUrl }}
                style={styles.mediaFill}
                resizeMode="contain"
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

      <Text style={[styles.prompt, { textAlign }]}>{question.prompt}</Text>

      {hint ? (
        <View style={styles.hintBox}>
          <Text style={[styles.hintLabel, { textAlign }]}>{t('question_card.hint_label')}</Text>
          <Text style={[styles.hintText,  { textAlign }]}>{hint}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: dark.bgGlass,
    borderRadius: r.card,
    padding: 18,
    borderWidth: 1,
    borderColor: dark.borderSubtle,
    gap: 14,
  },
  metaRow: {
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.xs,
  },
  metaCopy: { flex: 1, gap: spacing['3xs'] },
  category: {
    color: dark.textAccent,
    ...textStyle.labelMd,
    fontWeight: '800',
  },
  subcategory: {
    color: dark.textSecondary,
    ...textStyle.labelMd,
    fontWeight: '600',
  },
  pointsBadge: {
    backgroundColor: alpha.gold[8],
    borderRadius: r.chip,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: palette.gold[600],
    flexShrink: 0,
  },
  pointsText: {
    color: dark.textAccent,
    ...textStyle.labelSm,
    fontWeight: '800',
  },
  imageFrame: {
    alignSelf: 'stretch',
    height: 200,
    borderRadius: r.card,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: dark.borderSubtle,
    backgroundColor: dark.bgSurface,
  },
  mediaFill: { width: '100%', height: '100%' },
  videoFrame: {
    borderRadius: r.card,
    overflow: 'hidden',
    backgroundColor: '#000000',
    borderWidth: 1,
    borderColor: dark.borderSubtle,
  },
  video: { width: '100%', height: 220 },
  audioFrame: {
    backgroundColor: dark.bgGlassSubtle,
    borderRadius: r.card,
    paddingVertical: 28,
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: dark.borderSubtle,
    alignItems: 'center',
  },
  prompt: {
    color: dark.textPrimary,
    ...textStyle.displayQuestionSm,
    lineHeight: 36,
    fontWeight: '800',
  },
  hintBox: {
    backgroundColor: alpha.gold[8],
    borderRadius: r.card,
    padding: 14,
    gap: 6,
    borderWidth: 1,
    borderColor: palette.gold[600],
  },
  hintLabel: {
    color: dark.textAccent,
    ...textStyle.labelMd,
    fontWeight: '800',
  },
  hintText: {
    color: dark.textPrimary,
    ...textStyle.bodyPrimary,
    lineHeight: 22,
  },
});
