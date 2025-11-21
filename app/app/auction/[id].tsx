import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useAuctionRoom } from '../../hooks/useAuctionRoom';

export default function LiveAuctionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [userId] = useState('user_123');
  
  const { currentPrice, timeLeft, highestBidder, totalBids, isConnected, placeBid } = useAuctionRoom(id || '');

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleBid = () => {
    const newBid = currentPrice + 100;
    placeBid(userId, newBid);
  };

  return (
    <View className="flex-1 bg-black">
      <StatusBar style="light" />
      
      <View className="flex-1 bg-zinc-900 relative">
        <View className="absolute top-0 left-0 right-0 bottom-0 justify-center items-center">
          <Text className="text-zinc-600 text-lg">STREAM PLACEHOLDER</Text>
          <Text className="text-zinc-700 text-sm mt-2">(WebRTC Video Layer)</Text>
        </View>

        <View className="absolute inset-0 pointer-events-none">
          <View className="absolute top-20 left-0 right-0 items-center">
            <View className="bg-black/80 backdrop-blur px-6 py-3 rounded-full border border-zinc-800">
              <Text className="text-zinc-400 text-sm">
                {isConnected ? '🟢 LIVE' : '🔴 DÉCONNECTÉ'}
              </Text>
            </View>
          </View>

          <View className="absolute bottom-40 left-0 right-0 items-center px-8">
            <View className="bg-black/90 backdrop-blur rounded-3xl p-6 w-full border border-amber-500/30">
              <View className="items-center mb-4">
                <Text className="text-amber-500 text-6xl font-bold">
                  ${currentPrice.toLocaleString()}
                </Text>
                <Text className="text-zinc-500 text-sm mt-2">
                  {totalBids} enchère{totalBids > 1 ? 's' : ''}
                </Text>
              </View>

              <View className="flex-row justify-between items-center">
                <View>
                  <Text className="text-zinc-400 text-xs">TEMPS RESTANT</Text>
                  <Text className="text-white text-2xl font-bold">
                    {formatTime(timeLeft)}
                  </Text>
                </View>
                {highestBidder && (
                  <View>
                    <Text className="text-zinc-400 text-xs">LEADER</Text>
                    <Text className="text-white text-sm">
                      {highestBidder === userId ? 'VOUS' : highestBidder.slice(0, 8)}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        </View>
      </View>

      <View className="absolute bottom-0 left-0 right-0 pb-8 px-8 pointer-events-auto">
        <TouchableOpacity
          onPress={handleBid}
          disabled={!isConnected || timeLeft === 0}
          className={`py-6 rounded-2xl ${
            isConnected && timeLeft > 0
              ? 'bg-amber-500 active:bg-amber-600'
              : 'bg-zinc-800'
          }`}
          activeOpacity={0.8}
        >
          <Text className="text-center text-black font-bold text-xl">
            {timeLeft === 0 ? 'TERMINÉ' : `ENCHÉRIR ${currentPrice + 100}$`}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
