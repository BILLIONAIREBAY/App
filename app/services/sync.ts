import { database } from '../db';
import User from '../db/models/User';
import Item from '../db/models/Item';
import Charity from '../db/models/Charity';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:8787';

interface SyncPullResponse {
  users: any[];
  items: any[];
  charities: any[];
  deleted: {
    users: string[];
    items: string[];
    charities: string[];
  };
  lastSyncTimestamp: string;
}

interface SyncPushPayload {
  created: {
    users?: any[];
    items?: any[];
    charities?: any[];
  };
  updated: {
    users?: any[];
    items?: any[];
    charities?: any[];
  };
  deleted: {
    users?: string[];
    items?: string[];
    charities?: string[];
  };
}

export class SyncEngine {
  private isSyncing = false;
  private lastSyncTimestamp = 0;

  async pullFromBackend(): Promise<void> {
    if (this.isSyncing) {
      console.log('[SyncEngine] Already syncing, skipping pull');
      return;
    }

    this.isSyncing = true;

    try {
      console.log('[SyncEngine] PULL: Fetching updates from backend...');
      
      const lastPulledAt = this.lastSyncTimestamp ? new Date(this.lastSyncTimestamp).toISOString() : undefined;
      const url = lastPulledAt 
        ? `${BACKEND_URL}/sync/pull?lastPulledAt=${encodeURIComponent(lastPulledAt)}`
        : `${BACKEND_URL}/sync/pull`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Backend PULL failed: ${response.status}`);
      }

      const data: SyncPullResponse = await response.json();
      
      const usersCollection = database.get<User>('users');
      const itemsCollection = database.get<Item>('items');
      const charitiesCollection = database.get<Charity>('charities');

      await database.write(async () => {
        for (const userData of data.users || []) {
          try {
            const existingUser = await usersCollection.find(userData.id);
            await existingUser.update((user) => {
              user.username = userData.username;
              user.walletAddress = userData.wallet_address;
              user.trustScore = userData.trust_score;
              user.membershipTier = userData.membership_tier;
              user.isVerified = userData.is_verified;
              (user as any)._raw.created_at = new Date(userData.created_at).getTime();
              (user as any)._raw.updated_at = new Date(userData.updated_at).getTime();
            });
          } catch {
            await usersCollection.create((user) => {
              (user as any)._raw.id = userData.id;
              user.username = userData.username;
              user.walletAddress = userData.wallet_address;
              user.trustScore = userData.trust_score;
              user.membershipTier = userData.membership_tier;
              user.isVerified = userData.is_verified;
              (user as any)._raw.created_at = new Date(userData.created_at).getTime();
              (user as any)._raw.updated_at = new Date(userData.updated_at).getTime();
            });
          }
        }

        for (const itemData of data.items || []) {
          try {
            const existingItem = await itemsCollection.find(itemData.id);
            await existingItem.update((item) => {
              item.vendorId = itemData.vendor_id;
              item.title = itemData.title;
              item.description = itemData.description;
              item.category = itemData.category;
              item.status = itemData.status;
              item.metadata = itemData.metadata;
              item.serialNumberHash = itemData.serial_number_hash;
              item.fxChainTokenId = itemData.fx_chain_token_id;
              item.isStolenFlag = itemData.is_stolen_flag;
              (item as any)._raw.created_at = new Date(itemData.created_at).getTime();
              (item as any)._raw.updated_at = new Date(itemData.updated_at || itemData.created_at).getTime();
            });
          } catch {
            await itemsCollection.create((item) => {
              (item as any)._raw.id = itemData.id;
              item.vendorId = itemData.vendor_id;
              item.title = itemData.title;
              item.description = itemData.description;
              item.category = itemData.category;
              item.status = itemData.status;
              item.metadata = itemData.metadata || {};
              item.serialNumberHash = itemData.serial_number_hash;
              item.fxChainTokenId = itemData.fx_chain_token_id;
              item.isStolenFlag = itemData.is_stolen_flag;
              (item as any)._raw.created_at = new Date(itemData.created_at).getTime();
              (item as any)._raw.updated_at = new Date(itemData.updated_at || itemData.created_at).getTime();
            });
          }
        }

        for (const charityData of data.charities || []) {
          try {
            const existingCharity = await charitiesCollection.find(charityData.id);
            await existingCharity.update((charity) => {
              charity.name = charityData.name;
              charity.walletAddress = charityData.wallet_address;
              charity.description = charityData.description;
              charity.websiteUrl = charityData.website_url;
              charity.isVerified = charityData.is_verified;
              charity.logoUrl = charityData.logo_url;
              charity.impactAreas = charityData.impact_areas || [];
              (charity as any)._raw.created_at = new Date(charityData.created_at).getTime();
              (charity as any)._raw.updated_at = new Date(charityData.updated_at).getTime();
            });
          } catch {
            await charitiesCollection.create((charity) => {
              (charity as any)._raw.id = charityData.id;
              charity.name = charityData.name;
              charity.walletAddress = charityData.wallet_address;
              charity.description = charityData.description;
              charity.websiteUrl = charityData.website_url;
              charity.isVerified = charityData.is_verified;
              charity.logoUrl = charityData.logo_url;
              charity.impactAreas = charityData.impact_areas || [];
              (charity as any)._raw.created_at = new Date(charityData.created_at).getTime();
              (charity as any)._raw.updated_at = new Date(charityData.updated_at).getTime();
            });
          }
        }

        if (data.deleted) {
        for (const userId of data.deleted.users || []) {
          try {
            const user = await usersCollection.find(userId);
            await user.destroyPermanently();
          } catch {
            console.log('[SyncEngine] User already deleted:', userId);
          }
        }

        for (const itemId of data.deleted.items || []) {
          try {
            const item = await itemsCollection.find(itemId);
            await item.destroyPermanently();
          } catch {
            console.log('[SyncEngine] Item already deleted:', itemId);
          }
        }

        for (const charityId of data.deleted.charities || []) {
          try {
            const charity = await charitiesCollection.find(charityId);
            await charity.destroyPermanently();
          } catch {
            console.log('[SyncEngine] Charity already deleted:', charityId);
          }
        }
        }
      });

      const timestamp = data.lastSyncTimestamp ? new Date(data.lastSyncTimestamp).getTime() : Date.now();
      this.lastSyncTimestamp = isNaN(timestamp) ? Date.now() : timestamp;
      console.log('[SyncEngine] PULL: Sync completed successfully');
    } catch (error) {
      console.error('[SyncEngine] PULL failed:', error);
      throw error;
    } finally {
      this.isSyncing = false;
    }
  }

  async pushToBackend(payload: SyncPushPayload): Promise<void> {
    try {
      console.log('[SyncEngine] PUSH: Sending local changes to backend...');
      
      const response = await fetch(`${BACKEND_URL}/sync/push`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Backend PUSH failed: ${response.status}`);
      }

      console.log('[SyncEngine] PUSH: Sync completed successfully');
    } catch (error) {
      console.error('[SyncEngine] PUSH failed:', error);
      throw error;
    }
  }

  async startBackgroundSync(intervalMs = 30000): Promise<void> {
    console.log('[SyncEngine] Starting background sync (interval:', intervalMs, 'ms)');
    
    await this.pullFromBackend();

    setInterval(async () => {
      await this.pullFromBackend();
    }, intervalMs);
  }
}

export const syncEngine = new SyncEngine();
