-- Migration for DJ & Musician Live Request System
-- Created: 2024-12-24

-- 1. Create live_events table
CREATE TABLE IF NOT EXISTS public.live_events (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    vendor_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    event_name text NOT NULL,
    slug text UNIQUE NOT NULL,
    is_active boolean DEFAULT true,
    is_closed boolean DEFAULT false,
    settings jsonb DEFAULT '{
        "request_limit": 50,
        "cooldown_sec": 60,
        "theme": "dark",
        "language_default": "tr"
    }'::jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- 2. Create live_requests table
CREATE TABLE IF NOT EXISTS public.live_requests (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    event_id uuid REFERENCES public.live_events(id) ON DELETE CASCADE,
    song_title text NOT NULL,
    artist_name text,
    requester_name text,
    note text,
    status text DEFAULT 'pending' CHECK (status IN ('pending', 'played', 'rejected', 'waiting')),
    device_id text, -- Used for spam/cooldown tracking
    ip_address inet,
    created_at timestamp with time zone DEFAULT now()
);

-- 3. Create profanity filter table (simple version for MVP)
CREATE TABLE IF NOT EXISTS public.live_profanity_filter (
    id serial PRIMARY KEY,
    word text UNIQUE NOT NULL
);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.live_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.live_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.live_profanity_filter ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies for live_events
-- DJs can see and manage their own events
CREATE POLICY "DJs can manage their own events" 
    ON public.live_events 
    FOR ALL 
    USING (auth.uid() = vendor_id);

-- Anyone can view an event (needed for the guest landing page)
CREATE POLICY "Public can view active events" 
    ON public.live_events 
    FOR SELECT 
    USING (is_active = true);

-- 6. RLS Policies for live_requests
-- DJs can manage requests for their events
CREATE POLICY "DJs can manage requests for their events" 
    ON public.live_requests 
    FOR ALL 
    USING (
        EXISTS (
            SELECT 1 FROM public.live_events 
            WHERE live_events.id = live_requests.event_id 
            AND live_events.vendor_id = auth.uid()
        )
    );

-- Guests can insert requests into active, non-closed events
CREATE POLICY "Guests can submit requests" 
    ON public.live_requests 
    FOR INSERT 
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.live_events 
            WHERE live_events.id = event_id 
            AND live_events.is_active = true 
            AND live_events.is_closed = false
        )
    );

-- Guests can view requests for an event they are participating in
CREATE POLICY "Guests can view requests for the same event" 
    ON public.live_requests 
    FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM public.live_events 
            WHERE live_events.id = event_id 
            AND live_events.is_active = true
        )
    );

-- 7. Realtime setup
-- Add tables to the realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.live_events;
ALTER PUBLICATION supabase_realtime ADD TABLE public.live_requests;

-- 8. Indexes for performance
CREATE INDEX IF NOT EXISTS idx_live_events_vendor_id ON public.live_events(vendor_id);
CREATE INDEX IF NOT EXISTS idx_live_events_slug ON public.live_events(slug);
CREATE INDEX IF NOT EXISTS idx_live_requests_event_id ON public.live_requests(event_id);
CREATE INDEX IF NOT EXISTS idx_live_requests_status ON public.live_requests(status);
