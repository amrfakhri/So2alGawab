import React from 'react';
import {
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextStyle,
  View,
  ViewStyle,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { Settings2, ChevronRight } from 'lucide-react-native';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppIcon } from '../../../shared/components/AppIcon';
import { HeaderGlassBackground } from '../../../shared/components/HeaderGlassBackground';
import { IconButton, IconButtonPlaceholder } from '../../../shared/components/IconButton';
import { categorySelectionTheme } from '../theme/categoryTheme';
import { alpha, dark, gradients, glow, r, radius, spacing, textStyle } from '../../../shared/theme/tokens';
// Removed invalid/erroneous imports of non-existent StyleSheet exports

export { categorySelectionTheme };

// Deterministic blob color from subcategory ID — consistent across renders
export function getCategoryBlobColor(id: string): string {
  const palette = [
    '#BCE591', // green
    '#FF8FA3', // pink
    '#5B8DEF', // blue
    '#EAD3CD', // peach
    '#B5A3F5', // lavender
    '#A3E4D7', // mint
    '#FAD7A0', // warm orange
    '#F5A3D4', // rose
  ];
  let hash = 0;
  for (const char of id) {
    hash = ((hash * 31) + char.charCodeAt(0)) | 0;
  }
  return palette[Math.abs(hash) % palette.length] ?? '#BCE591';
}

export function getCategoryEmoji(label: string, fallback = '⭐') {
  const normalized = label.toLowerCase();
  if (/(كورة|كرة|football|soccer|sport)/i.test(normalized)) return '⚽';
  if (/(مصر زمان|تاريخ|history|historic)/i.test(normalized)) return '🏛️';
  if (/(أغاني|اغاني|طرب|music|song)/i.test(normalized)) return '🎵';
  if (/(أفلام|افلام|سينما|movie|film|cinema)/i.test(normalized)) return '🎬';
  if (/(بلاد|عواصم|دول|country|capital|world|geography)/i.test(normalized)) return '🌍';
  if (/(معلومات|عامة|general|trivia)/i.test(normalized)) return '🧠';
  if (/(ديني|دين|islam|religion)/i.test(normalized)) return '🕌';
  if (/(رمضان|ramadan)/i.test(normalized)) return '🌙';
  if (/(نجوم|مشاهير|celebrity|stars)/i.test(normalized)) return '⭐';
  return fallback;
}

// ─── SetupHeader ────────────────────────────────────────────────────────────

interface SetupHeaderProps {
  title: string;
  subtitle: string;
  onActionPress: () => void;
  onBack?: () => void;
}

export function SetupHeader({ title, subtitle, onActionPress, onBack }: SetupHeaderProps) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
      <HeaderGlassBackground />

      <View style={styles.headerRow}>
        {/* Back — leading side (right in RTL) */}
         {onBack ? (
          <IconButton
            icon={ChevronRight}
            onPress={onBack}
            color={dark.textPrimary}
          />
        ) : (
          <IconButtonPlaceholder />
        )}
        {/* Settings/filter — trailing side */}
        {/* <IconButton
          icon={Settings2}
          onPress={onActionPress}
          color={dark.textTertiary}
        /> */}

        {/* Center title */}
        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>{title}</Text>
          <Text style={styles.headerSubtitle}>{subtitle}</Text>
        </View>
        </View>


    </View>
  );
}

// ─── CategorySearchField ─────────────────────────────────────────────────────

interface CategorySearchFieldProps {
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  inputRef?: React.RefObject<TextInput | null>;
  isFocused?: boolean;
  onFocus?: () => void;
  onBlur?: () => void;
  textAlign?: TextStyle['textAlign'];
  isRTL?: boolean;
}

export function CategorySearchField({
  value,
  onChangeText,
  placeholder,
  inputRef,
  isFocused,
  onFocus,
  onBlur,
  textAlign = 'right',
  isRTL = true,
}: CategorySearchFieldProps) {
  const hasValue = value.trim().length > 0;

  return (
    <Pressable
      style={[styles.searchField, isFocused && styles.searchFieldFocused]}
      onPress={() => inputRef?.current?.focus()}
    >
      {hasValue ? (
        <Pressable
          onPress={() => {
            onChangeText('');
            inputRef?.current?.focus();
          }}
          style={styles.searchClearButton}
          hitSlop={10}
        >
          <AppIcon name="close" size={13} color={dark.textTertiary} weight="bold" />
        </Pressable>
      ) : null}
      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={dark.textTertiary}
        onFocus={onFocus}
        onBlur={onBlur}
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
        style={[styles.searchInput, { textAlign, writingDirection: isRTL ? 'rtl' : 'ltr' }]}
      />
      <AppIcon
        name="search"
        size={16}
        color={isFocused ? dark.textAccent : dark.textTertiary}
      />
    </Pressable>
  );
}

