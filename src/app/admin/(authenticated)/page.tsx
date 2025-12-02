import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/StatCard";
import { Button } from "@/components/ui/Button";
import { UserPlus, TvMinimalPlay, Users, Tv, Trophy } from "lucide-react";
import { ROUTES } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  // Fetch counts
  const [playersResult, episodesResult, appearancesResult] = await Promise.all([
    supabase.from("players").select("id", { count: "exact", head: true }),
    supabase.from("episodes").select("id", { count: "exact", head: true }),
    supabase.from("episode_appearances").select("id", { count: "exact", head: true }),
  ]);

  const playerCount = playersResult.count ?? 0;
  const episodeCount = episodesResult.count ?? 0;
  const appearanceCount = appearancesResult.count ?? 0;

  // Get recent episodes needing results
  const { data: episodesNeedingResults } = await supabase
    .from("episode_summary")
    .select("*")
    .is("winner_name", null)
    .order("air_date", { ascending: false })
    .limit(5);

  return (
    <div className="py-8">
      <Container>
        <PageHeader
          title="Admin Dashboard"
          description="Manage players, episodes, and results"
        />

        {/* Stats Overview */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
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
            icon={<Trophy className="h-5 w-5" />}
            accentColor="golden"
          />
          <StatCard
            label="Needs Results"
            value={episodesNeedingResults?.length ?? 0}
            icon={<TvMinimalPlay className="h-5 w-5" />}
            accentColor="cream"
          />
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <Card variant="outlined">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href={ROUTES.admin.newPlayer} className="block">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  leftIcon={<UserPlus className="h-4 w-4" />}
                >
                  Add New Player
                </Button>
              </Link>
              <Link href={ROUTES.admin.newEpisode} className="block">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  leftIcon={<TvMinimalPlay className="h-4 w-4" />}
                >
                  Add New Episode
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Manage Players */}
          <Card variant="outlined">
            <CardHeader>
              <CardTitle>Players</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-text-secondary mb-4">
                {playerCount} registered player{playerCount !== 1 ? "s" : ""}
              </p>
              <Link href={ROUTES.admin.players}>
                <Button variant="secondary" size="sm">
                  Manage Players
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Manage Episodes */}
          <Card variant="outlined">
            <CardHeader>
              <CardTitle>Episodes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-text-secondary mb-4">
                {episodeCount} episode{episodeCount !== 1 ? "s" : ""} recorded
              </p>
              <Link href={ROUTES.admin.episodes}>
                <Button variant="secondary" size="sm">
                  Manage Episodes
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Episodes Needing Results */}
        {episodesNeedingResults && episodesNeedingResults.length > 0 && (
          <div className="mt-8">
            <Card variant="outlined">
              <CardHeader>
                <CardTitle>Episodes Needing Results</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {episodesNeedingResults.map((episode) => (
                    <div
                      key={episode.id}
                      className="flex items-center justify-between p-3 bg-beo-cream/20 rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{episode.title}</p>
                        <p className="text-sm text-text-muted">
                          S{episode.season} E{episode.episode_number} • {episode.air_date}
                        </p>
                      </div>
                      <Link href={ROUTES.admin.episodeResults(episode.id!)}>
                        <Button size="sm">Record Results</Button>
                      </Link>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </Container>
    </div>
  );
}
