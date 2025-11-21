-- AUCTIONS TABLE: Live Auction Data Persistence
CREATE TYPE auction_status_enum AS ENUM ('scheduled', 'live', 'ended', 'cancelled');

CREATE TABLE public.auctions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_id UUID REFERENCES public.items(id) NOT NULL,
    
    start_price NUMERIC(18, 6) NOT NULL,
    current_price NUMERIC(18, 6),
    reserve_price NUMERIC(18, 6),
    
    highest_bidder_id UUID REFERENCES public.users(id),
    bid_increment NUMERIC(18, 6) DEFAULT 100,
    
    status auction_status_enum DEFAULT 'scheduled',
    
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    
    total_bids INT DEFAULT 0,
    
    stream_url TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_auctions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_auctions_updated_at
BEFORE UPDATE ON public.auctions
FOR EACH ROW
EXECUTE FUNCTION update_auctions_updated_at();

-- Indexes
CREATE INDEX idx_auctions_item ON public.auctions (item_id);
CREATE INDEX idx_auctions_status ON public.auctions (status);
CREATE INDEX idx_auctions_end_time ON public.auctions (end_time);
CREATE INDEX idx_auctions_updated_at ON public.auctions (updated_at);

-- Row Level Security
ALTER TABLE public.auctions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read live auctions" ON public.auctions
    FOR SELECT USING (status IN ('live', 'ended'));
CREATE POLICY "Admin manage auctions" ON public.auctions
    FOR ALL USING (false);

-- Bids History Table (for persistence)
CREATE TABLE public.bids (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auction_id UUID REFERENCES public.auctions(id) NOT NULL,
    bidder_id UUID REFERENCES public.users(id) NOT NULL,
    amount NUMERIC(18, 6) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_bids_auction ON public.bids (auction_id);
CREATE INDEX idx_bids_bidder ON public.bids (bidder_id);
CREATE INDEX idx_bids_created_at ON public.bids (created_at);

ALTER TABLE public.bids ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read bids" ON public.bids
    FOR SELECT USING (true);
