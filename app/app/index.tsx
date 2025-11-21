import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  Animated,
  Dimensions,
} from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useEffect, useState, useRef } from 'react';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { database } from '../db';
import Item from '../db/models/Item';
import { syncEngine } from '../services/sync';
import { Q } from '@nozbe/watermelondb';
import withObservables from '@nozbe/with-observables';

const SESSION_KEY = 'bbay_session';
const { width, height } = Dimensions.get('window');

const LENSES = [
  { id: 'watches', label: 'Watches' },
  { id: 'cars', label: 'Cars' },
  { id: 'art', label: 'Art' },
  { id: 'yachts', label: 'Yachts' },
  { id: 'estates', label: 'Estates' },
];

function HomeScreen({ items }: { items: Item[] }) {
  const [searchText, setSearchText] = useState('');
  const [selectedLens, setSelectedLens] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const videoRef = useRef(null);
  const tickerScroll = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    checkAuth();
    startSync();
  }, []);

  useEffect(() => {
    // Animate ticker scroll
    Animated.loop(
      Animated.sequence([
        Animated.timing(tickerScroll, {
          toValue: -500,
          duration: 20000,
          useNativeDriver: true,
        }),
        Animated.timing(tickerScroll, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    ).start();
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

  const handleLensPress = async (lensId: string) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedLens(selectedLens === lensId ? null : lensId);
  };

  const handleSearchPress = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (searchText.trim()) {
      router.push({
        pathname: '/whisper/create',
        params: { query: searchText },
      });
    }
  };

  return (
    <View style={styles.container}>
      {/* VIDEO BACKGROUND */}
      <Video
        ref={videoRef}
        source={{
          uri: 'https://assets.mixkit.co/videos/preview/mixkit-black-and-white-city-traffic-1217-large.mp4',
        }}
        style={StyleSheet.absoluteFill}
        resizeMode={ResizeMode.COVER}
        isLooping
        shouldPlay
        isMuted={true}
        progressUpdateIntervalMillis={1000}
      />

      {/* OVERLAY GRADIENT */}
      <View
        style={[
          StyleSheet.absoluteFill,
          {
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
          },
        ]}
      />

      {/* CONTENT */}
      <ScrollView
        style={styles.content}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      >
        {/* TOP SPACING */}
        <View style={{ height: 12 }} />

        {/* ORACLE SEARCH BAR */}
        <View style={styles.searchContainer}>
          <BlurView intensity={80} style={styles.blurContainer}>
            <View style={styles.searchInputWrapper}>
              <TextInput
                style={styles.searchInput}
                placeholder="Ask the Oracle..."
                placeholderTextColor="#999"
                value={searchText}
                onChangeText={setSearchText}
              />
              <TouchableOpacity onPress={handleSearchPress}>
                <MaterialCommunityIcons
                  name="microphone"
                  size={20}
                  color="#D4AF37"
                />
              </TouchableOpacity>
            </View>
          </BlurView>
        </View>

        {/* SMART LENSES */}
        <View style={styles.lensesContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.lensesScrollContent}
          >
            {LENSES.map((lens) => (
              <TouchableOpacity
                key={lens.id}
                style={[
                  styles.lensPill,
                  selectedLens === lens.id && styles.lensPillActive,
                ]}
                onPress={() => handleLensPress(lens.id)}
              >
                <BlurView
                  intensity={selectedLens === lens.id ? 90 : 60}
                  style={styles.lensPillBlur}
                >
                  <Text
                    style={[
                      styles.lensPillText,
                      selectedLens === lens.id && styles.lensPillTextActive,
                    ]}
                  >
                    {lens.label}
                  </Text>
                </BlurView>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* INVENTORY SECTION */}
        <View style={styles.inventoryHeader}>
          <Text style={styles.inventoryTitle}>LIVE INVENTORY</Text>
          <Text style={styles.inventoryCount}>
            {items?.length || 0} Items
          </Text>
        </View>

        {/* ITEMS LIST OR EMPTY STATE */}
        {items === undefined ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#D4AF37" />
            <Text style={styles.loadingText}>Loading from vault...</Text>
          </View>
        ) : items.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons
              name="briefcase-search"
              size={48}
              color="#D4AF37"
            />
            <Text style={styles.emptyTitle}>No items in vault</Text>
            <Text style={styles.emptyDesc}>
              Items synced from the backend will appear here
            </Text>
            <TouchableOpacity
              style={styles.syncButton}
              onPress={() => startSync()}
            >
              <Text style={styles.syncButtonText}>
                {isSyncing ? 'Syncing...' : 'Sync Vault'}
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.itemsList}>
            {items.map((item) => (
              <View key={item.id} style={styles.itemCard}>
                <Text style={styles.itemTitle}>{item.title}</Text>
                <Text style={styles.itemDesc}>{item.description}</Text>
                <View style={styles.itemFooter}>
                  <Text style={styles.itemCategory}>{item.category}</Text>
                  <Text style={styles.itemStatus}>{item.status}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* BOTTOM SPACING */}
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* LIVE TICKER - BOTTOM */}
      <View style={styles.tickerContainer}>
        <BlurView intensity={90} style={styles.tickerBlur}>
          <Animated.View
            style={[
              styles.tickerContent,
              { transform: [{ translateX: tickerScroll }] },
            ]}
          >
            <MaterialCommunityIcons
              name="lightning-bolt"
              size={16}
              color="#D4AF37"
              style={{ marginRight: 8 }}
            />
            <Text style={styles.tickerText}>
              LIVE: Patek Philippe Nautilus 5711 — Current Bid: $145,000 (USDFx)
              {' • '}
              Ferrari 250 GTO — Starting: $8,500,000 — 2h 15m remaining
            </Text>
          </Animated.View>
        </BlurView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  content: {
    flex: 1,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  blurContainer: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchInput: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    marginRight: 12,
  },
  lensesContainer: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(212, 175, 55, 0.2)',
  },
  lensesScrollContent: {
    paddingHorizontal: 12,
    gap: 8,
  },
  lensPill: {
    borderRadius: 20,
    overflow: 'hidden',
    paddingVertical: 0,
  },
  lensPillBlur: {
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  lensPillText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
    fontWeight: '600',
  },
  lensPillActive: {
    borderWidth: 1.5,
    borderColor: '#D4AF37',
  },
  lensPillTextActive: {
    color: '#D4AF37',
  },
  inventoryHeader: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 16,
  },
  inventoryTitle: {
    color: '#D4AF37',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 4,
  },
  inventoryCount: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  loadingContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#999',
    marginTop: 12,
    fontSize: 14,
  },
  emptyContainer: {
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  emptyTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  emptyDesc: {
    color: '#999',
    fontSize: 13,
    marginTop: 8,
    textAlign: 'center',
  },
  syncButton: {
    backgroundColor: '#D4AF37',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 6,
    marginTop: 20,
  },
  syncButtonText: {
    color: '#000',
    fontWeight: '600',
    fontSize: 13,
  },
  itemsList: {
    paddingHorizontal: 12,
    gap: 8,
  },
  itemCard: {
    backgroundColor: 'rgba(40, 40, 40, 0.8)',
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 4,
    borderLeftWidth: 3,
    borderLeftColor: '#D4AF37',
  },
  itemTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  itemDesc: {
    color: '#ccc',
    fontSize: 12,
    marginBottom: 8,
  },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  itemCategory: {
    color: '#D4AF37',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  itemStatus: {
    color: '#4ade80',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  tickerContainer: {
    height: 48,
    borderTopWidth: 1,
    borderTopColor: 'rgba(212, 175, 55, 0.2)',
    justifyContent: 'center',
  },
  tickerBlur: {
    flex: 1,
    justifyContent: 'center',
  },
  tickerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  tickerText: {
    color: '#D4AF37',
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 0.3,
  },
});

const enhance = withObservables([], () => ({
  items: database
    .get<Item>('items')
    .query(Q.where('status', Q.oneOf(['active', 'auction_live'])))
    .observe(),
}));

export default enhance(HomeScreen);
