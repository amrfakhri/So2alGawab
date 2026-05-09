import React, { useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  Share,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import QRCode from 'react-native-qrcode-svg';
import { useTranslation } from 'react-i18next';

import { colors } from '../../shared/theme/colors';
import { createGameSession, GameSession, TV_BASE_URL } from '../../services/supabase/sessionService';
import { useGameStore } from '../game/store/useGameStore';
import { AppIcon } from '../../shared/components/AppIcon';

type State =
  | { phase: 'idle' }
  | { phase: 'creating' }
  | { phase: 'created'; session: GameSession }
  | { phase: 'error'; message: string };

interface TvSessionModalProps {
  visible: boolean;
  onClose: () => void;
}

export function TvSessionModal({ visible, onClose }: TvSessionModalProps) {
  const { t } = useTranslation(['tv', 'common']);
  const [state, setState] = useState<State>({ phase: 'idle' });

  React.useEffect(() => {
    if (visible && state.phase === 'idle') start();
    if (!visible) setState({ phase: 'idle' });
  }, [visible]);

  async function start() {
    setState({ phase: 'creating' });
    try {
      const session = await createGameSession();
      useGameStore.getState().setTvSessionId(session.id);
      setState({ phase: 'created', session });
    } catch (e) {
      setState({ phase: 'error', message: e instanceof Error ? e.message : t('tv:session_modal.unknown_error') });
    }
  }

  function tvUrl(code: string) { return `${TV_BASE_URL}/${code}`; }

  async function copyUrl(code: string) {
    await Clipboard.setStringAsync(tvUrl(code));
  }

  async function shareUrl(code: string) {
    await Share.share({ message: tvUrl(code) });
  }

  return (
    <Modal transparent visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>{t('tv:session_modal.title')}</Text>
            <Pressable onPress={onClose} style={styles.closeBtn} hitSlop={12}>
              <AppIcon name="close" size={14} color={colors.mutedText} weight="bold" />
            </Pressable>
          </View>

          {state.phase === 'creating' && (
            <View style={styles.stateCenter}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.stateText}>{t('tv:session_modal.creating')}</Text>
            </View>
          )}

          {state.phase === 'error' && (
            <View style={styles.stateCenter}>
              <Text style={styles.errorText}>{state.message}</Text>
              <Pressable onPress={start} style={styles.retryBtn}>
                <Text style={styles.retryBtnText}>{t('common:retry')}</Text>
              </Pressable>
            </View>
          )}

          {state.phase === 'created' && (
            <View style={styles.content}>
              <View style={styles.codeBlock}>
                <Text style={styles.codeLabel}>{t('tv:session_modal.code_label')}</Text>
                <Text style={styles.codeValue}>{state.session.session_code}</Text>
              </View>
              <View style={styles.qrWrapper}>
                <QRCode
                  value={tvUrl(state.session.session_code)}
                  size={180}
                  color="#1F2937"
                  backgroundColor="#FFFFFF"
                />
              </View>
              <View style={styles.urlRow}>
                <Text style={styles.urlText} numberOfLines={1}>
                  game.amrfakhri.com/tv/{state.session.session_code}
                </Text>
              </View>
              <View style={styles.actions}>
                <Pressable
                  style={({ pressed }) => [styles.actionBtn, pressed && styles.actionBtnPressed]}
                  onPress={() => copyUrl(state.session.session_code)}
                >
                  <Text style={styles.actionBtnText}>{t('common:copy_link')}</Text>
                </Pressable>
                <Pressable
                  style={({ pressed }) => [styles.actionBtn, styles.actionBtnPrimary, pressed && styles.actionBtnPrimaryPressed]}
                  onPress={() => shareUrl(state.session.session_code)}
                >
                  <Text style={[styles.actionBtnText, styles.actionBtnTextPrimary]}>{t('common:share')}</Text>
                </Pressable>
              </View>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
  card: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingBottom: 36,
    minHeight: 300,
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
  headerTitle: { fontSize: 18, fontWeight: '800', color: colors.text, textAlign: 'right' },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stateCenter: { alignItems: 'center', justifyContent: 'center', paddingVertical: 48, gap: 16 },
  stateText: { color: colors.mutedText, fontSize: 16, fontWeight: '600', textAlign: 'right' },
  errorText: { color: '#B42318', fontSize: 15, fontWeight: '600', textAlign: 'center', paddingHorizontal: 24 },
  retryBtn: { backgroundColor: colors.primary, borderRadius: 14, paddingHorizontal: 22, paddingVertical: 12 },
  retryBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 15 },
  content: { alignItems: 'center', paddingHorizontal: 22, paddingTop: 22, gap: 20 },
  codeBlock: { alignItems: 'center', gap: 4 },
  codeLabel: { color: colors.mutedText, fontSize: 13, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
  codeValue: { color: colors.primary, fontSize: 52, fontWeight: '900', letterSpacing: 10 },
  qrWrapper: { padding: 16, backgroundColor: '#FFFFFF', borderRadius: 20, borderWidth: 1, borderColor: colors.border },
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
  actions: { flexDirection: 'row', gap: 12, alignSelf: 'stretch' },
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
});
