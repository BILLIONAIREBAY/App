import { View, Text, TouchableOpacity } from 'react-native';
import { Camera } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import { useState } from 'react';

export default function Home() {
  const [permission, requestPermission] = Camera.useCameraPermissions();
  
  const handleConciergeVision = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    if (!permission?.granted) {
      await requestPermission();
    }
  };

  return (
    <View className="flex-1 bg-bbay-dark items-center justify-center p-6">
      <Text className="text-4xl font-bold text-bbay-gold mb-4">
        LUMINESCENCE V3
      </Text>
      
      <Text className="text-white text-center mb-8 text-lg">
        Phygital Sovereignty Marketplace
      </Text>

      <View className="bg-bbay-gray p-6 rounded-lg w-full max-w-md">
        <Text className="text-white text-sm mb-4">
          Architecture Status:
        </Text>
        
        <View className="space-y-2">
          <Text className="text-green-400">✓ Local-First (WatermelonDB)</Text>
          <Text className="text-green-400">✓ Edge-Orchestrated (Cloudflare)</Text>
          <Text className="text-green-400">✓ FxChain Native (Base Sepolia)</Text>
          <Text className="text-green-400">✓ React Native + Expo</Text>
        </View>
      </View>

      <TouchableOpacity
        onPress={handleConciergeVision}
        className="bg-bbay-gold mt-8 px-8 py-4 rounded-lg active:opacity-80"
      >
        <Text className="text-bbay-dark font-bold text-lg">
          Launch Concierge Vision
        </Text>
      </TouchableOpacity>

      <Text className="text-gray-500 text-xs mt-6 text-center">
        {permission?.granted ? 'Camera Ready' : 'Camera Permission Required'}
      </Text>
    </View>
  );
}
