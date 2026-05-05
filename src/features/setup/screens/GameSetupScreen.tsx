import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { RootStackParamList } from '../../../navigation/RootNavigator';
import { SubcategoryGrid } from '../components/SubcategoryGrid';
import { TeamNameFields } from '../components/TeamNameFields';
import { useGameStore } from '../../game/store/useGameStore';
import { PrimaryButton } from '../../../shared/components/PrimaryButton';
import { Screen } from '../../../shared/components/Screen';
import { colors } from '../../../shared/theme/colors';
import { getQuestionCountBySubcategory } from '../../game/engine/matchBuilder';

type Props = NativeStackScreenProps<RootStackParamList, 'GameSetup'>;

export function GameSetupScreen({ navigation }: Props) {
  const {
    availableCategories,
    selectedSubcategoryIds,
    teams,
    setTeamName,
    toggleSubcategory,
    startMatch,
  } = useGameStore();

  const canStart = selectedSubcategoryIds.length === 2;

  return (
    <Screen scroll>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>So2alGawab</Text>
        <Text style={styles.title}>اختر نوع التحدي وابدأ العرض.</Text>
        <Text style={styles.subtitle}>
          اختَر فئتين من الشبكة التالية، وبعدها يبدأ المقدم إدارة الجولة مباشرة.
        </Text>
      </View>

      <View style={styles.body}>
        <TeamNameFields
          teamAName={teams.A.name}
          teamBName={teams.B.name}
          onChangeTeamA={(value) => setTeamName('A', value)}
          onChangeTeamB={(value) => setTeamName('B', value)}
        />

        <SubcategoryGrid
          categories={availableCategories}
          selectedSubcategoryIds={selectedSubcategoryIds}
          getRemainingGames={getQuestionCountBySubcategory}
          onToggle={toggleSubcategory}
        />

        <PrimaryButton
          label="ابدأ اللعبة"
          disabled={!canStart}
          onPress={() => {
            startMatch();
            navigation.replace('Question');
          }}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: 8,
  },
  eyebrow: {
    color: colors.primary,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  title: {
    color: colors.text,
    fontSize: 32,
    lineHeight: 38,
    fontWeight: '800',
  },
  subtitle: {
    color: colors.mutedText,
    fontSize: 16,
    lineHeight: 24,
  },
  body: {
    marginTop: 24,
    gap: 18,
  },
});
