-- Add Final Beopardy fields to episode_teams
-- Allows tracking Final Beopardy at the team level instead of individual level

ALTER TABLE episode_teams
ADD COLUMN final_wager INTEGER DEFAULT NULL,
ADD COLUMN final_correct BOOLEAN DEFAULT NULL;

COMMENT ON COLUMN episode_teams.final_wager IS 'Points wagered by the team in Final Beopardy';
COMMENT ON COLUMN episode_teams.final_correct IS 'Whether the team got Final Beopardy correct';
