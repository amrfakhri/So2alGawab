import React, { useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

import { RootStackParamList } from '../../../navigation/RootNavigator';
import { SubcategoryGrid } from '../components/SubcategoryGrid';
import { useGameStore } from '../../game/store/useGameStore';
import { fetchGameCategories } from '../../../services/supabase/categoryService';
import { MIN_SUBCATEGORIES_PER_MATCH } from '../../../services/supabase/gameService';
import { LanguageSwitcher } from '../../settings/LanguageSwitcher';
import { SelectedCategoriesPreview } from '../components/SelectedCategoriesPreview';
import {
  GoldPrimaryButton,
  SetupHeader,
} from '../components/CategorySelectionUI';
import { alpha, dark, r, spacing, textStyle } from '../../../shared/theme/tokens';
import { StatusBar } from 'expo-status-bar';

type Props = NativeStackScreenProps<RootStackParamList, 'GameSetup'>;

export function GameSetupScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const [showSettings, setShowSettings] = useState(false);
  const { t } = useTranslation(['setup', 'common']);

  const {
    availableCategories,
    selectedSubcategoryIds,
    setAvailableCategories,
    toggleSubcategory,
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

  const clearSelectedSubcategories = () => {
    selectedSubcategoryIds.forEach(toggleSubcategory);
  };

  React.useEffect(() => {
    if (categoriesQuery.data) {
      setAvailableCategories(categoriesQuery.data);
    }
  }, [categoriesQuery.data, setAvailableCategories]);

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <SetupHeader
        title={t('setup:title')}
        subtitle={t('setup:subtitle')}
        onActionPress={() => setShowSettings(true)}
        onBack={navigation.canGoBack() ? () => navigation.goBack() : undefined}
      />

      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: 190 + insets.bottom }]}>
        <View style={styles.body}>
          {categoriesQuery.isPending ? (
            <View style={styles.stateCard}>
              <ActivityIndicator color={dark.textAccent} />
              <Text style={styles.stateTitle}>{t('setup:categories.loading_title')}</Text>
              <Text style={styles.stateCopy}>{t('setup:categories.loading_body')}</Text>
            </View>
          ) : null}

          {categoriesQuery.isError ? (
            <View style={styles.stateCard}>
              <Text style={styles.stateTitle}>{t('setup:categories.error_title')}</Text>
              <Text style={styles.stateCopy}>{t('setup:categories.error_body')}</Text>
              <GoldPrimaryButton label={t('common:retry')} onPress={() => categoriesQuery.refetch()} />
            </View>
          ) : null}

          {!categoriesQuery.isPending && !categoriesQuery.isError ? (
            <SubcategoryGrid
              categories={availableCategories}
              selectedSubcategoryIds={selectedSubcategoryIds}
              onToggle={toggleSubcategory}
            />
          ) : null}

        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 32 }]}>
        <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill} />
        <SelectedCategoriesPreview
          subcategories={selectedSubcategories}
          onRemove={toggleSubcategory}
          onClear={clearSelectedSubcategories}
        />
        <GoldPrimaryButton
          label={t('setup:start_game_with_count', { count: selectedSubcategoryIds.length })}
          disabled={!canStart || categoriesQuery.isPending}
          onPress={() => navigation.navigate('TeamSetup')}
        />
      </View>

      <LanguageSwitcher visible={showSettings} onClose={() => setShowSettings(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: dark.bgBase,
  },
  // paddingBottom is applied dynamically via insets (190 + insets.bottom)
  scrollContent: {},
  footer: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    gap: spacing.md,
    borderTopLeftRadius: r.card,
    borderTopRightRadius: r.card,
    overflow: 'hidden',
    backgroundColor: alpha.black[80],
  },
  body: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    gap: 18,
  },
  stateCard: {
    backgroundColor: dark.bgGlass,
    borderRadius: r.card,
    padding: 18,
    borderWidth: 1,
    borderColor: dark.borderSubtle,
    gap: 10,
    alignItems: 'center',
  },
  stateTitle: {
    color: dark.textPrimary,
    ...textStyle.titleSectionSm,
    fontWeight: '800',
  },
  stateCopy: {
    color: dark.textTertiary,
    ...textStyle.bodySm,
    lineHeight: 22,
    textAlign: 'center',
  },
});
