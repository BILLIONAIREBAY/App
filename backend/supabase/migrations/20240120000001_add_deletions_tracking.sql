-- Deletion tracking table for sync purposes
-- Logs all deletions so mobile clients can receive delete events during PULL

CREATE TABLE public.deletions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_name TEXT NOT NULL,
    record_id UUID NOT NULL,
    deleted_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_deletions_deleted_at ON public.deletions (deleted_at);
CREATE INDEX idx_deletions_table ON public.deletions (table_name);

-- Trigger function to log deletions
CREATE OR REPLACE FUNCTION log_deletion()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.deletions (table_name, record_id, deleted_at)
    VALUES (TG_TABLE_NAME, OLD.id, NOW());
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Attach triggers to all synced tables
CREATE TRIGGER log_users_deletion
BEFORE DELETE ON public.users
FOR EACH ROW
EXECUTE FUNCTION log_deletion();

CREATE TRIGGER log_items_deletion
BEFORE DELETE ON public.items
FOR EACH ROW
EXECUTE FUNCTION log_deletion();

CREATE TRIGGER log_charities_deletion
BEFORE DELETE ON public.charities
FOR EACH ROW
EXECUTE FUNCTION log_deletion();

-- Cleanup old deletions (keep last 90 days)
-- Run this periodically via cron or manually
-- DELETE FROM public.deletions WHERE deleted_at < NOW() - INTERVAL '90 days';
