import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { getDatabase } from '../../db';

export default function AuctionsScreen() {
  const goToLiveAuction = () => {
    router.push('/auction/demo-auction-1');
  };

  return (
    <ScrollView className="flex-1 bg-black">
      <View className="p-6">
        <Text className="text-3xl font-bold text-gold mb-2">Live Auctions</Text>
        <Text className="text-gray-400 mb-8">
          Real-time bidding with anti-snipe protection
        </Text>

        <TouchableOpacity
          onPress={goToLiveAuction}
          className="bg-zinc-900 rounded-lg p-6 mb-4 border border-gold/20"
        >
          <View className="flex-row justify-between items-start mb-4">
            <View className="flex-1">
              <Text className="text-xl font-bold text-white mb-1">
                1962 Ferrari 250 GTO
              </Text>
              <Text className="text-gray-400 text-sm">
                Rosso Corsa • 3.0L V12 • 300hp
              </Text>
            </View>
            <View className="bg-red-500/20 px-3 py-1 rounded-full">
              <Text className="text-red-500 font-bold text-xs">LIVE</Text>
            </View>
          </View>

          <View className="flex-row justify-between items-center">
            <View>
              <Text className="text-gray-400 text-xs">Current Bid</Text>
              <Text className="text-gold text-2xl font-bold">$48.5M</Text>
            </View>
            <View className="items-end">
              <Text className="text-gray-400 text-xs">Ends In</Text>
              <Text className="text-white text-lg font-bold">02:47:33</Text>
            </View>
          </View>
        </TouchableOpacity>

        <View className="bg-zinc-900/50 rounded-lg p-6 border border-zinc-800">
          <Text className="text-white text-lg font-semibold mb-2">
            No other live auctions
          </Text>
          <Text className="text-gray-400 text-sm">
            Check back soon for upcoming luxury items
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
