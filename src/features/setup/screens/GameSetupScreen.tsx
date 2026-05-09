import React, { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';

import { RootStackParamList } from '../../../navigation/RootNavigator';
import { SubcategoryGrid } from '../components/SubcategoryGrid';
import { TeamNameFields } from '../components/TeamNameFields';
import { useGameStore } from '../../game/store/useGameStore';
import { PrimaryButton } from '../../../shared/components/PrimaryButton';
import { colors } from '../../../shared/theme/colors';
import { fetchGameCategories } from '../../../services/supabase/categoryService';
import { MIN_SUBCATEGORIES_PER_MATCH } from '../../../services/supabase/gameService';
import { TvSessionModal } from '../../tv/TvSessionModal';
import { ConnectTvModal } from '../../tv/ConnectTvModal';

type Props = NativeStackScreenProps<RootStackParamList, 'GameSetup'>;

export function GameSetupScreen({ navigation }: Props) {
  const [showTvModal, setShowTvModal] = useState(false);
  const [showConnectModal, setShowConnectModal] = useState(false);
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

  const canStart = selectedSubcategoryIds.length >= MIN_SUBCATEGORIES_PER_MATCH;

  React.useEffect(() => {
    if (categoriesQuery.data) {
      setAvailableCategories(categoriesQuery.data);
    }
  }, [categoriesQuery.data, setAvailableCategories]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>So2alGawab</Text>
          <Text style={styles.title}>اختر نوع التحدي وابدأ العرض.</Text>
          <Text style={styles.subtitle}>
            اختَر من فئتين إلى ست فئات من الشبكة التالية، وبعدها يبدأ المقدم إدارة الجولة مباشرة.
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
        </View>
      </ScrollView>

      <View style={styles.footer}>
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
        <View style={styles.tvRow}>
          <Pressable
            style={({ pressed }) => [styles.tvBtn, pressed && styles.tvBtnPressed]}
            onPress={() => setShowTvModal(true)}
          >
            <Text style={styles.tvBtnText}>📺  بدء جلسة TV</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.tvBtn, pressed && styles.tvBtnPressed]}
            onPress={() => setShowConnectModal(true)}
          >
            <Text style={styles.tvBtnText}>🔗  ربط TV</Text>
          </Pressable>
        </View>
      </View>

      <TvSessionModal visible={showTvModal} onClose={() => setShowTvModal(false)} />
      <ConnectTvModal visible={showConnectModal} onClose={() => setShowConnectModal(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 8,
  },
  footer: {
    padding: 20,
    paddingTop: 12,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  header: {
    gap: 8,
  },
  eyebrow: {
    color: colors.primary,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    textAlign: 'right',
  },
  title: {
    color: colors.text,
    fontSize: 32,
    lineHeight: 38,
    fontWeight: '800',
    textAlign: 'right',
  },
  subtitle: {
    color: colors.mutedText,
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'right',
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
  tvRow: {
    flexDirection: 'row',
    marginTop: 10,
    gap: 10,
  },
  tvBtn: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tvBtnPressed: {
    opacity: 0.7,
  },
  tvBtnText: {
    color: colors.text,
    fontWeight: '700',
    fontSize: 15,
  },
});
