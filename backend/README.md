# BillionaireBay Backend - Luminescence V3

## Architecture
Edge-orchestrated backend running on **Cloudflare Workers** with:
- **Hono** framework for routing
- **Viem** for blockchain interactions (Base Sepolia)
- **Supabase** for PostgreSQL database
- **R2** for Shadow Vault encrypted storage
- **Durable Objects** for real-time auctions

## Smart Trap Guardian 🛡️

The backend acts as the **guardian** of the database. Every item creation is checked against the **AuraRegistry** smart contract on Base Sepolia:

```
POST /sync/push → Check AuraRegistry → BLOCK if stolen → Insert to Supabase if clean
```

No stolen asset can ever enter the database. This is the core of the "Smart Trap" security.

## Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Secrets

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

### 3. Deploy Secrets to Cloudflare Workers

Secrets are **not** stored in `wrangler.toml`. They must be deployed via Wrangler CLI:

```bash
# Supabase
wrangler secret put SUPABASE_URL
wrangler secret put SUPABASE_SERVICE_ROLE_KEY

# Blockchain
wrangler secret put AURA_REGISTRY_ADDRESS
wrangler secret put BASE_SEPOLIA_RPC

# Optional (defaults to https://sepolia.base.org)
wrangler secret put FX721L_CONTRACT_ADDRESS
wrangler secret put USDFX_CONTRACT_ADDRESS
wrangler secret put JUSTICE_PROTOCOL_ADDRESS
```

### 4. Deploy to Cloudflare

```bash
npm run deploy
```

## API Endpoints

### `GET /`
Health check and API info.

### `GET /health`
Simple health status endpoint.

### `POST /sync/push`
Accepts changes from WatermelonDB mobile app and syncs to Supabase.

**CRITICAL SECURITY**: Before inserting any `item` with a `serial_number_hash`, the backend calls `AuraRegistry.isStolen()` on Base Sepolia. If stolen, the request is rejected with `403 STOLEN_ASSET_DETECTED`.

**Request Body:**
```json
{
  "created": [
    {
      "table": "items",
      "id": "uuid",
      "title": "Rolex Submariner",
      "serial_number_hash": "0x1234...",
      ...
    }
  ],
  "updated": [...],
  "deleted": ["items:uuid"]
}
```

**Response (Success):**
```json
{
  "success": true,
  "timestamp": "2025-11-20T13:00:00.000Z"
}
```

**Response (Stolen Asset):**
```json
{
  "error": "STOLEN_ASSET_DETECTED",
  "message": "This item has been flagged as stolen in the Aura Registry",
  "serialHash": "0x1234...",
  "itemId": "uuid"
}
```

### `GET /sync/pull?lastPulledAt=<ISO8601>`
Returns delta changes from Supabase since the specified timestamp.

**Response:**
```json
{
  "users": [...],
  "items": [...],
  "charities": [...],
  "lastSyncTimestamp": "2025-11-20T13:00:00.000Z"
}
```

### `GET /aura/check/:serialHash`
Check if a specific serial hash is marked as stolen in the AuraRegistry.

**Response:**
```json
{
  "serialHash": "0x1234...",
  "isStolen": false,
  "reportedAt": null,
  "reason": null
}
```

## Development

```bash
npm run dev
```

This starts the local Wrangler dev server with hot reload.

## Testing the Smart Trap

1. Deploy `AuraRegistry` contract to Base Sepolia (see `/chain` directory)
2. Mark a test serial hash as stolen: `AuraRegistry.setStolen(hash, true, "Test")`
3. Try to push an item with that hash via `/sync/push`
4. Backend should return `403 STOLEN_ASSET_DETECTED`

## Architecture Notes

- **No State**: Cloudflare Workers are stateless. All state lives in Supabase or R2.
- **Edge Computing**: Workers run globally at the edge, reducing latency.
- **Smart Trap**: Blockchain check happens **before** database insert, not after.
- **Viem over Ethers**: Using Viem for better tree-shaking and smaller bundle size.

## Environment Variables Reference

| Variable | Description | Required |
|----------|-------------|----------|
| `SUPABASE_URL` | Supabase project URL | ✅ |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (admin) | ✅ |
| `AURA_REGISTRY_ADDRESS` | AuraRegistry contract address on Base Sepolia | ✅ |
| `BASE_SEPOLIA_RPC` | RPC endpoint for Base Sepolia (default: https://sepolia.base.org) | ⚠️ Optional |
| `FX721L_CONTRACT_ADDRESS` | Fx721L NFT contract address | ⚠️ Optional |
| `USDFX_CONTRACT_ADDRESS` | MockUSDFx stablecoin contract address | ⚠️ Optional |
| `JUSTICE_PROTOCOL_ADDRESS` | MockJusticeProtocol contract address | ⚠️ Optional |
