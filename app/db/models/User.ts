import { Model } from '@nozbe/watermelondb';
import { field, date, readonly } from '@nozbe/watermelondb/decorators';

export type MembershipTier = 'discovery' | 'elite' | 'infinite';

export default class User extends Model {
  static table = 'users';

  @field('username') username!: string;
  @field('wallet_address') walletAddress!: string;
  @field('trust_score') trustScore!: number;
  @field('membership_tier') membershipTier!: MembershipTier;
  @field('is_verified') isVerified!: boolean;
  @readonly @date('created_at') createdAt!: Date;
  @readonly @date('updated_at') updatedAt!: Date;
}
