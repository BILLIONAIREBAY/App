# BillionaireBay - LUMINESCENCE V3

## Overview
Phygital Sovereignty Marketplace - A luxury marketplace combining physical and digital assets with blockchain integration, local-first architecture, and edge computing.

## Architecture

### Monorepo Structure (TurboRepo)
- `/app` - React Native (Expo) mobile application
- `/backend` - Cloudflare Workers edge API
- `/chain` - Hardhat smart contracts (Base Sepolia/FxChain)
- `/shared` - Shared TypeScript types and tRPC schemas

### Core Technologies
- **Frontend**: React Native with Expo, Expo Router, NativeWind (Tailwind)
- **Backend**: Cloudflare Workers, Hono framework, Durable Objects
- **Blockchain**: Hardhat, Base Sepolia testnet (production: FxChain)
- **Database**: Supabase PostgreSQL with Row Level Security
- **Storage**: Cloudflare R2 (Shadow Vault)
- **Synchronization**: WatermelonDB (local-first)

### Key Features
- **Living Assets**: Dynamic NFTs (Fx-721L) with JSONB metadata
- **Aura Registry**: Trust score and stolen item tracking
- **Concierge Vision**: AI-powered luxury authentication via camera
- **Real-time Auctions**: WebSocket-based via Durable Objects
- **Shadow Vault**: Encrypted R2 storage for authentication certificates
- **Membership Tiers**: Discovery (free), Elite ($7k/year), Infinite ($40k/year)
- **Impact & Legacy**: Charity auction support with split payments

### Smart Contracts (Base Sepolia Testnet)
- **Fx721L**: Living Asset NFT with dynamic metadata and stolen flag
- **MockUSDFx**: ERC20 stablecoin for testing (6 decimals, faucet enabled)
- **MockJusticeProtocol**: Freeze/seize protocol for compliance

### Database Schema (Supabase PostgreSQL)
- **users**: Identity core with wallet, trust_score, membership_tier
- **items**: Luxury catalog with JSONB metadata, status tracking
- **charities**: Verified foundation registry with wallet addresses
- **charity_auctions**: Split payment tracking for impact auctions

## Recent Changes
- 2025-11-21: **TACHE 3 COMPLETED** - L'ARÈNE DES ENCHÈRES (Durable Objects & WebSockets)
  - **Backend (Cloudflare Workers + Durable Objects):**
    * AuctionRoomDO class: In-RAM auction state (currentPrice, highestBidder, endTime, bidsHistory)
    * WebSocket route GET /auction/:id/websocket with path-based routing (`/auction/${id}`)
    * Anti-snipe logic: +30s extension when bid arrives in final 30 seconds
    * Persistence via alarm() at auction end + every 10s backup recommended
    * Robust path parsing: `split('/').filter(Boolean)` handles trailing slashes
    * Durable Object binding: AUCTION_ROOM configured in wrangler.toml
  - **Frontend (React Native + Expo):**
    * useAuctionRoom hook: WebSocket connection with automatic reconnection
    * Optimistic UI: local state update before server confirmation
    * Haptic feedback on bid placement (expo-haptics)
    * Countdown timer with 100ms refresh for sub-100ms perceived latency
    * Live auction screen (/auction/[id].tsx): video placeholder + overlay UI
  - **Database migrations:**
    * 20240121000000_add_app_config.sql: Gatekeeper version control table
    * 20240121000001_add_auctions.sql: Auctions and bids tracking tables
- 2025-11-21: **SECURITY & PRIVACY ADDITIONS**
  - **Gatekeeper System (Force Update):**
    * app_config table with min_supported_version_ios/android + maintenance_mode
    * Version comparison logic with semantic versioning (compareVersions)
    * Non-dismissible modal blocking navigation when update/maintenance required
    * Conditional rendering: Stack only renders when !isGated
    * Error-safe: clears gate state on Supabase fetch errors (no spurious lockouts)
  - **Privacy Shield (Anti-Screenshot + Multitasking):**
    * expo-screen-capture: usePreventScreenCapture() blocks screenshots/recording
    * AppState listener: detects background/inactive states
    * BlurView overlay: renders full-screen dark blur when app backgrounds
    * PrivacyShieldOverlay component: proper StyleSheet.create() for cross-platform
    * Prevents sensitive auction data exposure during multitasking/screenshots
- 2025-11-21: **TACHE 2 COMPLETED** - AuraRegistry Blockchain + Backend Sync API with SMART TRAP
  - Created AuraRegistry.sol smart contract for global stolen item tracking
  - Implemented deploy_core.ts script (deploys MockUSDFx, MockJusticeProtocol, Fx721L, AuraRegistry)
  - Built Hono backend on Cloudflare Workers with 3 endpoints:
    * POST /sync/push: SMART TRAP checks AuraRegistry before accepting items, strips created_at/updated_at to respect triggers
    * GET /sync/pull: Delta sync with watermark from max(updated_at, deleted_at) of returned rows, falls back to lastPulledAt or epoch zero
    * GET /aura/check/:serialHash: Manual verification endpoint
  - Database migrations:
    * 20240120000000_add_items_updated_at.sql: Added updated_at column with trigger, index, and backfill
    * 20240120000001_add_deletions_tracking.sql: Created deletions table with automatic triggers on users/items/charities
  - Frontend SyncEngine handles creates/updates/deletions with destroyPermanently() to prevent tombstone accumulation
  - Watermark computation prevents race conditions by using timestamps of returned data only
  - Backend strips created_at/updated_at from all payloads to let database triggers control timestamps
  - Complete documentation in backend/README.md and .env.example
- 2025-11-20: **TACHE 1 COMPLETED** - Local-First Architecture & Biometric Authentication
  - WatermelonDB configured with JSI for high-performance SQLite
  - Schema mirrors Supabase (users, items, charities)
  - SyncEngine with PULL/PUSH to Cloudflare Workers backend
  - Biometric auth (Passkeys/Face ID) via expo-local-authentication
  - Home screen uses withObservables for reactive UI
  - Timestamps persisted for delta tracking
- 2025-11-20: Completed TACHE 0 - LUMINESCENCE V3 initialization
- 2025-11-20: Added membership_tier enum to users table
- 2025-11-20: Created charities and charity_auctions tables
- 2025-11-20: Deployed MockUSDFx and MockJusticeProtocol contracts
- 2025-01-20: Initial monorepo setup with all workspaces
- 2025-01-20: Configured Base Sepolia blockchain integration

## Development Setup

### Prerequisites
You will need to configure the following secrets:
- `PRIVATE_KEY` - Blockchain wallet private key
- `CLOUDFLARE_API_TOKEN` - Cloudflare API access
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_ANON_KEY` - Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key

### Running the App
1. Install dependencies: `npm install`
2. Start Expo dev server: `npm run app:dev`
3. Scan QR code with Expo Go app on your physical device

**IMPORTANT**: WatermelonDB requires a custom development build due to JSI (JavaScript Interface). Expo Go does NOT support WatermelonDB. To test:
- Use `eas build --profile development` to create a custom build
- Or test on iOS Simulator / Android Emulator with development builds

### Deploying Backend
1. Configure Wrangler: `cd backend && wrangler login`
2. Deploy: `npm run deploy` (from backend directory)

### Compiling Smart Contracts
1. Add private key to `.env` in chain directory
2. Compile: `cd chain && npm run compile`
3. Deploy: `npm run deploy`

## User Preferences
- Architecture: Local-First, Edge-Orchestrated, FxChain Native
- No compromises on native mobile features (Camera, Haptics)
- No placeholder/mock data - authentic integration only
- Cloudflare Workers preferred over traditional Node.js servers
