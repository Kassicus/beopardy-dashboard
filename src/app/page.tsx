import Link from "next/link";
import { Trophy, Users, Tv, BarChart3, Calendar, Crown, Swords, Medal } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatCard } from "@/components/ui/StatCard";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { RecentActivity } from "@/components/stats/RecentActivity";
import { ROUTES } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils/formatters";

const quickLinks = [
  {
    title: "Players",
    description: "View all Beopardy contestants and their career stats",
    href: ROUTES.players,
    icon: Users,
    color: "text-beo-terracotta",
    bgColor: "bg-beo-terracotta/10",
  },
  {
    title: "Episodes",
    description: "Browse all episodes and see who won each game",
    href: ROUTES.episodes,
    icon: Tv,
    color: "text-beo-rose",
    bgColor: "bg-beo-rose/10",
  },
  {
    title: "Leaderboards",
    description: "See who's on top across various statistics",
    href: ROUTES.leaderboards,
    icon: Trophy,
    color: "text-beo-golden-dark",
    bgColor: "bg-beo-golden/20",
  },
  {
    title: "Compare",
    description: "Head-to-head matchups between players",
    href: ROUTES.compare,
    icon: Swords,
    color: "text-beo-rose-dark",
    bgColor: "bg-beo-rose/10",
  },
  {
    title: "Records",
    description: "Fun stats, records, and milestones",
    href: ROUTES.records,
    icon: Medal,
    color: "text-beo-golden-dark",
    bgColor: "bg-beo-golden/20",
  },
];

