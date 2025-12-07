-- Enable moddatetime extension
CREATE EXTENSION IF NOT EXISTS moddatetime SCHEMA extensions;

-- Create ai_blog_meta table
CREATE TABLE IF NOT EXISTS public.ai_blog_meta (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    blog_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
    raw_ai_output_de TEXT,
    raw_ai_output_en TEXT,
    raw_ai_output_tr TEXT,
    affiliate_slots JSONB DEFAULT '[]'::jsonb,
    generation_settings JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add RLS Policies
ALTER TABLE public.ai_blog_meta ENABLE ROW LEVEL SECURITY;

-- Only admins can view/edit ai_blog_meta
CREATE POLICY "Admins can view ai_blog_meta"
    ON public.ai_blog_meta
    FOR SELECT
    USING (auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin'));

CREATE POLICY "Admins can insert ai_blog_meta"
    ON public.ai_blog_meta
    FOR INSERT
    WITH CHECK (auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin'));

CREATE POLICY "Admins can update ai_blog_meta"
    ON public.ai_blog_meta
    FOR UPDATE
    USING (auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin'));

CREATE POLICY "Admins can delete ai_blog_meta"
    ON public.ai_blog_meta
    FOR DELETE
    USING (auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin'));

-- Create trigger for updated_at
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.ai_blog_meta
    FOR EACH ROW EXECUTE PROCEDURE moddatetime (updated_at);
