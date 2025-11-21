import { appSchema, tableSchema } from '@nozbe/watermelondb';

export const schema = appSchema({
  version: 1,
  tables: [
    tableSchema({
      name: 'users',
      columns: [
        { name: 'username', type: 'string', isOptional: true },
        { name: 'wallet_address', type: 'string', isOptional: true },
        { name: 'trust_score', type: 'number' },
        { name: 'membership_tier', type: 'string' },
        { name: 'is_verified', type: 'boolean' },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ]
    }),
    tableSchema({
      name: 'items',
      columns: [
        { name: 'vendor_id', type: 'string' },
        { name: 'title', type: 'string' },
        { name: 'description', type: 'string', isOptional: true },
        { name: 'category', type: 'string' },
        { name: 'status', type: 'string' },
        { name: 'metadata', type: 'string' },
        { name: 'serial_number_hash', type: 'string', isOptional: true },
        { name: 'fx_chain_token_id', type: 'string', isOptional: true },
        { name: 'is_stolen_flag', type: 'boolean' },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ]
    }),
    tableSchema({
      name: 'charities',
      columns: [
        { name: 'name', type: 'string' },
        { name: 'wallet_address', type: 'string' },
        { name: 'description', type: 'string', isOptional: true },
        { name: 'website_url', type: 'string', isOptional: true },
        { name: 'is_verified', type: 'boolean' },
        { name: 'logo_url', type: 'string', isOptional: true },
        { name: 'impact_areas', type: 'string' },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ]
    }),
    tableSchema({
      name: 'whisper_requests',
      columns: [
        { name: 'user_id', type: 'string' },
        { name: 'text_query', type: 'string' },
        { name: 'ai_analysis_json', type: 'string', isOptional: true },
        { name: 'status', type: 'string' },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ]
    }),
  ]
});
