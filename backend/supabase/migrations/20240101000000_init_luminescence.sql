-- 1. TABLE USERS (IDENTITY CORE)
CREATE TYPE membership_tier_enum AS ENUM ('discovery', 'elite', 'infinite');

CREATE TABLE public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE,
    wallet_address TEXT UNIQUE,
    trust_score INT DEFAULT 100,
    membership_tier membership_tier_enum DEFAULT 'discovery',
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Public read access" ON public.users
    FOR SELECT USING (true);

-- 2. TABLE ITEMS (LUXURY CATALOG & LIVING ASSET)
CREATE TYPE asset_category_enum AS ENUM ('physical', 'digital_asset', 'hybrid');
CREATE TYPE item_status_enum AS ENUM ('draft', 'active', 'auction_live', 'sold', 'stolen', 'frozen');

CREATE TABLE public.items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_id UUID REFERENCES public.users(id) NOT NULL,
    
    title TEXT NOT NULL,
    description TEXT,
    
    category asset_category_enum NOT NULL DEFAULT 'physical',
    status item_status_enum NOT NULL DEFAULT 'draft',
    
    metadata JSONB DEFAULT '{}'::jsonb,
    
    serial_number_hash TEXT,
    fx_chain_token_id TEXT,
    is_stolen_flag BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_items_metadata ON public.items USING gin (metadata);
CREATE INDEX idx_items_status ON public.items (status);

ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read active items" ON public.items
    FOR SELECT USING (status IN ('active', 'auction_live', 'sold'));
CREATE POLICY "Vendor CRUD own items" ON public.items
    FOR ALL USING (auth.uid() = vendor_id);

-- 3. TABLE CHARITIES (IMPACT & LEGACY MODULE)
CREATE TABLE public.charities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    wallet_address TEXT UNIQUE NOT NULL,
    description TEXT,
    website_url TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    logo_url TEXT,
    impact_areas TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_charities_verified ON public.charities (is_verified);

ALTER TABLE public.charities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read verified charities" ON public.charities
    FOR SELECT USING (is_verified = true);

-- 4. TABLE CHARITY_AUCTIONS (SPLIT PAYMENT TRACKING)
CREATE TABLE public.charity_auctions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_id UUID REFERENCES public.items(id) NOT NULL,
    charity_id UUID REFERENCES public.charities(id) NOT NULL,
    charity_percentage INT NOT NULL CHECK (charity_percentage >= 1 AND charity_percentage <= 100),
    final_price_usd NUMERIC(18, 6),
    charity_amount_usd NUMERIC(18, 6),
    tx_hash TEXT,
    settled_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_charity_auctions_item ON public.charity_auctions (item_id);
CREATE INDEX idx_charity_auctions_charity ON public.charity_auctions (charity_id);

ALTER TABLE public.charity_auctions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read settled charity auctions" ON public.charity_auctions
    FOR SELECT USING (settled_at IS NOT NULL);
