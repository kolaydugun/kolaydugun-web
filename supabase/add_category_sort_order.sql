-- Add sort_order column to categories table
ALTER TABLE categories 
ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;

-- Update existing categories with some initial order (optional, but good for testing)
UPDATE categories SET sort_order = 1 WHERE name = 'Wedding Venues';
UPDATE categories SET sort_order = 2 WHERE name = 'Bridal Fashion';
UPDATE categories SET sort_order = 3 WHERE name = 'Wedding Photography';
UPDATE categories SET sort_order = 4 WHERE name = 'Hair & Make-Up';
UPDATE categories SET sort_order = 5 WHERE name = 'Wedding Planners';
