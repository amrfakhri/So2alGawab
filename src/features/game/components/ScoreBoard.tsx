import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { TeamState, TeamId } from '../types/game';
import { colors } from '../../../shared/theme/colors';

interface ScoreBoardProps {
  teams: Record<TeamId, TeamState>;
  activeTeamId: TeamId;
  currentQuestionNumber: number;
  totalQuestions: number;
}

export function ScoreBoard({
  teams,
  activeTeamId,
  currentQuestionNumber,
  totalQuestions,
}: ScoreBoardProps) {
  return (
    <View style={styles.wrapper}>
      <View style={styles.meta}>
        <Text style={styles.metaText}>
          Question {currentQuestionNumber} / {totalQuestions}
        </Text>
        <Text style={styles.metaText}>Turn: {teams[activeTeamId].name}</Text>
      </View>
      <View style={styles.row}>
        {[teams.A, teams.B].map((team) => {
          const active = team.id === activeTeamId;
          const accent = team.id === 'A' ? colors.teamA : colors.teamB;

          return (
            <View
              key={team.id}
              style={[
                styles.teamCard,
                active && { borderColor: accent, borderWidth: 2 },
              ]}
            >
              <Text style={styles.teamName}>{team.name}</Text>
              <Text style={[styles.score, { color: accent }]}>{team.score}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 12,
  },
  meta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metaText: {
    color: colors.mutedText,
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  teamCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  teamName: {
    color: colors.text,
    fontWeight: '700',
    fontSize: 14,
  },
  score: {
    marginTop: 8,
    fontSize: 28,
    fontWeight: '800',
  },
});
