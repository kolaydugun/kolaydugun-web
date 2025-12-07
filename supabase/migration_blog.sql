-- Create posts table for the Blog system
CREATE TABLE IF NOT EXISTS posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT,
  excerpt TEXT,
  image_url TEXT,
  status TEXT CHECK (status IN ('draft', 'published', 'archived')) DEFAULT 'draft',
  author_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Policies
-- Everyone can read published posts
CREATE POLICY "Public can read published posts" ON posts
  FOR SELECT USING (status = 'published');

-- Admins can do everything
CREATE POLICY "Admins can manage all posts" ON posts
  FOR ALL USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE role = 'admin'
    )
  );

-- Seed a sample post
INSERT INTO posts (title, slug, content, excerpt, status, image_url)
VALUES (
  'KolayDüğün''e Hoş Geldiniz',
  'hos-geldiniz',
  'KolayDüğün ile Almanya''da düğün planlamak artık çok kolay. Bu ilk blog yazımızdır.',
  'Almanya''da düğün planlamanın yeni adresi.',
  'published',
  'https://images.unsplash.com/photo-1519741497674-611481863552?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80'
) ON CONFLICT (slug) DO NOTHING;
