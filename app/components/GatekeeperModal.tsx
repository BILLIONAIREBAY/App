import React from 'react';
import { Modal, View, Text, TouchableOpacity, Linking, Platform } from 'react-native';

interface GatekeeperModalProps {
  visible: boolean;
  type: 'update' | 'maintenance';
  message?: string;
}

export function GatekeeperModal({ visible, type, message }: GatekeeperModalProps) {
  const handleUpdate = () => {
    const storeUrl =
      Platform.OS === 'ios'
        ? 'https://apps.apple.com/app/billionairebay'
        : 'https://play.google.com/store/apps/details?id=com.billionairebay';
    
    Linking.openURL(storeUrl);
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View className="flex-1 bg-black/90 justify-center items-center px-8">
        <View className="bg-zinc-900 rounded-3xl p-8 w-full max-w-md border border-zinc-800">
          {type === 'update' ? (
            <>
              <Text className="text-white text-3xl font-bold text-center mb-4">
                Mise à Jour Requise
              </Text>
              <Text className="text-zinc-400 text-center text-lg mb-8">
                Une nouvelle version de BillionaireBay est disponible. Veuillez mettre à jour pour continuer.
              </Text>
              <TouchableOpacity
                onPress={handleUpdate}
                className="bg-amber-500 rounded-xl py-4 px-6"
                activeOpacity={0.8}
              >
                <Text className="text-black font-bold text-center text-lg">
                  Mettre à Jour
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text className="text-white text-3xl font-bold text-center mb-4">
                Maintenance en Cours
              </Text>
              <Text className="text-zinc-400 text-center text-lg">
                {message || 'BillionaireBay est actuellement en maintenance. Veuillez réessayer plus tard.'}
              </Text>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}
