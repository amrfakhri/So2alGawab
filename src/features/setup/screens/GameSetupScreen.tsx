import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';

import { RootStackParamList } from '../../../navigation/RootNavigator';
import { SubcategoryGrid } from '../components/SubcategoryGrid';
import { TeamNameFields } from '../components/TeamNameFields';
import { useGameStore } from '../../game/store/useGameStore';
import { PrimaryButton } from '../../../shared/components/PrimaryButton';
import { Screen } from '../../../shared/components/Screen';
import { colors } from '../../../shared/theme/colors';
import { fetchGameCategories } from '../../../services/supabase/categoryService';

type Props = NativeStackScreenProps<RootStackParamList, 'GameSetup'>;

export function GameSetupScreen({ navigation }: Props) {
  const {
    availableCategories,
    selectedSubcategoryIds,
    teams,
    isStartingMatch,
    matchError,
    setAvailableCategories,
    setTeamName,
    toggleSubcategory,
    startMatch,
  } = useGameStore();
  const categoriesQuery = useQuery({
    queryKey: ['game-categories'],
    queryFn: fetchGameCategories,
    staleTime: 5 * 60 * 1000,
  });

  const canStart = selectedSubcategoryIds.length === 2;

  React.useEffect(() => {
    if (categoriesQuery.data) {
      setAvailableCategories(categoriesQuery.data);
    }
  }, [categoriesQuery.data, setAvailableCategories]);

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

        {categoriesQuery.isPending ? (
          <View style={styles.stateCard}>
            <ActivityIndicator color={colors.primary} />
            <Text style={styles.stateTitle}>جاري تحميل الفئات</Text>
            <Text style={styles.stateCopy}>
              نحمّل التصنيفات والأسئلة المتاحة من قاعدة البيانات.
            </Text>
          </View>
        ) : null}

        {categoriesQuery.isError ? (
          <View style={styles.stateCard}>
            <Text style={styles.stateTitle}>تعذر تحميل الفئات</Text>
            <Text style={styles.stateCopy}>
              حدثت مشكلة أثناء الاتصال بقاعدة البيانات. حاول مرة أخرى.
            </Text>
            <PrimaryButton
              label="إعادة المحاولة"
              onPress={() => categoriesQuery.refetch()}
            />
          </View>
        ) : null}

        {!categoriesQuery.isPending && !categoriesQuery.isError ? (
          <SubcategoryGrid
            categories={availableCategories}
            selectedSubcategoryIds={selectedSubcategoryIds}
            onToggle={toggleSubcategory}
          />
        ) : null}

        {matchError ? (
          <Text style={styles.matchError}>{matchError}</Text>
        ) : null}

        <PrimaryButton
          label={isStartingMatch ? 'جاري تحميل الأسئلة...' : 'ابدأ اللعبة'}
          disabled={!canStart || categoriesQuery.isPending || isStartingMatch}
          onPress={async () => {
            const didStart = await startMatch();
            if (didStart) {
              navigation.replace('Question');
            }
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
  stateCard: {
    backgroundColor: colors.card,
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 10,
    alignItems: 'center',
  },
  stateTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '800',
  },
  stateCopy: {
    color: colors.mutedText,
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
  },
  matchError: {
    color: '#B42318',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
});
