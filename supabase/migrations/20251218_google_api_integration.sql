-- Create google_analytics_snapshots table for daily data tracking
CREATE TABLE IF NOT EXISTS public.google_analytics_snapshots (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    snapshot_date DATE UNIQUE NOT NULL DEFAULT CURRENT_DATE,
    
    -- Analytics Metrics
    total_users INTEGER DEFAULT 0,
    new_users INTEGER DEFAULT 0,
    active_users_28d INTEGER DEFAULT 0,
    sessions INTEGER DEFAULT 0,
    bounce_rate DECIMAL(5,2) DEFAULT 0,
    avg_session_duration DECIMAL(10,2) DEFAULT 0, -- in seconds
    
    -- GSC Metrics
    total_clicks INTEGER DEFAULT 0,
    total_impressions INTEGER DEFAULT 0,
    avg_ctr DECIMAL(5,2) DEFAULT 0,
    avg_position DECIMAL(5,2) DEFAULT 0,
    
    -- Detailed Data (JSONB)
    top_keywords JSONB DEFAULT '[]'::jsonb, -- [{word, clicks, impressions}]
    top_pages JSONB DEFAULT '[]'::jsonb,    -- [{path, views}]
    
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.google_analytics_snapshots ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Admins can view all snapshots"
    ON public.google_analytics_snapshots FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Index for date filtering
CREATE INDEX IF NOT EXISTS idx_google_analytics_snapshot_date ON public.google_analytics_snapshots(snapshot_date);

-- Comment
COMMENT ON TABLE public.google_analytics_snapshots IS 'Stores daily performance snapshots from Google Analytics and Search Console APIs for AI analysis.';
