import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

import { Question } from '../types/game';
import { colors } from '../../../shared/theme/colors';

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
  return (
    <View style={styles.card}>
      <View style={styles.metaRow}>
        <View style={styles.metaCopy}>
          <Text style={styles.category}>{categoryName}</Text>
          <Text style={styles.subcategory}>{subcategoryName}</Text>
        </View>
        <Text style={styles.points}>{question.points} pts</Text>
      </View>
      {question.mediaUrl ? (
        <View style={styles.imageFrame}>
          {question.mediaType === 'image' ? (
            <Image
              source={{ uri: question.mediaUrl }}
              style={styles.image}
              resizeMode="cover"
            />
          ) : (
            <Text style={styles.imageLabel}>
              {question.mediaType === 'video' ? 'VIDEO' : 'AUDIO'}
            </Text>
          )}
        </View>
      ) : null}
      <Text style={styles.prompt}>{question.prompt}</Text>
      {hint ? (
        <View style={styles.hintBox}>
          <Text style={styles.hintLabel}>Hint</Text>
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
  },
  subcategory: {
    color: colors.mutedText,
    fontWeight: '600',
    fontSize: 13,
  },
  points: {
    color: colors.primary,
    fontWeight: '800',
    fontSize: 14,
  },
  prompt: {
    color: colors.text,
    fontSize: 24,
    lineHeight: 32,
    fontWeight: '800',
  },
  imageFrame: {
    minHeight: 180,
    borderRadius: 20,
    backgroundColor: '#F6E7DB',
    borderWidth: 1,
    borderColor: '#EDD2BE',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 220,
  },
  imageLabel: {
    color: colors.primaryDark,
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: 2,
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
  },
  hintText: {
    color: colors.text,
    lineHeight: 20,
  },
});
