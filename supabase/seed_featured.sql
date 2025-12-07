-- Create a featured vendor for demo purposes
INSERT INTO public.vendors (
    user_id, 
    business_name, 
    category_id, 
    city_id, 
    description, 
    min_price, 
    is_featured,
    is_claimed,
    image_urls
)
SELECT 
    auth.uid(), -- This might fail if no user is logged in, but for seed it's tricky. 
    -- Better to update an existing one if possible, or insert with a dummy UUID if no FK constraint on user_id (there is one).
    -- Let's try to update the first vendor found, or insert if empty.
    'Showcase DJ Istanbul',
    (SELECT id FROM categories WHERE name = 'DJs' LIMIT 1),
    (SELECT id FROM cities WHERE name = 'Istanbul' LIMIT 1),
    'This is a featured vendor example.',
    500,
    true,
    true,
    ARRAY['https://images.unsplash.com/photo-1516035069371-29a1b244cc32?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80']
WHERE NOT EXISTS (SELECT 1 FROM vendors LIMIT 1);

-- If vendors exist, just update the first one to be featured
UPDATE vendors 
SET is_featured = true, business_name = 'Showcase DJ (Featured)' 
WHERE id = (SELECT id FROM vendors LIMIT 1);
