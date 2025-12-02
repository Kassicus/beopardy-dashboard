export const APP_NAME = "Beopardy Stats";
export const APP_DESCRIPTION = "Track player statistics from the Smosh Pit Beopardy game show";

export const ROUTES = {
  home: "/",
  players: "/players",
  player: (slug: string) => `/players/${slug}`,
  compare: "/compare",
  episodes: "/episodes",
  episode: (id: string) => `/episodes/${id}`,
  leaderboards: "/leaderboards",
  records: "/records",
  admin: {
    dashboard: "/admin",
    login: "/admin/login",
    players: "/admin/players",
    newPlayer: "/admin/players/new",
    episodes: "/admin/episodes",
    newEpisode: "/admin/episodes/new",
    episodeResults: (id: string) => `/admin/episodes/${id}/results`,
  },
} as const;

export const LEADERBOARD_MIN_APPEARANCES = 3;

export const PAGINATION = {
  defaultLimit: 20,
  maxLimit: 100,
} as const;
