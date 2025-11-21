import React from 'react';
import { View, Text, ScrollView, Pressable, Image, StyleSheet } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { withObservables } from '@nozbe/watermelondb/react';
import { database } from '../../db';
import Charity from '../../db/models/Charity';

interface CharityListProps {
  charities: Charity[];
}

function CharityListComponent({ charities }: CharityListProps) {
  const router = useRouter();

  const handleDonate = (charity: Charity) => {
    console.log('[IMPACT] Donate to charity:', charity.name);
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Impact & Legacy',
          headerShown: true,
          headerStyle: {
            backgroundColor: '#0A0A0A',
          },
          headerTintColor: '#D4AF37',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>L'Âme et le Génie</Text>
          <Text style={styles.headerSubtitle}>
            Every auction supports verified foundations making real impact
          </Text>
        </View>

        {charities.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No verified foundations yet</Text>
            <Text style={styles.emptySubtext}>
              Partner organizations will appear here
            </Text>
          </View>
        ) : (
          <View style={styles.charitiesContainer}>
            {charities.map((charity) => (
              <View key={charity.id} style={styles.charityCard}>
                {charity.logoUrl && (
                  <Image
                    source={{ uri: charity.logoUrl }}
                    style={styles.charityLogo}
                    resizeMode="contain"
                  />
                )}
                <View style={styles.charityContent}>
                  <View style={styles.charityHeader}>
                    <Text style={styles.charityName}>{charity.name}</Text>
                    {charity.isVerified && (
                      <View style={styles.verifiedBadge}>
                        <Text style={styles.verifiedText}>✓ VERIFIED</Text>
                      </View>
                    )}
                  </View>

                  {charity.description && (
                    <Text style={styles.charityDescription} numberOfLines={3}>
                      {charity.description}
                    </Text>
                  )}

                  <View style={styles.impactAreas}>
                    <Text style={styles.impactLabel}>Impact Areas:</Text>
                    <Text style={styles.impactText}>{charity.impactAreas}</Text>
                  </View>

                  <View style={styles.walletContainer}>
                    <Text style={styles.walletLabel}>Wallet:</Text>
                    <Text style={styles.walletAddress} numberOfLines={1}>
                      {charity.walletAddress}
                    </Text>
                  </View>

                  <Pressable
                    style={({ pressed }) => [
                      styles.donateButton,
                      pressed && styles.donateButtonPressed,
                    ]}
                    onPress={() => handleDonate(charity)}
                  >
                    <Text style={styles.donateButtonText}>Support via Auction</Text>
                  </Pressable>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </>
  );
}

const enhance = withObservables([], () => ({
  charities: database.collections
    .get<Charity>('charities')
    .query()
    .observe(),
}));

export default enhance(CharityListComponent);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  content: {
    padding: 16,
  },
  header: {
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1A1A1A',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#D4AF37',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#888',
    lineHeight: 24,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#444',
  },
  charitiesContainer: {
    gap: 16,
  },
  charityCard: {
    backgroundColor: '#111',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#222',
  },
  charityLogo: {
    width: '100%',
    height: 160,
    backgroundColor: '#1A1A1A',
  },
  charityContent: {
    padding: 16,
  },
  charityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  charityName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
    flex: 1,
  },
  verifiedBadge: {
    backgroundColor: '#D4AF37',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  verifiedText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#000',
  },
  charityDescription: {
    fontSize: 14,
    color: '#AAA',
    lineHeight: 20,
    marginBottom: 16,
  },
  impactAreas: {
    marginBottom: 12,
  },
  impactLabel: {
    fontSize: 12,
    color: '#888',
    marginBottom: 4,
  },
  impactText: {
    fontSize: 14,
    color: '#D4AF37',
    fontWeight: '600',
  },
  walletContainer: {
    marginBottom: 16,
  },
  walletLabel: {
    fontSize: 12,
    color: '#888',
    marginBottom: 4,
  },
  walletAddress: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'monospace',
  },
  donateButton: {
    backgroundColor: '#D4AF37',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  donateButtonPressed: {
    opacity: 0.8,
  },
  donateButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
});
