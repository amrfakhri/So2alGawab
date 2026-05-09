import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import QRCode from 'react-native-qrcode-svg';
import { useTranslation } from 'react-i18next';

import { colors } from '../../shared/theme/colors';
import {
  createGameSession,
  fetchTvDevice,
  GameSession,
  linkTvDeviceToSession,
  TV_BASE_URL,
} from '../../services/supabase/sessionService';
import { useGameStore } from '../game/store/useGameStore';
import { useLanguageStore } from '../../localization/languageStore';
import { AppIcon } from '../../shared/components/AppIcon';

type PairingState =
  | { phase: 'idle' }
  | { phase: 'connecting' }
  | { phase: 'success'; sessionCode: string }
  | { phase: 'error'; message: string };

type QrState =
  | { phase: 'idle' }
  | { phase: 'creating' }
  | { phase: 'created'; session: GameSession }
  | { phase: 'error'; message: string };

interface CastToTvModalProps {
  visible: boolean;
  onClose: () => void;
}

function tvUrl(code: string) {
  return `${TV_BASE_URL}/${code}`;
}

export function CastToTvModal({ visible, onClose }: CastToTvModalProps) {
  const { t } = useTranslation('tv');
  const { isRTL } = useLanguageStore();
  const [chars, setChars] = useState<string[]>(['', '', '', '']);
  const [pairingState, setPairingState] = useState<PairingState>({ phase: 'idle' });
  const [qrState, setQrState] = useState<QrState>({ phase: 'idle' });
  const [qrExpanded, setQrExpanded] = useState(false);
  const cellRefs = useRef<Array<TextInput | null>>([null, null, null, null]);

  function reset() {
    setChars(['', '', '', '']);
    setPairingState({ phase: 'idle' });
    setQrState({ phase: 'idle' });
    setQrExpanded(false);
  }

  function handleClose() {
    reset();
    onClose();
  }

  function handleCharChange(idx: number, raw: string) {
    const char = raw.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(-1);
    setChars((prev) => prev.map((c, i) => (i === idx ? char : c)));
    if (char && idx < 3) {
      cellRefs.current[idx + 1]?.focus();
    }
  }

  function handleKeyPress(idx: number, key: string) {
    if (key === 'Backspace' && !chars[idx] && idx > 0) {
      setChars((prev) => prev.map((c, i) => (i === idx - 1 ? '' : c)));
      cellRefs.current[idx - 1]?.focus();
    }
  }

  const code = chars.join('');
  const isComplete = code.length === 4;

  async function connect() {
    if (!isComplete || pairingState.phase === 'connecting') return;
    setPairingState({ phase: 'connecting' });

    try {
      const device = await fetchTvDevice(code);
      if (!device) {
        setPairingState({ phase: 'error', message: t('cast.errors.device_not_found') });
        return;
      }
      if (device.status === 'connected') {
        setPairingState({ phase: 'error', message: t('cast.errors.device_in_use') });
        return;
      }

      const session = await createGameSession();
      await linkTvDeviceToSession(code, session.id);
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

  async function expandQr() {
    setQrExpanded(true);
    if (qrState.phase !== 'idle') return;
    setQrState({ phase: 'creating' });
    try {
      const session = await createGameSession();
      useGameStore.getState().setTvSessionId(session.id);
      setQrState({ phase: 'created', session });
    } catch (e) {
      setQrState({ phase: 'error', message: e instanceof Error ? e.message : t('cast.errors.generic') });
    }
  }

  async function copyUrl(sessionCode: string) {
    await Clipboard.setStringAsync(tvUrl(sessionCode));
  }

  async function shareUrl(sessionCode: string) {
    await Share.share({ message: tvUrl(sessionCode) });
  }

  const steps = [t('cast.step_1'), t('cast.step_2'), t('cast.step_3')];
  const stepNums = isRTL ? ['١', '٢', '٣'] : ['1', '2', '3'];

  return (
    <Modal
      transparent
      visible={visible}
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>{t('cast.modal_title')}</Text>
            <Pressable onPress={handleClose} style={styles.closeBtn} hitSlop={12}>
              <AppIcon name="close" size={14} color={colors.mutedText} weight="bold" />
            </Pressable>
          </View>

          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Steps */}
            <View style={styles.steps}>
              {steps.map((text, i) => (
                <View key={i} style={[styles.step, { flexDirection: isRTL ? 'row' : 'row-reverse' }]}>
                  <View style={styles.stepBadge}>
                    <Text style={styles.stepNum}>{stepNums[i]}</Text>
                  </View>
                  <Text style={[styles.stepText, { textAlign: isRTL ? 'right' : 'left' }]}>
                    {text}
                  </Text>
                </View>
              ))}
            </View>

            {/* OTP cells */}
            <View style={styles.cellRow}>
              {chars.map((char, idx) => (
                <View
                  key={idx}
                  style={[
                    styles.cell,
                    char ? styles.cellFilled : null,
                    pairingState.phase === 'error' ? styles.cellError : null,
                    pairingState.phase === 'success' ? styles.cellSuccess : null,
                  ]}
                >
                  <TextInput
                    ref={(ref) => { cellRefs.current[idx] = ref; }}
                    style={styles.cellInput}
                    value={char}
                    maxLength={1}
                    autoCapitalize="characters"
                    keyboardType="default"
                    returnKeyType="done"
                    selectTextOnFocus
                    editable={pairingState.phase !== 'connecting' && pairingState.phase !== 'success'}
                    onChangeText={(val) => handleCharChange(idx, val)}
                    onKeyPress={({ nativeEvent }) => handleKeyPress(idx, nativeEvent.key)}
                    onFocus={() => {
                      if (pairingState.phase === 'error') setPairingState({ phase: 'idle' });
                    }}
                  />
                </View>
              ))}
            </View>

            {pairingState.phase === 'error' && (
              <Text style={styles.errorText}>{pairingState.message}</Text>
            )}
            {pairingState.phase === 'success' && (
              <View style={styles.successRow}>
                <Text style={styles.successText}>{t('cast.success_msg')}</Text>
              </View>
            )}

            {/* Connect button */}
            <Pressable
              style={({ pressed }) => [
                styles.connectBtn,
                (!isComplete || pairingState.phase === 'connecting' || pairingState.phase === 'success') && styles.connectBtnDisabled,
                pressed && isComplete && pairingState.phase === 'idle' && styles.connectBtnPressed,
              ]}
              disabled={!isComplete || pairingState.phase === 'connecting' || pairingState.phase === 'success'}
              onPress={connect}
            >
              {pairingState.phase === 'connecting' ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.connectBtnText}>
                  {pairingState.phase === 'success' ? t('cast.connected_btn') : t('cast.connect_btn')}
                </Text>
              )}
            </Pressable>

            {/* QR alternative */}
            {pairingState.phase !== 'success' && (
              <>
                <View style={styles.dividerRow}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>{t('cast.or')}</Text>
                  <View style={styles.dividerLine} />
                </View>

                <Pressable
                  style={({ pressed }) => [styles.altBtn, pressed && styles.altBtnPressed]}
                  onPress={qrExpanded ? undefined : expandQr}
                >
                  <Text style={styles.altBtnLabel}>
                    {qrExpanded ? t('cast.alt_qr_expanded') : t('cast.alt_qr_collapsed')}
                  </Text>
                </Pressable>

                {qrExpanded && (
                  <View style={styles.qrSection}>
                    {qrState.phase === 'creating' && (
                      <View style={styles.qrLoading}>
                        <ActivityIndicator color={colors.primary} />
                        <Text style={styles.qrLoadingText}>{t('cast.creating_session')}</Text>
                      </View>
                    )}

                    {qrState.phase === 'error' && (
                      <View style={styles.qrLoading}>
                        <Text style={styles.errorText}>{qrState.message}</Text>
                        <Pressable
                          onPress={() => { setQrState({ phase: 'idle' }); expandQr(); }}
                          style={styles.retryBtn}
                        >
                          <Text style={styles.retryBtnText}>{t('common:retry', { ns: 'common' })}</Text>
                        </Pressable>
                      </View>
                    )}

                    {qrState.phase === 'created' && (
                      <View style={styles.qrContent}>
                        <View style={styles.qrWrapper}>
                          <QRCode
                            value={tvUrl(qrState.session.session_code)}
                            size={160}
                            color="#1F2937"
                            backgroundColor="#FFFFFF"
                          />
                        </View>
                        <View style={styles.urlRow}>
                          <Text style={styles.urlText} numberOfLines={1}>
                            game.amrfakhri.com/tv/{qrState.session.session_code}
                          </Text>
                        </View>
                        <View style={styles.qrActions}>
                          <Pressable
                            style={({ pressed }) => [styles.actionBtn, pressed && styles.actionBtnPressed]}
                            onPress={() => copyUrl(qrState.session.session_code)}
                          >
                            <Text style={styles.actionBtnText}>{t('common:copy_link', { ns: 'common' })}</Text>
                          </Pressable>
                          <Pressable
                            style={({ pressed }) => [styles.actionBtn, styles.actionBtnPrimary, pressed && styles.actionBtnPrimaryPressed]}
                            onPress={() => shareUrl(qrState.session.session_code)}
                          >
                            <Text style={[styles.actionBtnText, styles.actionBtnTextPrimary]}>{t('common:share', { ns: 'common' })}</Text>
                          </Pressable>
                        </View>
                      </View>
                    )}
                  </View>
                )}
              </>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  card: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 22,
    paddingTop: 22,
    paddingBottom: 18,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: { fontSize: 18, fontWeight: '800', color: colors.text },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 40,
    alignItems: 'center',
    gap: 20,
  },
  steps: { alignSelf: 'stretch', gap: 12 },
  step: { alignItems: 'center', gap: 12 },
  stepBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  stepNum: { color: '#FFFFFF', fontWeight: '900', fontSize: 15 },
  stepText: { color: colors.mutedText, fontSize: 14, lineHeight: 20, flex: 1 },
  cellRow: { flexDirection: 'row', gap: 12 },
  cell: {
    width: 68,
    height: 80,
    borderRadius: 16,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellFilled: { borderColor: colors.primary, backgroundColor: colors.card },
  cellError: { borderColor: '#B42318' },
  cellSuccess: { borderColor: '#12B76A' },
  cellInput: {
    width: '100%',
    height: '100%',
    textAlign: 'center',
    fontSize: 36,
    fontWeight: '900',
    color: colors.text,
    padding: 0,
  },
  errorText: {
    color: '#B42318',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 8,
    alignSelf: 'stretch',
  },
  successRow: {
    backgroundColor: '#ECFDF3',
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#ABEFC6',
    alignSelf: 'stretch',
  },
  successText: { color: '#067647', fontWeight: '700', fontSize: 15, textAlign: 'center' },
  connectBtn: {
    alignSelf: 'stretch',
    backgroundColor: colors.primary,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  connectBtnDisabled: { opacity: 0.45 },
  connectBtnPressed: { backgroundColor: colors.primaryDark },
  connectBtnText: { color: '#FFFFFF', fontWeight: '800', fontSize: 16 },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'stretch',
    gap: 10,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: colors.border },
  dividerText: { color: colors.mutedText, fontSize: 13, fontWeight: '600' },
  altBtn: {
    alignSelf: 'stretch',
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
  },
  altBtnPressed: { opacity: 0.7 },
  altBtnLabel: { color: colors.text, fontWeight: '700', fontSize: 15 },
  qrSection: { alignSelf: 'stretch' },
  qrLoading: { alignItems: 'center', paddingVertical: 24, gap: 12 },
  qrLoadingText: { color: colors.mutedText, fontSize: 14, fontWeight: '600' },
  qrContent: { alignItems: 'center', gap: 16 },
  qrWrapper: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  urlRow: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: colors.border,
    alignSelf: 'stretch',
  },
  urlText: { color: colors.mutedText, fontSize: 13, fontWeight: '600', textAlign: 'center' },
  qrActions: { flexDirection: 'row', gap: 12, alignSelf: 'stretch' },
  actionBtn: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  actionBtnPressed: { opacity: 0.75 },
  actionBtnPrimary: { backgroundColor: colors.primary, borderColor: colors.primary },
  actionBtnPrimaryPressed: { backgroundColor: colors.primaryDark, borderColor: colors.primaryDark },
  actionBtnText: { color: colors.text, fontWeight: '700', fontSize: 15 },
  actionBtnTextPrimary: { color: '#FFFFFF' },
  retryBtn: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingHorizontal: 22,
    paddingVertical: 12,
  },
  retryBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 15 },
});
