-- Add updated_at column to items table for delta sync
ALTER TABLE public.items 
ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();

-- Create trigger to automatically update updated_at on row modification
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_items_updated_at
BEFORE UPDATE ON public.items
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

-- Create index for efficient delta queries
CREATE INDEX idx_items_updated_at ON public.items (updated_at);

-- Backfill existing rows (set updated_at = created_at for existing data)
UPDATE public.items SET updated_at = created_at WHERE updated_at IS NULL;
