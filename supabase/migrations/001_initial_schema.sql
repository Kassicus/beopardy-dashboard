-- Beopardy Stats Tracker - Initial Schema
-- Phase 1: Tables, Indexes, Views, and RLS Policies

-- ============================================
-- TABLES
-- ============================================

-- Players table
CREATE TABLE players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_players_slug ON players(slug);

-- Episodes table
CREATE TABLE episodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  episode_number INTEGER NOT NULL,
  season INTEGER DEFAULT 1,
  air_date DATE NOT NULL,
  youtube_url TEXT,
  thumbnail_url TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(season, episode_number)
);

CREATE INDEX idx_episodes_air_date ON episodes(air_date DESC);
CREATE INDEX idx_episodes_season ON episodes(season);

-- Episode appearances (junction table with stats)
CREATE TABLE episode_appearances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  episode_id UUID NOT NULL REFERENCES episodes(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  questions_seen INTEGER NOT NULL DEFAULT 0,
  questions_correct INTEGER NOT NULL DEFAULT 0,
  points_scored INTEGER NOT NULL DEFAULT 0,
  is_winner BOOLEAN NOT NULL DEFAULT FALSE,
  placement INTEGER CHECK (placement >= 1 AND placement <= 10),
  final_wager INTEGER DEFAULT 0,
  final_correct BOOLEAN,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(episode_id, player_id)
);

CREATE INDEX idx_appearances_episode ON episode_appearances(episode_id);
CREATE INDEX idx_appearances_player ON episode_appearances(player_id);
CREATE INDEX idx_appearances_winner ON episode_appearances(is_winner) WHERE is_winner = TRUE;

-- ============================================
-- VIEWS
-- ============================================

-- Player career stats aggregation
CREATE OR REPLACE VIEW player_career_stats AS
SELECT
  p.id,
  p.name,
  p.slug,
  p.image_url,
  COUNT(ea.id) AS total_appearances,
  SUM(CASE WHEN ea.is_winner THEN 1 ELSE 0 END) AS total_wins,
  ROUND(
    (SUM(CASE WHEN ea.is_winner THEN 1 ELSE 0 END)::DECIMAL / NULLIF(COUNT(ea.id), 0)) * 100,
    1
  ) AS win_percentage,
  SUM(ea.questions_seen) AS total_questions_seen,
  SUM(ea.questions_correct) AS total_questions_correct,
  ROUND(
    (SUM(ea.questions_correct)::DECIMAL / NULLIF(SUM(ea.questions_seen), 0)) * 100,
    1
  ) AS accuracy_percentage,
  SUM(ea.points_scored) AS total_points,
  ROUND(SUM(ea.points_scored)::DECIMAL / NULLIF(COUNT(ea.id), 0), 1) AS avg_points_per_appearance,
  MAX(ea.points_scored) AS highest_score,
  MIN(ea.points_scored) AS lowest_score,
  MAX(e.air_date) AS last_appearance,
  MIN(e.air_date) AS first_appearance
FROM players p
LEFT JOIN episode_appearances ea ON p.id = ea.player_id
LEFT JOIN episodes e ON ea.episode_id = e.id
GROUP BY p.id, p.name, p.slug, p.image_url;

-- Episode summary view
CREATE OR REPLACE VIEW episode_summary AS
SELECT
  e.id,
  e.title,
  e.episode_number,
  e.season,
  e.air_date,
  e.youtube_url,
  e.thumbnail_url,
  COUNT(ea.id) AS participant_count,
  (
    SELECT p.name
    FROM episode_appearances ea2
    JOIN players p ON ea2.player_id = p.id
    WHERE ea2.episode_id = e.id AND ea2.is_winner = TRUE
    LIMIT 1
  ) AS winner_name,
  (
    SELECT p.id
    FROM episode_appearances ea2
    JOIN players p ON ea2.player_id = p.id
    WHERE ea2.episode_id = e.id AND ea2.is_winner = TRUE
    LIMIT 1
  ) AS winner_id,
  MAX(ea.points_scored) AS highest_score
FROM episodes e
LEFT JOIN episode_appearances ea ON e.id = ea.episode_id
GROUP BY e.id, e.title, e.episode_number, e.season, e.air_date, e.youtube_url, e.thumbnail_url;

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

-- Enable RLS on all tables
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE episodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE episode_appearances ENABLE ROW LEVEL SECURITY;

-- Public read access policies
CREATE POLICY "Public read access for players" ON players FOR SELECT USING (true);
CREATE POLICY "Public read access for episodes" ON episodes FOR SELECT USING (true);
CREATE POLICY "Public read access for appearances" ON episode_appearances FOR SELECT USING (true);

-- Admin write access (authenticated users only)
CREATE POLICY "Admin insert players" ON players FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Admin update players" ON players FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Admin delete players" ON players FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Admin insert episodes" ON episodes FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Admin update episodes" ON episodes FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Admin delete episodes" ON episodes FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Admin insert appearances" ON episode_appearances FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Admin update appearances" ON episode_appearances FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Admin delete appearances" ON episode_appearances FOR DELETE USING (auth.role() = 'authenticated');

-- ============================================
-- TRIGGERS FOR updated_at
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_players_updated_at
  BEFORE UPDATE ON players
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_episodes_updated_at
  BEFORE UPDATE ON episodes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_appearances_updated_at
  BEFORE UPDATE ON episode_appearances
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