export default async function HomePage() {
  const supabase = await createClient();

  // Fetch stats counts
  const [playersResult, episodesResult, appearancesResult] = await Promise.all([
    supabase.from("players").select("id", { count: "exact", head: true }),
    supabase.from("episodes").select("id", { count: "exact", head: true }),
    supabase.from("episode_appearances").select("id", { count: "exact", head: true }),
  ]);

  const playerCount = playersResult.count ?? 0;
  const episodeCount = episodesResult.count ?? 0;
  const appearanceCount = appearancesResult.count ?? 0;

  // Fetch recent episodes with winners
  const { data: recentEpisodes } = await supabase
    .from("episode_summary")
    .select("*")
    .order("air_date", { ascending: false })
    .limit(5);

  // Fetch top performers by wins (with at least 1 appearance)
  // Sort by total_wins first, then use win_percentage as tiebreaker
  const { data: topWinners } = await supabase
    .from("player_career_stats")
    .select("*")
    .gt("total_appearances", 0)
    .order("total_wins", { ascending: false })
    .order("win_percentage", { ascending: false })
    .limit(5);

  // Calculate total wins for display
  const totalWins = topWinners?.reduce((sum, p) => sum + (p.total_wins ?? 0), 0) ?? 0;

  // Fetch recent activity (recently added players and episodes with results)
  const { data: recentPlayers } = await supabase
    .from("players")
    .select("id, name, slug, image_url, created_at")
    .order("created_at", { ascending: false })
    .limit(3);

  const { data: recentEpisodesWithResults } = await supabase
    .from("episode_summary")
    .select("id, title, season, episode_number, air_date, winner_name")
    .not("winner_name", "is", null)
    .order("air_date", { ascending: false })
    .limit(3);

  // Build activity feed
  type ActivityItem = {
    type: "new_player" | "new_episode" | "episode_results";
    id: string;
    title: string;
    subtitle?: string;
    date: string;
    href: string;
    imageUrl?: string | null;
    metadata?: {
      winnerName?: string;
      playerCount?: number;
    };
  };

  const activities: ActivityItem[] = [];

  recentPlayers?.forEach((player) => {
    activities.push({
      type: "new_player",
      id: player.id,
      title: player.name,
      date: player.created_at ?? new Date().toISOString(),
      href: ROUTES.player(player.slug),
      imageUrl: player.image_url,
    });
  });

  recentEpisodesWithResults?.forEach((episode) => {
    activities.push({
      type: "episode_results",
      id: episode.id ?? "",
      title: episode.title ?? "",
      subtitle: `Season ${episode.season} Episode ${episode.episode_number}`,
      date: episode.air_date ?? new Date().toISOString(),
      href: ROUTES.episode(episode.id ?? ""),
      metadata: {
        winnerName: episode.winner_name ?? undefined,
      },
    });
  });

  // Sort by date descending
  activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="py-12">
      <Container>
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold font-display text-foreground mb-4">
            Welcome to{" "}
            <span className="text-beo-terracotta">Beopardy</span> Stats
          </h1>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto mb-8">
            Track player statistics, episode results, and leaderboards from the
            Smosh Pit Beopardy game show.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href={ROUTES.leaderboards}>
              <Button size="lg" leftIcon={<BarChart3 className="h-5 w-5" />}>
                View Leaderboards
              </Button>
            </Link>
            <Link href={ROUTES.players}>
              <Button variant="outline" size="lg">
                Browse Players
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          <StatCard
            label="Total Players"
            value={playerCount}
            icon={<Users className="h-5 w-5" />}
            accentColor="terracotta"
          />
          <StatCard
            label="Total Episodes"
            value={episodeCount}
            icon={<Tv className="h-5 w-5" />}
            accentColor="rose"
          />
          <StatCard
            label="Total Appearances"
            value={appearanceCount}
            icon={<BarChart3 className="h-5 w-5" />}
            accentColor="golden"
          />
          <StatCard
            label="Games Won"
            value={totalWins}
            icon={<Trophy className="h-5 w-5" />}
            accentColor="cream"
          />
        </div>

        {/* Quick Links */}
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-12">
          {quickLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              <Card
                variant="outlined"
                className="h-full hover:border-beo-terracotta/50 hover:shadow-md transition-all duration-200"
              >
                <CardContent>
                  <div
                    className={`inline-flex p-3 rounded-lg ${link.bgColor} mb-4`}
                  >
                    <link.icon className={`h-6 w-6 ${link.color}`} />
                  </div>
                  <h2 className="text-xl font-semibold text-foreground mb-2">
                    {link.title}
                  </h2>
                  <p className="text-text-secondary">{link.description}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Recent Episodes & Top Performers */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Recent Episodes */}
          <Card variant="outlined">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Recent Episodes</CardTitle>
                <Link href={ROUTES.episodes}>
                  <Button variant="ghost" size="sm">
                    View All
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {recentEpisodes && recentEpisodes.length > 0 ? (
                <div className="space-y-3">
                  {recentEpisodes.map((episode) => (
                    <Link
                      key={episode.id}
                      href={ROUTES.episode(episode.id!)}
                      className="block"
                    >
                      <div className="flex items-center justify-between p-3 rounded-lg hover:bg-beo-cream/20 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-beo-rose/10 rounded-lg">
                            <Tv className="h-4 w-4 text-beo-rose" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground line-clamp-1">
                              {episode.title}
                            </p>
                            <div className="flex items-center gap-2 text-sm text-text-muted">
                              <span>S{episode.season} E{episode.episode_number}</span>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {formatDate(episode.air_date!)}
                              </span>
                            </div>
                          </div>
                        </div>
                        {episode.winner_name ? (
                          <Badge variant="golden">
                            <Crown className="h-3 w-3 mr-1" />
                            {episode.winner_name}
                          </Badge>
                        ) : (
                          <Badge variant="cream">No Results</Badge>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-text-muted text-center py-8">
                  No episodes recorded yet.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Top Performers */}
          <Card variant="outlined">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Top Winners</CardTitle>
                <Link href={ROUTES.leaderboards}>
                  <Button variant="ghost" size="sm">
                    Full Leaderboard
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {topWinners && topWinners.length > 0 ? (
                <div className="space-y-3">
                  {topWinners.map((player, index) => (
                    <Link
                      key={player.id}
                      href={ROUTES.player(player.slug!)}
                      className="block"
                    >
                      <div className="flex items-center justify-between p-3 rounded-lg hover:bg-beo-cream/20 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className={`
                            w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold
                            ${index === 0 ? "bg-beo-golden text-white" : ""}
                            ${index === 1 ? "bg-gray-300 text-gray-700" : ""}
                            ${index === 2 ? "bg-amber-600 text-white" : ""}
                            ${index > 2 ? "bg-beo-cream text-text-secondary" : ""}
                          `}>
                            {index + 1}
                          </div>
                          <Avatar
                            src={player.image_url}
                            alt={player.name ?? "Player"}
                            size="sm"
                          />
                          <div>
                            <p className="font-medium text-foreground">
                              {player.name}
                            </p>
                            <p className="text-sm text-text-muted">
                              {player.total_appearances} appearance{player.total_appearances !== 1 ? "s" : ""}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-beo-terracotta">
                            {player.total_wins} win{player.total_wins !== 1 ? "s" : ""}
                          </p>
                          <p className="text-sm text-text-muted">
                            {player.win_percentage ?? 0}% rate
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-text-muted text-center py-8">
                  No player stats available yet.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        {activities.length > 0 && (
          <div className="mt-8">
            <RecentActivity activities={activities.slice(0, 6)} />
          </div>
        )}
      </Container>
    </div>
  );
}
