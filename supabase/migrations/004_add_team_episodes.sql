-- Add Team Episodes Support
-- This is a non-destructive migration that adds team episode functionality
-- All existing episodes will default to 'solo' type and continue working unchanged

-- ============================================
-- SCHEMA CHANGES
-- ============================================

-- Add episode_type column to episodes table
ALTER TABLE episodes
ADD COLUMN episode_type TEXT NOT NULL DEFAULT 'solo'
  CHECK (episode_type IN ('solo', 'team'));

CREATE INDEX idx_episodes_type ON episodes(episode_type);

COMMENT ON COLUMN episodes.episode_type IS 'Type of episode: solo (individual competition) or team (team competition)';

-- Create episode_teams table for team-based episodes
CREATE TABLE episode_teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  episode_id UUID NOT NULL REFERENCES episodes(id) ON DELETE CASCADE,
  team_name TEXT NOT NULL,
  team_color TEXT,
  is_winner BOOLEAN NOT NULL DEFAULT FALSE,
  total_points INTEGER NOT NULL DEFAULT 0,
  placement INTEGER CHECK (placement >= 1 AND placement <= 10),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(episode_id, team_name)
);

CREATE INDEX idx_episode_teams_episode ON episode_teams(episode_id);
CREATE INDEX idx_episode_teams_winner ON episode_teams(is_winner) WHERE is_winner = TRUE;

COMMENT ON TABLE episode_teams IS 'Teams created for team-based episodes (per-episode, not reusable)';

-- Add team_id column to episode_appearances for team episodes
ALTER TABLE episode_appearances
ADD COLUMN team_id UUID REFERENCES episode_teams(id) ON DELETE SET NULL;

CREATE INDEX idx_appearances_team ON episode_appearances(team_id);

COMMENT ON COLUMN episode_appearances.team_id IS 'Reference to team for team episodes, NULL for solo episodes';

-- ============================================
-- UPDATED VIEWS
-- ============================================

-- Drop and recreate player_career_stats view with solo/team win tracking
DROP VIEW IF EXISTS player_career_stats;

CREATE OR REPLACE VIEW player_career_stats AS
SELECT
  p.id,
  p.name,
  p.slug,
  p.image_url,
  COUNT(ea.id) AS total_appearances,
  -- Solo appearances and wins
  SUM(CASE WHEN e.episode_type = 'solo' THEN 1 ELSE 0 END) AS solo_appearances,
  SUM(CASE WHEN ea.is_winner AND e.episode_type = 'solo' THEN 1 ELSE 0 END) AS solo_wins,
  ROUND(
    (SUM(CASE WHEN ea.is_winner AND e.episode_type = 'solo' THEN 1 ELSE 0 END)::DECIMAL /
    NULLIF(SUM(CASE WHEN e.episode_type = 'solo' THEN 1 ELSE 0 END), 0)) * 100,
    1
  ) AS solo_win_percentage,
  -- Team appearances and wins
  SUM(CASE WHEN e.episode_type = 'team' THEN 1 ELSE 0 END) AS team_appearances,
  SUM(CASE WHEN et.is_winner THEN 1 ELSE 0 END) AS team_wins,
  ROUND(
    (SUM(CASE WHEN et.is_winner THEN 1 ELSE 0 END)::DECIMAL /
    NULLIF(SUM(CASE WHEN e.episode_type = 'team' THEN 1 ELSE 0 END), 0)) * 100,
    1
  ) AS team_win_percentage,
  -- Combined totals (for backwards compatibility)
  SUM(CASE
    WHEN ea.is_winner AND e.episode_type = 'solo' THEN 1
    WHEN et.is_winner THEN 1
    ELSE 0
  END) AS total_wins,
  ROUND(
    (SUM(CASE
      WHEN ea.is_winner AND e.episode_type = 'solo' THEN 1
      WHEN et.is_winner THEN 1
      ELSE 0
    END)::DECIMAL / NULLIF(COUNT(ea.id), 0)) * 100,
    1
  ) AS win_percentage,
  -- Performance stats (unchanged)
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
LEFT JOIN episode_teams et ON ea.team_id = et.id
GROUP BY p.id, p.name, p.slug, p.image_url;

-- Drop and recreate episode_summary view with team info
DROP VIEW IF EXISTS episode_summary;

CREATE OR REPLACE VIEW episode_summary AS
SELECT
  e.id,
  e.title,
  e.episode_number,
  e.season,
  e.air_date,
  e.youtube_url,
  e.thumbnail_url,
  e.episode_type,
  COUNT(ea.id) AS participant_count,
  -- For solo episodes, get individual winner
  (
    SELECT p.name
    FROM episode_appearances ea2
    JOIN players p ON ea2.player_id = p.id
    WHERE ea2.episode_id = e.id AND ea2.is_winner = TRUE AND e.episode_type = 'solo'
    LIMIT 1
  ) AS winner_name,
  (
    SELECT p.id
    FROM episode_appearances ea2
    JOIN players p ON ea2.player_id = p.id
    WHERE ea2.episode_id = e.id AND ea2.is_winner = TRUE AND e.episode_type = 'solo'
    LIMIT 1
  ) AS winner_id,
  -- For team episodes, get winning team
  (
    SELECT et.team_name
    FROM episode_teams et
    WHERE et.episode_id = e.id AND et.is_winner = TRUE
    LIMIT 1
  ) AS winning_team_name,
  (
    SELECT et.id
    FROM episode_teams et
    WHERE et.episode_id = e.id AND et.is_winner = TRUE
    LIMIT 1
  ) AS winning_team_id,
  -- Team count for team episodes
  (
    SELECT COUNT(*)
    FROM episode_teams et
    WHERE et.episode_id = e.id
  ) AS team_count,
  MAX(ea.points_scored) AS highest_score
FROM episodes e
LEFT JOIN episode_appearances ea ON e.id = ea.episode_id
GROUP BY e.id, e.title, e.episode_number, e.season, e.air_date, e.youtube_url, e.thumbnail_url, e.episode_type;

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

-- Enable RLS on episode_teams
ALTER TABLE episode_teams ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Public read access for episode_teams" ON episode_teams FOR SELECT USING (true);

-- Admin write access
CREATE POLICY "Admin insert episode_teams" ON episode_teams FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Admin update episode_teams" ON episode_teams FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Admin delete episode_teams" ON episode_teams FOR DELETE USING (auth.role() = 'authenticated');

-- ============================================
-- TRIGGERS
-- ============================================

-- Add updated_at trigger for episode_teams
CREATE TRIGGER update_episode_teams_updated_at
  BEFORE UPDATE ON episode_teams
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
