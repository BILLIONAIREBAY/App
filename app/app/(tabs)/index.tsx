import { View, Text, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { Camera, useCameraPermissions } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import { useEffect, useState } from 'react';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { database } from '../db';
import Item from '../db/models/Item';
import { syncEngine } from '../services/sync';
import { Q } from '@nozbe/watermelondb';
import withObservables from '@nozbe/with-observables';

const SESSION_KEY = 'bbay_session';

function HomeScreen({ items }: { items: Item[] }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [isSyncing, setIsSyncing] = useState(false);
  
  useEffect(() => {
    checkAuth();
    startSync();
  }, []);

  async function checkAuth() {
    try {
      const session = await SecureStore.getItemAsync(SESSION_KEY);
      if (!session) {
        router.replace('/auth/login');
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    }
  }

  async function startSync() {
    try {
      setIsSyncing(true);
      await syncEngine.pullFromBackend();
    } catch (error) {
      console.error('Sync failed:', error);
    } finally {
      setIsSyncing(false);
    }
  }
  
  const handleConciergeVision = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    if (!permission?.granted) {
      await requestPermission();
    }
  };

  const handleRefresh = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await startSync();
  };

  const isLoading = items === undefined;

  return (
    <View className="flex-1 bg-bbay-dark">
      <View className="px-6 pt-12 pb-4">
        <Text className="text-4xl font-bold text-bbay-gold mb-2">
          LUMINESCENCE V3
        </Text>
        
        <View className="flex-row items-center justify-between">
          <Text className="text-gray-400 text-sm">
            {items?.length || 0} Luxury Items
          </Text>
          
          <TouchableOpacity
            onPress={handleRefresh}
            className="bg-bbay-gray px-4 py-2 rounded-lg active:opacity-80"
          >
            <Text className="text-white text-sm">
              {isSyncing ? 'Syncing...' : 'Refresh'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#D4AF37" />
          <Text className="text-gray-400 mt-4">Loading items from local DB...</Text>
        </View>
      ) : items.length === 0 ? (
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-white text-xl mb-2">No items yet</Text>
          <Text className="text-gray-400 text-center">
            Items will appear here once synced from the backend
          </Text>
          
          <TouchableOpacity
            onPress={handleRefresh}
            className="bg-bbay-gold mt-6 px-6 py-3 rounded-lg active:opacity-80"
          >
            <Text className="text-bbay-dark font-semibold">
              Sync Now
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View className="mx-6 mb-4 bg-bbay-gray p-4 rounded-lg">
              <Text className="text-white font-semibold text-lg mb-1">
                {item.title}
              </Text>
              <Text className="text-gray-400 text-sm mb-2">
                {item.description}
              </Text>
              <View className="flex-row items-center justify-between">
                <Text className="text-bbay-gold text-xs uppercase">
                  {item.category}
                </Text>
                <Text className="text-green-400 text-xs uppercase">
                  {item.status}
                </Text>
              </View>
            </View>
          )}
          contentContainerStyle={{ paddingTop: 8, paddingBottom: 24 }}
        />
      )}

      <View className="px-6 pb-8">
        <TouchableOpacity
          onPress={handleConciergeVision}
          className="bg-bbay-gold py-4 rounded-lg active:opacity-80"
        >
          <Text className="text-bbay-dark font-bold text-center text-lg">
            Launch Concierge Vision
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const enhance = withObservables([], () => ({
  items: database.get<Item>('items')
    .query(Q.where('status', Q.oneOf(['active', 'auction_live'])))
    .observe()
}));

export default enhance(HomeScreen);