// ─── FilterPill ───────────────────────────────────────────────────────────────

interface FilterPillProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

export function FilterPill({ label, selected, onPress, style }: FilterPillProps) {
  const content = (
    <Text style={[styles.filterLabel, selected && styles.filterLabelSelected]} numberOfLines={1}>
      {label}
    </Text>
  );

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [pressed && styles.pressed, style]}>
      {selected ? (
        <LinearGradient
          colors={gradients.cardGold}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={styles.filterPillSelected}
        >
          {content}
        </LinearGradient>
      ) : (
        <LinearGradient
          colors={gradients.cardGlass}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={styles.filterPill}
        >
          {content}
        </LinearGradient>
      )}
    </Pressable>
  );
}

// ─── CategorySelectCard ───────────────────────────────────────────────────────

interface CategoryCardProps {
  title: string;
  questionCount: number;
  emoji?: string;
  imageUrl?: string;
  blobColor?: string;
  selected?: boolean;
  onPress: () => void;
}

function CategoryImageBox({
  imageUrl,
  emoji,
  blobColor,
}: Pick<CategoryCardProps, 'imageUrl' | 'emoji' | 'blobColor'>) {
  return (
    <View style={styles.imageContainer}>
      {/* Colored pill blob behind the illustration */}
      <View
        style={[
          styles.imageBlob,
          { backgroundColor: dark.bgGlassSubtle },
        ]}
      />
      {imageUrl ? (
        <Image
          source={{ uri: imageUrl }}
          style={styles.categoryImage}
          resizeMode="contain"
        />
      ) : (
        <Text style={styles.emojiFallback}>{emoji ?? '⭐'}</Text>
      )}
    </View>
  );
}

export function CategorySelectCard({
  title,
  questionCount,
  emoji,
  imageUrl,
  blobColor,
  selected,
  onPress,
}: CategoryCardProps) {
  const cardContent = (
    <>
      <CategoryImageBox imageUrl={imageUrl} emoji={emoji} blobColor={blobColor} />
      <View style={styles.categoryCopy}>
        <Text style={styles.categoryTitle} numberOfLines={2}>
          {title}
        </Text>
        <Text style={styles.categoryMeta}>{questionCount} سؤال</Text>
      </View>
      {selected ? (
        <View style={styles.selectedIndicator}>
          <AppIcon name="check" size={16} color={dark.bgBase} weight="bold" />
        </View>
      ) : null}
    </>
  );

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.categoryCardPressable, pressed && styles.pressed]}
    >
      {selected ? (
        <LinearGradient
          colors={gradients.cardGoldSoft}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.categoryCard, styles.categoryCardSelected]}
        >
          {cardContent}
        </LinearGradient>
      ) : (
        <View style={styles.categoryCard}>{cardContent}</View>
      )}
    </Pressable>
  );
}

// ─── SelectedCategoryChip ─────────────────────────────────────────────────────

interface SelectedCategoryChipProps {
  label: string;
  onRemove: () => void;
  style?: StyleProp<ViewStyle>;
}

