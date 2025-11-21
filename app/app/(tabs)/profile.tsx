import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function ProfileTab() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={48} color="#D4AF37" />
        </View>
        <Text style={styles.username}>Demo User</Text>
        <Text style={styles.membership}>Discovery Tier</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Wallet</Text>
        <View style={styles.card}>
          <View style={styles.cardRow}>
            <Text style={styles.label}>Address:</Text>
            <Text style={styles.walletAddress} numberOfLines={1}>
              0x742d...5f8a
            </Text>
          </View>
          <View style={styles.cardRow}>
            <Text style={styles.label}>Balance:</Text>
            <Text style={styles.value}>0.00 USDFx</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>My Assets</Text>
        <View style={styles.card}>
          <View style={styles.emptyState}>
            <Ionicons name="cube-outline" size={48} color="#444" />
            <Text style={styles.emptyText}>No assets yet</Text>
            <Text style={styles.emptySubtext}>
              Win auctions to add items to your collection
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Trust Score</Text>
        <View style={styles.card}>
          <View style={styles.trustScoreContainer}>
            <View style={styles.trustScoreCircle}>
              <Text style={styles.trustScoreValue}>850</Text>
            </View>
            <Text style={styles.trustScoreLabel}>Excellent</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Settings</Text>
        <View style={styles.card}>
          <Pressable style={styles.settingRow}>
            <Text style={styles.settingText}>Biometric Authentication</Text>
            <Ionicons name="chevron-forward" size={20} color="#666" />
          </Pressable>
          <View style={styles.divider} />
          <Pressable style={styles.settingRow}>
            <Text style={styles.settingText}>Notifications</Text>
            <Ionicons name="chevron-forward" size={20} color="#666" />
          </Pressable>
          <View style={styles.divider} />
          <Pressable style={styles.settingRow}>
            <Text style={styles.settingText}>Privacy & Security</Text>
            <Ionicons name="chevron-forward" size={20} color="#666" />
          </Pressable>
        </View>
      </View>

      <Pressable style={styles.signOutButton}>
        <Text style={styles.signOutText}>Sign Out</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  content: {
    padding: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
    paddingVertical: 24,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#111',
    borderWidth: 2,
    borderColor: '#D4AF37',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 4,
  },
  membership: {
    fontSize: 14,
    color: '#D4AF37',
    fontWeight: '600',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#D4AF37',
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#111',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#222',
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    color: '#888',
  },
  value: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  walletAddress: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
    fontFamily: 'monospace',
    flex: 1,
    textAlign: 'right',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginTop: 12,
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 12,
    color: '#444',
    textAlign: 'center',
  },
  trustScoreContainer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  trustScoreCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#0A0A0A',
    borderWidth: 4,
    borderColor: '#D4AF37',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  trustScoreValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#D4AF37',
  },
  trustScoreLabel: {
    fontSize: 16,
    color: '#888',
    fontWeight: '600',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  settingText: {
    fontSize: 16,
    color: '#FFF',
  },
  divider: {
    height: 1,
    backgroundColor: '#222',
  },
  signOutButton: {
    backgroundColor: '#330000',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: '#660000',
  },
  signOutText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF6666',
  },
});
