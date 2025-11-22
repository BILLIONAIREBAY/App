import React from 'react';
import { View, Text, ScrollView, Pressable, Image, StyleSheet } from 'react-native';
import { withObservables } from '@nozbe/watermelondb/react';
import { getDatabase } from '../../db';
import Charity from '../../db/models/Charity';

interface CharityListProps {
  charities: Charity[];
}

function ImpactTab({ charities }: CharityListProps) {
  const handleDonate = (charity: Charity) => {
    console.log('[IMPACT] Donate to charity:', charity.name);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>L'Héritage</Text>
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
  );
}

const enhance = withObservables([], () => {
  const database = getDatabase();
  return {
    charities: database.collections
      .get<Charity>('charities')
      .query()
      .observe(),
  };
});

export default enhance(ImpactTab);

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
    backgroundColor: '#111',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#222',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#444',
    textAlign: 'center',
  },
  charitiesContainer: {
    gap: 16,
  },
  charityCard: {
    backgroundColor: '#111',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#222',
  },
  charityLogo: {
    width: '100%',
    height: 100,
    marginBottom: 16,
    borderRadius: 8,
  },
  charityContent: {
    gap: 12,
  },
  charityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    gap: 8,
  },
  charityName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
    flex: 1,
  },
  verifiedBadge: {
    backgroundColor: '#D4AF37',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
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
  },
  impactAreas: {
    gap: 4,
  },
  impactLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
  impactText: {
    fontSize: 14,
    color: '#D4AF37',
    fontWeight: '500',
  },
  walletContainer: {
    backgroundColor: '#0A0A0A',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#222',
    gap: 4,
  },
  walletLabel: {
    fontSize: 10,
    color: '#666',
    fontWeight: '600',
  },
  walletAddress: {
    fontSize: 12,
    color: '#888',
    fontFamily: 'monospace',
  },
  donateButton: {
    backgroundColor: '#D4AF37',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 4,
  },
  donateButtonPressed: {
    opacity: 0.8,
  },
  donateButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000',
  },
});
