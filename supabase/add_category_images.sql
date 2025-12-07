-- Add image_url column to categories table
ALTER TABLE categories 
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Update existing categories with the images we have (using the paths we created)
UPDATE categories SET image_url = '/images/categories/wedding-planning.png' WHERE name = 'Wedding Venues';
UPDATE categories SET image_url = '/images/categories/bridal-dress.png' WHERE name = 'Bridal Fashion';
UPDATE categories SET image_url = '/images/categories/hair-makeup.png' WHERE name = 'Hair & Make-Up';
UPDATE categories SET image_url = '/images/categories/groom_suits_category_1763822015284.png' WHERE name = 'Groom Suits';
UPDATE categories SET image_url = '/images/categories/wedding-photographer.png' WHERE name = 'Wedding Photography';
UPDATE categories SET image_url = '/images/categories/wedding-planning.png' WHERE name = 'Wedding Planners';

-- Set a default placeholder for others for now
UPDATE categories SET image_url = '/images/categories/wedding-planning.png' WHERE image_url IS NULL;
