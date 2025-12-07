-- Add seat_index and guest_group to guests table for Seating Chart
ALTER TABLE public.guests 
ADD COLUMN IF NOT EXISTS seat_index integer,
ADD COLUMN IF NOT EXISTS guest_group text;

-- Add total_guests to wedding_details
ALTER TABLE public.wedding_details
ADD COLUMN IF NOT EXISTS total_guests integer DEFAULT 0;

-- Ensure seating_tables has the right policies (already done in fix_all_final, but good to be safe)
ALTER TABLE public.seating_tables ENABLE ROW LEVEL SECURITY;

-- Add a comment to document the columns
COMMENT ON COLUMN public.guests.seat_index IS 'The specific seat number (1-based) at the table';
COMMENT ON COLUMN public.guests.guest_group IS 'Group name for the guest (e.g. Family, Friends)';
COMMENT ON COLUMN public.wedding_details.total_guests IS 'Total expected guests for the wedding';
