-- Add Final Beopardy winner tracking to episodes
-- This is a non-destructive migration that adds a nullable column

-- Add the final_beopardy_winner_id column to episodes table
ALTER TABLE episodes
ADD COLUMN final_beopardy_winner_id UUID REFERENCES players(id) ON DELETE SET NULL;

-- Add an index for faster lookups
CREATE INDEX idx_episodes_final_beopardy_winner ON episodes(final_beopardy_winner_id);

-- Add a comment explaining the column
COMMENT ON COLUMN episodes.final_beopardy_winner_id IS 'The player who won Final Beopardy for this episode, if applicable';
