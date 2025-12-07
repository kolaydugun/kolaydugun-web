-- Add notes column to budget_items table
ALTER TABLE budget_items ADD COLUMN IF NOT EXISTS notes TEXT;
