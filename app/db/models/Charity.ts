import { Model } from '@nozbe/watermelondb';
import { field, date, readonly, json } from '@nozbe/watermelondb/decorators';

const sanitizeImpactAreas = (raw: string[]) => raw;

export default class Charity extends Model {
  static table = 'charities';

  @field('name') name!: string;
  @field('wallet_address') walletAddress!: string;
  @field('description') description!: string;
  @field('website_url') websiteUrl?: string;
  @field('is_verified') isVerified!: boolean;
  @field('logo_url') logoUrl?: string;
  @json('impact_areas', sanitizeImpactAreas) impactAreas!: string[];
  @readonly @date('created_at') createdAt!: Date;
  @readonly @date('updated_at') updatedAt!: Date;
}
