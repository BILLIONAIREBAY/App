-- GATEKEEPER: Force Update & Maintenance Mode Control
CREATE TABLE public.app_config (
    id INT PRIMARY KEY DEFAULT 1,
    min_supported_version_ios TEXT NOT NULL DEFAULT '1.0.0',
    min_supported_version_android TEXT NOT NULL DEFAULT '1.0.0',
    maintenance_mode BOOLEAN DEFAULT FALSE,
    maintenance_message TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT single_row CHECK (id = 1)
);

-- Insert initial config
INSERT INTO public.app_config (id, min_supported_version_ios, min_supported_version_android, maintenance_mode)
VALUES (1, '1.0.0', '1.0.0', false);

-- Public read access (no auth required for version check)
ALTER TABLE public.app_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read app_config" ON public.app_config
    FOR SELECT USING (true);
