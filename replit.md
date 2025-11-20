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

## Recent Changes
- 2025-01-20: Initial monorepo setup with all workspaces
- 2025-01-20: Configured Base Sepolia blockchain integration
- 2025-01-20: Created Supabase schema for users and living assets

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
