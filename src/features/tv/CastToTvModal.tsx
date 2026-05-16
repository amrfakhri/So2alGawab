import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { ScanLine, Tv } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  alpha, dark, glow, gradients, palette, r, radius, spacing, textStyle,
} from '../../shared/theme/tokens';
import {
  fetchTvDevice,
  linkTvDeviceToSession,
  createGameSession,
} from '../../services/supabase/sessionService';
import { useGameStore } from '../game/store/useGameStore';
import { useLocale } from '../../localization/useLocale';
import { SecondaryButton } from '../../shared/components/SecondaryButton';
import { QrScannerModal } from './QrScannerModal';

type PairingState =
  | { phase: 'idle' }
  | { phase: 'connecting' }
  | { phase: 'success'; sessionCode: string }
  | { phase: 'error'; message: string };

interface CastToTvModalProps {
  visible: boolean;
  onClose: () => void;
}

export function CastToTvModal({ visible, onClose }: CastToTvModalProps) {
  const { t, isRTL, textAlign } = useLocale('tv');
  const insets = useSafeAreaInsets();
  const [chars, setChars] = useState<string[]>(['', '', '', '']);
  const [pairingState, setPairingState] = useState<PairingState>({ phase: 'idle' });
  const [showScanner, setShowScanner] = useState(false);
  const cellRefs = useRef<Array<TextInput | null>>([null, null, null, null]);

  function reset() {
    setChars(['', '', '', '']);
    setPairingState({ phase: 'idle' });
    setShowScanner(false);
  }

  function handleClose() {
    reset();
    onClose();
  }

  function handleCharChange(idx: number, raw: string) {
    const char = raw.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(-1);
    const newChars = chars.map((c, i) => (i === idx ? char : c));
    setChars(newChars);

    if (!char) return;

    if (idx < 3) {
      // Auto-advance: defer slightly so state flush settles before focus()
      setTimeout(() => cellRefs.current[idx + 1]?.focus(), 10);
    } else {
      // Last cell filled — auto-connect if all four chars present
      const fullCode = newChars.join('');
      if (fullCode.length === 4 && pairingState.phase === 'idle') {
        Keyboard.dismiss();
        connect(fullCode);
      }
    }
  }

  function handleKeyPress(idx: number, key: string) {
    if (key === 'Backspace' && !chars[idx] && idx > 0) {
      setChars((prev) => prev.map((c, i) => (i === idx - 1 ? '' : c)));
      setTimeout(() => cellRefs.current[idx - 1]?.focus(), 10);
    }
  }

  // Code cells always render left-to-right (numeric codes are LTR regardless of language).
  const cellIndices = [0, 1, 2, 3];

  const code = chars.join('');
  const isComplete = code.length === 4;
  const isConnecting = pairingState.phase === 'connecting';
  const isSuccess = pairingState.phase === 'success';

  async function connect(overrideCode?: string) {
    const targetCode = overrideCode ?? code;
    if (targetCode.length !== 4 || isConnecting) return;
    setPairingState({ phase: 'connecting' });

    try {
      const device = await fetchTvDevice(targetCode);
      if (!device) {
        setPairingState({ phase: 'error', message: t('cast.errors.device_not_found') });
        return;
      }
      if (device.status === 'connected') {
        setPairingState({ phase: 'error', message: t('cast.errors.device_in_use') });
        return;
      }

      const session = await createGameSession();
      await linkTvDeviceToSession(targetCode, session.id);
      useGameStore.getState().setTvSessionId(session.id);

      setPairingState({ phase: 'success', sessionCode: session.session_code });
      setTimeout(() => { handleClose(); }, 2000);
    } catch (e) {
      setPairingState({
        phase: 'error',
        message: e instanceof Error ? e.message : t('cast.errors.generic'),
      });
    }
  }

  function handleCodeScanned(scannedCode: string) {
    const scannedChars = scannedCode.toUpperCase().split('').slice(0, 4);
    setChars(scannedChars);
    connect(scannedCode.toUpperCase());
  }

  const steps = [t('cast.step_1'), t('cast.step_2'), t('cast.step_3')];
  const stepNums = isRTL ? ['١', '٢', '٣'] : ['1', '2', '3'];
  const connectDisabled = !isComplete || isConnecting || isSuccess;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="slide"
      onRequestClose={showScanner ? () => setShowScanner(false) : handleClose}
    >
      {showScanner ? (
        // Rendered inside this Modal so CameraView gets the native Modal layer —
        // avoids the double-Modal iOS issue where the camera feed stays black.
        <QrScannerModal
          onCodeScanned={handleCodeScanned}
          onClose={() => setShowScanner(false)}
        />
      ) : (
        // KeyboardAvoidingView lifts the sheet above the keyboard when a
        // TextInput is focused. flex:1 is required for it to work correctly.
        <KeyboardAvoidingView
          style={styles.kav}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          {/* Tappable backdrop fills everything above the sheet */}
          <Pressable style={styles.backdrop} onPress={handleClose} />

          <BlurView
            intensity={30}
            tint="dark"
            style={[styles.sheet, { paddingBottom: insets.bottom + spacing.md }]}
          >
            {/* Dark bg layer sits behind all content */}
            <View style={[StyleSheet.absoluteFill, styles.sheetBg]} />

            {/* Dragger pill */}
            <View style={styles.dragger} />

            {/* Content */}
            <ScrollView
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {/* TV icon spotlight */}
              <View style={styles.focusIcon}>
                <Tv size={36} color={dark.iconInverse} strokeWidth={2} />
              </View>

              {/* Title + subtitle */}
              <View style={styles.textBlock}>
                <Text style={[styles.title, { textAlign: 'center' }]}>
                  {t('cast.modal_title')}
                </Text>
                <Text style={[styles.subtitle, { textAlign: 'center' }]}>
                  {t('cast.modal_subtitle')}
                </Text>
              </View>

              {/* Numbered steps card */}
              <View style={styles.listCard}>
                {steps.map((text, i) => (
                  <View key={i} style={styles.stepRow}>
                    <Text style={[styles.stepText, { textAlign }]} numberOfLines={2}>
                      {text}
                    </Text>
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>{stepNums[i]}</Text>
                    </View>
                  </View>
                ))}
              </View>

              {/* Code inputs + vertical divider + scan button */}
              <View style={styles.inputRow}>
                <View style={styles.codeInputs}>
                  {cellIndices.map((arrayIdx) => (
                    <View
                      key={arrayIdx}
                      style={[
                        styles.cell,
                        chars[arrayIdx] ? styles.cellFilled : null,
                        pairingState.phase === 'error' ? styles.cellError : null,
                        isSuccess ? styles.cellSuccess : null,
                      ]}
                    >
                      <TextInput
                        ref={(ref) => { cellRefs.current[arrayIdx] = ref; }}
                        style={styles.cellInput}
                        value={chars[arrayIdx]}
                        maxLength={2}
                        autoCapitalize="characters"
                        keyboardType="default"
                        returnKeyType={arrayIdx < 3 ? 'next' : 'done'}
                        selectTextOnFocus
                        editable={!isConnecting && !isSuccess}
                        onChangeText={(val) => handleCharChange(arrayIdx, val)}
                        onKeyPress={({ nativeEvent }) => handleKeyPress(arrayIdx, nativeEvent.key)}
                        onFocus={() => {
                          if (pairingState.phase === 'error') setPairingState({ phase: 'idle' });
                        }}
                      />
                    </View>
                  ))}
                </View>

                {/* Vertical separator */}
                <View style={styles.verticalDivider} />

                {/* QR scan icon button */}
                <Pressable
                  onPress={() => setShowScanner(true)}
                  style={({ pressed }) => [styles.scanBtnOuter, pressed && styles.pressed]}
                >
                  <LinearGradient
                    colors={gradients.cardGlass}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.scanBtnInner}
                  >
                    <ScanLine size={24} color={dark.textPrimary} strokeWidth={2} />
                  </LinearGradient>
                </Pressable>
              </View>

              {/* Feedback messages */}
              {pairingState.phase === 'error' && (
                <Text style={[styles.errorText, { textAlign }]}>
                  {pairingState.message}
                </Text>
              )}
              {isSuccess && (
                <Text style={[styles.successText, { textAlign: 'center' }]}>
                  {t('cast.success_msg')}
                </Text>
              )}
            </ScrollView>

            {/* Pinned bottom actions */}
            <View style={styles.fixedActions}>
              {/* Connect — flex 1 */}
              <Pressable
                disabled={connectDisabled}
                onPress={() => connect()}
                style={({ pressed }) => [
                  styles.connectBtn,
                  connectDisabled && styles.connectBtnDisabled,
                  pressed && !connectDisabled && styles.pressed,
                ]}
              >
                <LinearGradient
                  colors={gradients.ctaGold}
                  start={{ x: 0, y: 0.5 }}
                  end={{ x: 1, y: 0.5 }}
                  style={styles.connectBtnGradient}
                >
                  {isConnecting ? (
                    <ActivityIndicator size="small" color={dark.textInverse} />
                  ) : (
                    <Text style={styles.connectBtnText}>
                      {isSuccess ? t('cast.connected_btn') : t('cast.connect_btn')}
                    </Text>
                  )}
                </LinearGradient>
              </Pressable>

              {/* Close — fixed width */}
              <SecondaryButton
                label={t('cast.close_btn')}
                onPress={handleClose}
              />
            </View>
          </BlurView>
        </KeyboardAvoidingView>
      )}
    </Modal>
  );
}

