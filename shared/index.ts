import { z } from 'zod';

export const AssetCategorySchema = z.enum(['physical', 'digital_asset', 'hybrid']);
export const ItemStatusSchema = z.enum(['draft', 'active', 'auction_live', 'sold', 'stolen', 'frozen']);

export const UserSchema = z.object({
  id: z.string().uuid(),
  username: z.string().nullable(),
  wallet_address: z.string().nullable(),
  trust_score: z.number().default(100),
  is_verified: z.boolean().default(false),
  created_at: z.date(),
  updated_at: z.date(),
});

export const ItemSchema = z.object({
  id: z.string().uuid(),
  vendor_id: z.string().uuid(),
  title: z.string(),
  description: z.string().nullable(),
  category: AssetCategorySchema,
  status: ItemStatusSchema,
  metadata: z.record(z.any()),
  serial_number_hash: z.string().nullable(),
  fx_chain_token_id: z.string().nullable(),
  is_stolen_flag: z.boolean().default(false),
  created_at: z.date(),
});

export type User = z.infer<typeof UserSchema>;
export type Item = z.infer<typeof ItemSchema>;
export type AssetCategory = z.infer<typeof AssetCategorySchema>;
export type ItemStatus = z.infer<typeof ItemStatusSchema>;
