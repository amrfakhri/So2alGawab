import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { colors } from '../../shared/theme/colors';
import {
  createGameSession,
  fetchTvDevice,
  linkTvDeviceToSession,
} from '../../services/supabase/sessionService';

type State =
  | { phase: 'idle' }
  | { phase: 'connecting' }
  | { phase: 'success'; sessionCode: string }
  | { phase: 'error'; message: string };

interface ConnectTvModalProps {
  visible: boolean;
  onClose: () => void;
}

export function ConnectTvModal({ visible, onClose }: ConnectTvModalProps) {
  const [chars, setChars] = useState<string[]>(['', '', '', '']);
  const [state, setState] = useState<State>({ phase: 'idle' });
  const cellRefs = useRef<Array<TextInput | null>>([null, null, null, null]);

  function reset() {
    setChars(['', '', '', '']);
    setState({ phase: 'idle' });
  }

  function handleClose() {
    reset();
    onClose();
  }

  function handleChange(idx: number, raw: string) {
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
    if (!isComplete || state.phase === 'connecting') return;
    setState({ phase: 'connecting' });

    try {
      const device = await fetchTvDevice(code);
      if (!device) {
        setState({ phase: 'error', message: 'لم يُعثر على جهاز بهذا الرمز. تأكد من الرمز الظاهر على الشاشة.' });
        return;
      }
      if (device.status === 'connected') {
        setState({ phase: 'error', message: 'هذه الشاشة مرتبطة بالفعل بجلسة أخرى.' });
        return;
      }

      const session = await createGameSession();
      await linkTvDeviceToSession(code, session.id);

      setState({ phase: 'success', sessionCode: session.session_code });
      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (e) {
      setState({
        phase: 'error',
        message: e instanceof Error ? e.message : 'حدث خطأ. حاول مرة أخرى.',
      });
    }
  }

  return (
    <Modal
      transparent
      visible={visible}
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>ربط شاشة TV 📺</Text>
            <Pressable onPress={handleClose} style={styles.closeBtn} hitSlop={12}>
              <Text style={styles.closeBtnText}>✕</Text>
            </Pressable>
          </View>

          <View style={styles.body}>
            <Text style={styles.label}>
              أدخل الرمز الظاهر على شاشة التلفزيون
            </Text>

            {/* OTP cells */}
            <View style={styles.cellRow}>
              {chars.map((char, idx) => (
                <View
                  key={idx}
                  style={[
                    styles.cell,
                    char ? styles.cellFilled : null,
                    state.phase === 'error' ? styles.cellError : null,
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
                    editable={state.phase !== 'connecting' && state.phase !== 'success'}
                    onChangeText={(val) => handleChange(idx, val)}
                    onKeyPress={({ nativeEvent }) => handleKeyPress(idx, nativeEvent.key)}
                    onFocus={() => {
                      if (state.phase === 'error') setState({ phase: 'idle' });
                    }}
                  />
                </View>
              ))}
            </View>

            {/* Error message */}
            {state.phase === 'error' && (
              <Text style={styles.errorText}>{state.message}</Text>
            )}

            {/* Success message */}
            {state.phase === 'success' && (
              <View style={styles.successRow}>
                <Text style={styles.successText}>
                  ✓ تم الربط — جلسة #{state.sessionCode}
                </Text>
              </View>
            )}

            {/* Connect button */}
            <Pressable
              style={({ pressed }) => [
                styles.connectBtn,
                (!isComplete || state.phase === 'connecting' || state.phase === 'success') && styles.connectBtnDisabled,
                pressed && isComplete && styles.connectBtnPressed,
              ]}
              disabled={!isComplete || state.phase === 'connecting' || state.phase === 'success'}
              onPress={connect}
            >
              {state.phase === 'connecting' ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.connectBtnText}>
                  {state.phase === 'success' ? '✓ تم الربط' : 'ربط الشاشة'}
                </Text>
              )}
            </Pressable>

            <Text style={styles.hint}>
              الرمز مكوّن من 4 أحرف وأرقام ويظهر على شاشة التلفزيون
            </Text>
          </View>
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
    paddingBottom: 40,
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
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'right',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    color: colors.mutedText,
    fontWeight: '700',
    fontSize: 14,
  },
  body: {
    paddingHorizontal: 24,
    paddingTop: 28,
    alignItems: 'center',
    gap: 20,
  },
  label: {
    color: colors.mutedText,
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 22,
  },
  cellRow: {
    flexDirection: 'row',
    gap: 12,
  },
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
  cellFilled: {
    borderColor: colors.primary,
    backgroundColor: colors.card,
  },
  cellError: {
    borderColor: '#B42318',
  },
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
  successText: {
    color: '#067647',
    fontWeight: '700',
    fontSize: 15,
    textAlign: 'center',
  },
  connectBtn: {
    alignSelf: 'stretch',
    backgroundColor: colors.primary,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  connectBtnDisabled: {
    opacity: 0.45,
  },
  connectBtnPressed: {
    backgroundColor: colors.primaryDark,
  },
  connectBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 16,
  },
  hint: {
    color: colors.mutedText,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 19,
  },
});
