-- TACHE 4: Whisper AI Search Engine Table
-- Stores user text queries and AI-extracted structured data

CREATE TABLE IF NOT EXISTS public.whisper_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    text_query TEXT NOT NULL,
    ai_analysis_json JSONB,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- Index for efficient user queries
CREATE INDEX idx_whisper_requests_user_id ON public.whisper_requests(user_id);
CREATE INDEX idx_whisper_requests_status ON public.whisper_requests(status);
CREATE INDEX idx_whisper_requests_created_at ON public.whisper_requests(created_at DESC);

-- Index for soft deletes
CREATE INDEX idx_whisper_requests_deleted_at ON public.whisper_requests(deleted_at) WHERE deleted_at IS NOT NULL;

-- Trigger for updated_at
CREATE TRIGGER update_whisper_requests_updated_at
    BEFORE UPDATE ON public.whisper_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies
ALTER TABLE public.whisper_requests ENABLE ROW LEVEL SECURITY;

-- Users can read their own whisper requests
CREATE POLICY "Users can read own whisper requests" ON public.whisper_requests
    FOR SELECT USING (auth.uid() = user_id);

-- Users can create their own whisper requests
CREATE POLICY "Users can create own whisper requests" ON public.whisper_requests
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own whisper requests
CREATE POLICY "Users can update own whisper requests" ON public.whisper_requests
    FOR UPDATE USING (auth.uid() = user_id);

-- Users can soft delete their own whisper requests
CREATE POLICY "Users can delete own whisper requests" ON public.whisper_requests
    FOR DELETE USING (auth.uid() = user_id);

-- Service role can read/write all (for backend sync)
CREATE POLICY "Service role full access whisper_requests" ON public.whisper_requests
    FOR ALL USING (
        current_setting('request.jwt.claims', true)::json->>'role' = 'service_role'
    );

COMMENT ON TABLE public.whisper_requests IS 'AI-powered text search requests with structured extraction';
COMMENT ON COLUMN public.whisper_requests.text_query IS 'User natural language query (e.g., "Bordeaux wine from 1988")';
COMMENT ON COLUMN public.whisper_requests.ai_analysis_json IS 'AI-extracted structured data: {tags: [], category: "", confidence: 0.95}';
COMMENT ON COLUMN public.whisper_requests.status IS 'Processing status: pending, processing, completed, failed';
