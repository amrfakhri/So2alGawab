import React, { useCallback, useEffect, useRef } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X } from 'lucide-react-native';

import { alpha, dark, radius, spacing, textStyle } from '../../shared/theme/tokens';
import { useLocale } from '../../localization/useLocale';

/** Deep-link scheme encoded in the TV lobby QR: so2algawab://connect-tv?code=XXXX */
const TV_QR_SCHEME = 'so2algawab://connect-tv';

function extractCodeFromQr(data: string): string | null {
  try {
    const url = new URL(data);
    if (!data.startsWith(TV_QR_SCHEME)) return null;
    const code = url.searchParams.get('code');
    if (!code || code.length !== 4) return null;
    return code.toUpperCase();
  } catch {
    return null;
  }
}

interface QrScannerModalProps {
  onCodeScanned: (code: string) => void;
  onClose: () => void;
}

/**
 * Full-screen camera scanner — rendered as an absoluteFill View, NOT a Modal.
 * Mount/unmount it inside the parent Modal to avoid iOS double-Modal issues.
 */
export function QrScannerModal({ onCodeScanned, onClose }: QrScannerModalProps) {
  const { t, textAlign } = useLocale('tv');
  const insets = useSafeAreaInsets();
  const [permission, requestPermission] = useCameraPermissions();
  const scannedRef = useRef(false);

  useEffect(() => {
    scannedRef.current = false;
    if (permission && !permission.granted && permission.canAskAgain) {
      requestPermission();
    }
  }, []);

  const handleBarcodeScanned = useCallback(
    ({ data }: { data: string }) => {
      if (scannedRef.current) return;
      const code = extractCodeFromQr(data);
      if (!code) return;
      scannedRef.current = true;
      onCodeScanned(code);
      onClose();
    },
    [onCodeScanned, onClose],
  );

  const permissionDenied = permission && !permission.granted && !permission.canAskAgain;

  return (
    <View style={[StyleSheet.absoluteFill, styles.root]}>
      {/* Live camera feed */}
      {permission?.granted ? (
        <CameraView
          style={StyleSheet.absoluteFill}
          facing="back"
          barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
          onBarcodeScanned={handleBarcodeScanned}
        />
      ) : null}

      {/* Dark overlay — top */}
      <View style={[styles.shadeBand, { height: insets.top + 80 }]} />

      {/* Close button */}
      <View style={[styles.topBar, { paddingTop: insets.top + 16 }]}>
        <Pressable
          onPress={onClose}
          style={({ pressed }) => [styles.closeBtn, pressed && styles.pressed]}
          hitSlop={12}
        >
          <X size={20} color={dark.textPrimary} strokeWidth={2.5} />
        </Pressable>
      </View>

      {/* Scan window: side shades + clear box with corner markers */}
      <View style={styles.middle}>
        <View style={styles.shadeSide} />
        <View style={styles.scanBox}>
          <View style={[styles.corner, styles.cornerTL]} />
          <View style={[styles.corner, styles.cornerTR]} />
          <View style={[styles.corner, styles.cornerBL]} />
          <View style={[styles.corner, styles.cornerBR]} />
        </View>
        <View style={styles.shadeSide} />
      </View>

      {/* Dark overlay — bottom + instructions */}
      <View style={[styles.bottomPanel, { paddingBottom: insets.bottom + 32 }]}>
        {permissionDenied ? (
          <Text style={[styles.permissionText, { textAlign }]}>
            {t('cast.scan_permission_denied')}
          </Text>
        ) : (
          <>
            <Text style={[styles.scanTitle, { textAlign: 'center' }]}>
              {t('cast.scan_title')}
            </Text>
            <Text style={[styles.scanSubtitle, { textAlign: 'center' }]}>
              {t('cast.scan_subtitle')}
            </Text>
          </>
        )}
      </View>
    </View>
  );
}

const SCAN_BOX_SIZE = 240;
const CORNER_SIZE   = 24;
const CORNER_WIDTH  = 3;
const CORNER_COLOR  = '#FFFFFF';

const styles = StyleSheet.create({
  root: {
    backgroundColor: '#000',
  },
  shadeBand: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: alpha.black[80],
    zIndex: 1,
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.md,
    zIndex: 2,
    alignItems: 'flex-end',
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    backgroundColor: alpha.black[60],
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: alpha.white[16],
  },
  pressed: { opacity: 0.7 },

  middle: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  shadeSide: {
    flex: 1,
    alignSelf: 'stretch',
    backgroundColor: alpha.black[80],
  },
  scanBox: {
    width: SCAN_BOX_SIZE,
    height: SCAN_BOX_SIZE,
    flexShrink: 0,
  },

  corner: {
    position: 'absolute',
    width: CORNER_SIZE,
    height: CORNER_SIZE,
    borderColor: CORNER_COLOR,
  },
  cornerTL: { top: 0, left: 0, borderTopWidth: CORNER_WIDTH, borderLeftWidth: CORNER_WIDTH, borderTopLeftRadius: 4 },
  cornerTR: { top: 0, right: 0, borderTopWidth: CORNER_WIDTH, borderRightWidth: CORNER_WIDTH, borderTopRightRadius: 4 },
  cornerBL: { bottom: 0, left: 0, borderBottomWidth: CORNER_WIDTH, borderLeftWidth: CORNER_WIDTH, borderBottomLeftRadius: 4 },
  cornerBR: { bottom: 0, right: 0, borderBottomWidth: CORNER_WIDTH, borderRightWidth: CORNER_WIDTH, borderBottomRightRadius: 4 },

  bottomPanel: {
    backgroundColor: alpha.black[80],
    paddingTop: spacing.lg,
    paddingHorizontal: spacing.md,
    gap: spacing['2xs'],
    alignItems: 'center',
  },
  scanTitle: {
    color: dark.textPrimary,
    ...textStyle.titleSectionSm,
    fontWeight: '700',
  },
  scanSubtitle: {
    color: dark.textSecondary,
    ...textStyle.bodySm,
    lineHeight: 22,
  },
  permissionText: {
    color: dark.textSecondary,
    ...textStyle.bodySm,
    lineHeight: 22,
  },
});
