-- Add missing credits_spent column to lead_unlocks table
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'lead_unlocks'
        AND column_name = 'credits_spent'
    ) THEN
        ALTER TABLE lead_unlocks ADD COLUMN credits_spent INTEGER NOT NULL DEFAULT 5;
    END IF;
END $$;