export function SelectedCategoryChip({ label, onRemove, style }: SelectedCategoryChipProps) {
  return (
    <View style={[styles.selectedChip, style]}>
      <Pressable onPress={onRemove} style={styles.chipRemoveButton} hitSlop={8}>
        <AppIcon name="close" size={10} color={dark.textPrimary} weight="bold" />
      </Pressable>
      <Text style={styles.selectedChipLabel} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

// ─── GoldPrimaryButton ────────────────────────────────────────────────────────

interface GoldPrimaryButtonProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function GoldPrimaryButton({
  label,
  onPress,
  disabled,
  loading,
  style,
}: GoldPrimaryButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      disabled={isDisabled}
      onPress={onPress}
      style={({ pressed }) => [
        !isDisabled && styles.goldButtonShadow,
        pressed && !isDisabled && styles.pressed,
        style,
      ]}
    >
      {isDisabled ? (
        <View style={styles.goldButtonDisabled}>
          <Text style={styles.goldButtonLabelDisabled}>{label}</Text>
        </View>
      ) : (
        <LinearGradient
          colors={gradients.cardGold}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={styles.goldButton}
        >
          <Text style={styles.goldButtonLabel}>{label}</Text>
        </LinearGradient>
      )}
    </Pressable>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  pressed:  { opacity: 0.72 },

  // Header
  header: {
    paddingHorizontal: spacing.md,
    paddingBottom: 20,
    minHeight: 100,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  // headerGlass: {
  //   ...StyleSheet.absoluteFillObject,
  //   overflow: 'hidden',
  //   borderBottomWidth: 1,
  //   borderBottomColor: dark.borderSubtle,
  // },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xs,
    justifyContent: 'flex-start',
  },
  headerText: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    pointerEvents: 'none',
  },
  headerTitle: {
    color: dark.textPrimary,
    ...textStyle.titleSectionSm,
    lineHeight: 22,
    fontWeight: '800',
    textAlign: 'center',
  },
  headerSubtitle: {
    color: dark.textTertiary,
    ...textStyle.labelSm,
    lineHeight: 16,
    fontWeight: '600',
    textAlign: 'center',
  },

  // Search
  searchField: {
    height: 48,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: dark.borderSubtle,
    backgroundColor: dark.bgGlass,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['2xs'],
    paddingHorizontal: spacing.sm,
  },
  searchFieldFocused: {
    borderColor: dark.textAccent,
  },
  searchInput: {
    flex: 1,
    minWidth: 0,
    color: dark.textPrimary,
    ...textStyle.labelMd,
    padding: 0,
  },
  searchClearButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: dark.bgGlass,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Filter pills
  filterPill: {
    height: 34,
    borderRadius: r.chip,
    borderWidth: 1.5,
    borderColor: dark.borderSubtle,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 17,
  },
  filterPillSelected: {
    height: 34,
    borderRadius: r.chip,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
  },
  filterLabel: {
    color: dark.textSecondary,
    ...textStyle.labelSm,
    lineHeight: 14,
    fontWeight: '700',
  },
  filterLabelSelected: {
    color: dark.bgBase,
  },

  // Category card
  categoryCardPressable: {
    width: '48%',
  },
  categoryCard: {
    borderRadius: r.card,
    borderWidth: 1,
    borderColor: dark.borderSubtle,
    backgroundColor: dark.bgGlass,
    padding: spacing.sm,
    overflow: 'hidden',
    alignItems: 'center',
    gap: spacing.sm,
  },
  categoryCardSelected: {
    borderWidth: 1.5,
    borderColor: dark.textAccent,
  },

  // Category image
  imageContainer: {
    width: 100,
    height: 80,
    borderRadius: r.input,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageBlob: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: spacing['2xs'],
    right: spacing['2xs'],
    borderRadius: r.button,
  },
  categoryImage: {
    width: '100%',
    height: '100%',
  },
  emojiFallback: {
    fontSize: 34,
    textAlign: 'center',
    zIndex: 1,
  },

  // Card text
  categoryCopy: {
    alignSelf: 'stretch',
    gap: spacing['3xs'],
    alignItems: 'center',
  },
  categoryTitle: {
    color: dark.textPrimary,
    ...textStyle.titleCard,
    lineHeight: 20,
    fontWeight: '800',
    textAlign: 'center',
  },
  categoryMeta: {
    color: dark.textTertiary,
    ...textStyle.labelSm,
    lineHeight: 14,
    fontWeight: '600',
    textAlign: 'center',
  },

  // Selected badge on card — positioned at the RTL-start (visual right)
  selectedIndicator: {
    position: 'absolute',
    start: 14,
    top: 14,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: dark.textAccent,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Selected chips
  selectedChip: {
    height: 36,
    maxWidth: 168,
    borderRadius: r.badge,
    borderWidth: 1,
    borderColor: dark.textAccent,
    backgroundColor: dark.bgAccentSubtle,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: spacing['2xs'],
    paddingHorizontal: 9,
  },
  chipRemoveButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: dark.bgGlass,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  selectedChipLabel: {
    color: dark.textPrimary,
    ...textStyle.labelSm,
    lineHeight: 14,
    fontWeight: '700',
    flex: 1,
  },

  // Primary gold button
  goldButtonShadow: {
    borderRadius: r.button,
    ...glow.gold.sm,
  },
  goldButton: {
    height: 56,
    borderRadius: r.button,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  goldButtonLabel: {
    color: dark.textInverse,
    ...textStyle.buttonMd,
    lineHeight: 20,
    fontWeight: '800',
    textAlign: 'center',
  },
  goldButtonDisabled: {
    height: 56,
    borderRadius: r.button,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    backgroundColor: alpha.white[16],
  },
  goldButtonLabelDisabled: {
    color: dark.textDisabled,
    ...textStyle.buttonMd,
    lineHeight: 20,
    fontWeight: '800',
    textAlign: 'center',
  },
});
