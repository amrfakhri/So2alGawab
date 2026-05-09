import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';

interface WebLayoutProps {
  children: React.ReactNode;
}

export function WebLayout({ children }: WebLayoutProps) {
  if (Platform.OS !== 'web') {
    return <>{children}</>;
  }

  return (
    <View style={styles.desktop}>
      <View style={styles.shell}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  desktop: {
    flex: 1,
    backgroundColor: '#111111',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shell: {
    width: 430,
    // @ts-ignore — maxHeight is web-only
    maxHeight: '100vh',
    overflow: 'hidden',
    alignSelf: 'center',
    // subtle shadow to lift the shell off the dark bg
    // @ts-ignore
    boxShadow: '0 8px 40px rgba(0,0,0,0.6)',
  },
});
