import React from 'react';
import { View, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';

interface PrivacyShieldOverlayProps {
  visible: boolean;
}

export function PrivacyShieldOverlay({ visible }: PrivacyShieldOverlayProps) {
  if (!visible) {
    return null;
  }

  const styles = StyleSheet.create({
    container: {
      ...StyleSheet.absoluteFillObject,
    },
  });

  return (
    <View style={styles.container} pointerEvents="none">
      <BlurView intensity={100} style={styles.container} tint="dark" />
    </View>
  );
}
