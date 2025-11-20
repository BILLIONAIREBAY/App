-- 1. TABLE USERS (IDENTITY CORE)
CREATE TABLE public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE,
    wallet_address TEXT UNIQUE,
    trust_score INT DEFAULT 100,
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
