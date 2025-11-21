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

  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
      <BlurView intensity={100} style={StyleSheet.absoluteFillObject} tint="dark" />
    </View>
  );
}