const styles = StyleSheet.create({
  // ── Layout ─────────────────────────────────────────────────────────────────
  // flex:1 is required for KeyboardAvoidingView to work correctly inside Modal
  kav: {
    flex: 1,
  },
  // flex:1 backdrop pushes the sheet to the bottom (same pattern as AvatarSelectorSheet)
  backdrop: {
    flex: 1,
    backgroundColor: alpha.black[60],
  },

  // ── Sheet ──────────────────────────────────────────────────────────────────
  sheet: {
    borderTopLeftRadius: r.card,
    borderTopRightRadius: r.card,
    overflow: 'hidden',
    paddingTop: spacing.md,
  },
  sheetBg: {
    backgroundColor: alpha.black[80],
  },

  // ── Dragger ────────────────────────────────────────────────────────────────
  dragger: {
    width: 60,
    height: 8,
    borderRadius: r.button,
    backgroundColor: palette.neutral[600],
    alignSelf: 'center',
    marginBottom: spacing.md,
  },

  // ── Scroll content ─────────────────────────────────────────────────────────
  scrollContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    gap: spacing.md,
    alignItems: 'center',
  },

  // ── Focus icon ─────────────────────────────────────────────────────────────
  focusIcon: {
    width: 80,
    height: 80,
    borderRadius: radius.lg,
    backgroundColor: dark.bgAccent,
    alignItems: 'center',
    justifyContent: 'center',
    ...glow.gold.xs,
  },

  // ── Text block ─────────────────────────────────────────────────────────────
  textBlock: {
    alignSelf: 'stretch',
    gap: spacing['3xs'],
  },
  title: {
    color: dark.textPrimary,
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 25,
  },
  subtitle: {
    color: dark.textSecondary,
    ...textStyle.labelMd,
  },

  // ── Steps list card ────────────────────────────────────────────────────────
  listCard: {
    alignSelf: 'stretch',
    backgroundColor: dark.bgGlass,
    borderWidth: 1,
    borderColor: dark.borderSubtle,
    borderRadius: radius['2xl'],
    padding: spacing.sm,
    gap: spacing.sm,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  stepText: {
    flex: 1,
    color: dark.textPrimary,
    ...textStyle.labelMd,
  },
  badge: {
    width: 32,
    height: 32,
    borderRadius: r.badge,
    backgroundColor: dark.bgAccent,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  badgeText: {
    color: dark.textInverse,
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 20,
  },

  // ── Code inputs row ────────────────────────────────────────────────────────
  inputRow: {
    flexDirection: 'row',
    alignSelf: 'stretch',
    alignItems: 'center',
    gap: spacing.sm,
  },
  codeInputs: {
    flexDirection: 'row',
    gap: spacing.sm,
    flexShrink: 0,
  },
  cell: {
    width: 56,
    height: 56,
    borderRadius: radius.lg,
    backgroundColor: dark.bgGlass,
    borderWidth: 1,
    borderColor: dark.borderSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellFilled:  { borderColor: dark.borderActive },
  cellError:   { borderColor: dark.borderError },
  cellSuccess: { borderColor: dark.textSuccess },
  cellInput: {
    width: '100%',
    height: '100%',
    textAlign: 'center',
    fontSize: 28,
    fontWeight: '700',
    color: dark.textPrimary,
    padding: 0,
  },

  // ── Vertical divider ───────────────────────────────────────────────────────
  verticalDivider: {
    flex: 1,
    height: 1,
    width: 1,
    backgroundColor: dark.borderSubtle,
    alignSelf: 'center',
  },

  // ── Scan button ────────────────────────────────────────────────────────────
  scanBtnOuter: {
    flexShrink: 0,
  },
  scanBtnInner: {
    width: 56,
    height: 56,
    borderRadius: r.button,
    borderWidth: 1.5,
    borderColor: dark.borderSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ── Feedback ───────────────────────────────────────────────────────────────
  errorText: {
    color: dark.textError,
    ...textStyle.labelSm,
    alignSelf: 'stretch',
  },
  successText: {
    color: dark.textSuccess,
    ...textStyle.labelMd,
    fontWeight: '600',
  },

  // ── Bottom actions ─────────────────────────────────────────────────────────
  fixedActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    alignItems: 'center',
  },
  connectBtn: {
    flex: 1,
    borderRadius: r.button,
    ...glow.gold.sm,
  },
  connectBtnDisabled: {
    opacity: dark.opDisabled,
    shadowOpacity: 0,
    elevation: 0,
  },
  connectBtnGradient: {
    height: 56,
    borderRadius: r.button,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  connectBtnText: {
    color: dark.textInverse,
    ...textStyle.buttonMd,
    fontWeight: '700',
  },

  pressed: { opacity: 0.72 },
});
