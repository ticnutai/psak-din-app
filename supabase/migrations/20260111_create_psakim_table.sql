-- Create psakim (rulings) table
CREATE TABLE IF NOT EXISTS psakim (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    date DATE,
    topics TEXT[] DEFAULT '{}',
    sources TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for full-text search on title and content
CREATE INDEX IF NOT EXISTS psakim_search_idx ON psakim 
    USING gin(to_tsvector('hebrew', title || ' ' || content));

-- Create index for topics array
CREATE INDEX IF NOT EXISTS psakim_topics_idx ON psakim USING gin(topics);

-- Enable Row Level Security
ALTER TABLE psakim ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
CREATE POLICY "Allow public read access" ON psakim
    FOR SELECT
    USING (true);

-- Create policy for authenticated insert/update/delete
CREATE POLICY "Allow authenticated write access" ON psakim
    FOR ALL
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to auto-update updated_at
CREATE TRIGGER update_psakim_updated_at
    BEFORE UPDATE ON psakim
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
