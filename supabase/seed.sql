-- Beopardy Stats Tracker - Seed Data
-- Sample data for testing and development

-- ============================================
-- PLAYERS (Smosh Cast Members)
-- ============================================

INSERT INTO players (id, name, slug, image_url) VALUES
  ('a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'Shayne Topp', 'shayne-topp', NULL),
  ('b2c3d4e5-f6a7-5b6c-9d0e-1f2a3b4c5d6e', 'Courtney Miller', 'courtney-miller', NULL),
  ('c3d4e5f6-a7b8-6c7d-0e1f-2a3b4c5d6e7f', 'Damien Haas', 'damien-haas', NULL),
  ('d4e5f6a7-b8c9-7d8e-1f2a-3b4c5d6e7f8a', 'Ian Hecox', 'ian-hecox', NULL),
  ('e5f6a7b8-c9d0-8e9f-2a3b-4c5d6e7f8a9b', 'Keith Leak Jr.', 'keith-leak-jr', NULL),
  ('f6a7b8c9-d0e1-9f0a-3b4c-5d6e7f8a9b0c', 'Olivia Sui', 'olivia-sui', NULL),
  ('a7b8c9d0-e1f2-0a1b-4c5d-6e7f8a9b0c1d', 'Tommy Bowe', 'tommy-bowe', NULL),
  ('b8c9d0e1-f2a3-1b2c-5d6e-7f8a9b0c1d2e', 'Angela Giarratana', 'angela-giarratana', NULL),
  ('c9d0e1f2-a3b4-2c3d-6e7f-8a9b0c1d2e3f', 'Amanda Lehan-Canto', 'amanda-lehan-canto', NULL),
  ('d0e1f2a3-b4c5-3d4e-7f8a-9b0c1d2e3f4a', 'Spencer Agnew', 'spencer-agnew', NULL);

-- ============================================
-- EPISODES
-- ============================================

INSERT INTO episodes (id, title, episode_number, season, air_date, youtube_url, description) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Beopardy Premiere', 1, 1, '2023-01-15', 'https://youtube.com/watch?v=example1', 'The very first episode of Beopardy!'),
  ('22222222-2222-2222-2222-222222222222', 'Beopardy: Movie Madness', 2, 1, '2023-01-22', 'https://youtube.com/watch?v=example2', 'Movie-themed trivia showdown'),
  ('33333333-3333-3333-3333-333333333333', 'Beopardy: Battle of the Brains', 3, 1, '2023-01-29', 'https://youtube.com/watch?v=example3', 'Who has the biggest brain?'),
  ('44444444-4444-4444-4444-444444444444', 'Beopardy: Pop Culture Chaos', 4, 1, '2023-02-05', 'https://youtube.com/watch?v=example4', 'Pop culture trivia extravaganza'),
  ('55555555-5555-5555-5555-555555555555', 'Beopardy: Season Finale', 5, 1, '2023-02-12', 'https://youtube.com/watch?v=example5', 'Season 1 championship showdown');

-- ============================================
-- EPISODE APPEARANCES (Results)
-- ============================================

-- Episode 1: Shayne, Courtney, Damien
INSERT INTO episode_appearances (episode_id, player_id, questions_seen, questions_correct, points_scored, is_winner, placement) VALUES
  ('11111111-1111-1111-1111-111111111111', 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 25, 18, 12400, TRUE, 1),
  ('11111111-1111-1111-1111-111111111111', 'b2c3d4e5-f6a7-5b6c-9d0e-1f2a3b4c5d6e', 25, 15, 9800, FALSE, 2),
  ('11111111-1111-1111-1111-111111111111', 'c3d4e5f6-a7b8-6c7d-0e1f-2a3b4c5d6e7f', 25, 12, 7200, FALSE, 3);

-- Episode 2: Ian, Keith, Olivia
INSERT INTO episode_appearances (episode_id, player_id, questions_seen, questions_correct, points_scored, is_winner, placement) VALUES
  ('22222222-2222-2222-2222-222222222222', 'd4e5f6a7-b8c9-7d8e-1f2a-3b4c5d6e7f8a', 25, 20, 15200, TRUE, 1),
  ('22222222-2222-2222-2222-222222222222', 'e5f6a7b8-c9d0-8e9f-2a3b-4c5d6e7f8a9b', 25, 14, 8600, FALSE, 2),
  ('22222222-2222-2222-2222-222222222222', 'f6a7b8c9-d0e1-9f0a-3b4c-5d6e7f8a9b0c', 25, 16, 10400, FALSE, 3);

-- Episode 3: Shayne, Damien, Tommy
INSERT INTO episode_appearances (episode_id, player_id, questions_seen, questions_correct, points_scored, is_winner, placement) VALUES
  ('33333333-3333-3333-3333-333333333333', 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 25, 19, 14200, TRUE, 1),
  ('33333333-3333-3333-3333-333333333333', 'c3d4e5f6-a7b8-6c7d-0e1f-2a3b4c5d6e7f', 25, 17, 11800, FALSE, 2),
  ('33333333-3333-3333-3333-333333333333', 'a7b8c9d0-e1f2-0a1b-4c5d-6e7f8a9b0c1d', 25, 13, 8200, FALSE, 3);

-- Episode 4: Courtney, Angela, Amanda
INSERT INTO episode_appearances (episode_id, player_id, questions_seen, questions_correct, points_scored, is_winner, placement) VALUES
  ('44444444-4444-4444-4444-444444444444', 'b2c3d4e5-f6a7-5b6c-9d0e-1f2a3b4c5d6e', 25, 21, 16800, TRUE, 1),
  ('44444444-4444-4444-4444-444444444444', 'b8c9d0e1-f2a3-1b2c-5d6e-7f8a9b0c1d2e', 25, 16, 10200, FALSE, 2),
  ('44444444-4444-4444-4444-444444444444', 'c9d0e1f2-a3b4-2c3d-6e7f-8a9b0c1d2e3f', 25, 14, 8800, FALSE, 3);

-- Episode 5 (Finale): Shayne, Courtney, Ian, Damien
INSERT INTO episode_appearances (episode_id, player_id, questions_seen, questions_correct, points_scored, is_winner, placement) VALUES
  ('55555555-5555-5555-5555-555555555555', 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 30, 22, 18600, FALSE, 2),
  ('55555555-5555-5555-5555-555555555555', 'b2c3d4e5-f6a7-5b6c-9d0e-1f2a3b4c5d6e', 30, 18, 14200, FALSE, 3),
  ('55555555-5555-5555-5555-555555555555', 'd4e5f6a7-b8c9-7d8e-1f2a-3b4c5d6e7f8a', 30, 24, 21400, TRUE, 1),
  ('55555555-5555-5555-5555-555555555555', 'c3d4e5f6-a7b8-6c7d-0e1f-2a3b4c5d6e7f', 30, 16, 12000, FALSE, 4);
