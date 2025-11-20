import { Model } from '@nozbe/watermelondb';
import { field, date, readonly, json } from '@nozbe/watermelondb/decorators';

export type AssetCategory = 'physical' | 'digital_asset' | 'hybrid';
export type ItemStatus = 'draft' | 'active' | 'auction_live' | 'sold' | 'stolen' | 'frozen';

interface ItemMetadata {
  brand?: string;
  model?: string;
  year?: number;
  condition?: string;
  certifications?: string[];
  [key: string]: any;
}

const sanitizeMetadata = (raw: ItemMetadata) => raw;

export default class Item extends Model {
  static table = 'items';

  @field('vendor_id') vendorId!: string;
  @field('title') title!: string;
  @field('description') description!: string;
  @field('category') category!: AssetCategory;
  @field('status') status!: ItemStatus;
  @json('metadata', sanitizeMetadata) metadata!: ItemMetadata;
  @field('serial_number_hash') serialNumberHash?: string;
  @field('fx_chain_token_id') fxChainTokenId?: string;
  @field('is_stolen_flag') isStolenFlag!: boolean;
  @readonly @date('created_at') createdAt!: Date;
}
