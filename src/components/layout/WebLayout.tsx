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
  },
  shell: {
    flex: 1,
    width: '100%',
    maxWidth: 430,
    overflow: 'hidden',
    backgroundColor: '#F7F1E8',
  },
});
