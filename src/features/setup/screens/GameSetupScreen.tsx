import React, { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

import { RootStackParamList } from '../../../navigation/RootNavigator';
import { SubcategoryGrid } from '../components/SubcategoryGrid';
import { TeamNameFields } from '../components/TeamNameFields';
import { useGameStore } from '../../game/store/useGameStore';
import { PrimaryButton } from '../../../shared/components/PrimaryButton';
import { colors } from '../../../shared/theme/colors';
import { fetchGameCategories } from '../../../services/supabase/categoryService';
import { MIN_SUBCATEGORIES_PER_MATCH } from '../../../services/supabase/gameService';
import { CastToTvModal } from '../../tv/CastToTvModal';
import { LanguageSwitcher } from '../../settings/LanguageSwitcher';
import { useLanguageStore } from '../../../localization/languageStore';
import { AppIcon } from '../../../shared/components/AppIcon';
import { SelectedCategoriesPreview } from '../components/SelectedCategoriesPreview';
import { GameModeSheet } from '../../game/components/GameModeSheet';
import { GameMode } from '../../game/types/game';

type Props = NativeStackScreenProps<RootStackParamList, 'GameSetup'>;

export function GameSetupScreen({ navigation }: Props) {
  const [showCastModal, setShowCastModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showModeSheet, setShowModeSheet] = useState(false);
  const { t } = useTranslation(['setup', 'common']);
  const { isRTL } = useLanguageStore();

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

  const selectedSubcategories = availableCategories
    .flatMap((cat) => cat.subcategories)
    .filter((sub) => selectedSubcategoryIds.includes(sub.id));

  React.useEffect(() => {
    if (categoriesQuery.data) {
      setAvailableCategories(categoriesQuery.data);
    }
  }, [categoriesQuery.data, setAvailableCategories]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={[styles.headerRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <Text style={[styles.eyebrow, { textAlign: isRTL ? 'right' : 'left' }]}>
              {t('setup:eyebrow')}
            </Text>
            <Pressable
              onPress={() => setShowSettings(true)}
              style={({ pressed }) => [styles.settingsBtn, pressed && { opacity: 0.6 }]}
              hitSlop={10}
            >
              <AppIcon name="settings" size={22} color={colors.mutedText} />
            </Pressable>
          </View>
          <Text style={[styles.title, { textAlign: isRTL ? 'right' : 'left' }]}>
            {t('setup:title')}
          </Text>
          <Text style={[styles.subtitle, { textAlign: isRTL ? 'right' : 'left' }]}>
            {t('setup:subtitle')}
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
              <Text style={styles.stateTitle}>{t('setup:categories.loading_title')}</Text>
              <Text style={styles.stateCopy}>{t('setup:categories.loading_body')}</Text>
            </View>
          ) : null}

          {categoriesQuery.isError ? (
            <View style={styles.stateCard}>
              <Text style={styles.stateTitle}>{t('setup:categories.error_title')}</Text>
              <Text style={styles.stateCopy}>{t('setup:categories.error_body')}</Text>
              <PrimaryButton
                label={t('common:retry')}
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

      <SelectedCategoriesPreview
        subcategories={selectedSubcategories}
        onRemove={toggleSubcategory}
      />

      <View style={styles.footer}>
        <PrimaryButton
          label={t('setup:start_game')}
          disabled={!canStart || categoriesQuery.isPending}
          onPress={() => setShowModeSheet(true)}
        />
        <View style={styles.tvRow}>
          <Pressable
            style={({ pressed }) => [styles.tvBtn, pressed && styles.tvBtnPressed]}
            onPress={() => setShowCastModal(true)}
          >
            <Text style={styles.tvBtnText}>{t('setup:cast_to_tv')}</Text>
          </Pressable>
        </View>
      </View>

      <CastToTvModal visible={showCastModal} onClose={() => setShowCastModal(false)} />
      <LanguageSwitcher visible={showSettings} onClose={() => setShowSettings(false)} />
      <GameModeSheet
        visible={showModeSheet}
        isLoading={isStartingMatch}
        error={matchError}
        onClose={() => !isStartingMatch && setShowModeSheet(false)}
        onSelectMode={async (mode: GameMode) => {
          const didStart = await startMatch(mode);
          if (didStart) {
            setShowModeSheet(false);
            navigation.replace(mode === 'selection' ? 'SelectionBoard' : 'Question');
          }
        }}
      />
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
  headerRow: {
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  eyebrow: {
    color: colors.primary,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  settingsBtn: {
    padding: 4,
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
  tvRow: {
    marginTop: 10,
  },
  tvBtn: {
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
