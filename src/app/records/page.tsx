import { Metadata } from "next";
import Link from "next/link";
import { Trophy, Flame, Target, TrendingUp, Zap, Crown, Medal, Star } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { ROUTES } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";
import { formatNumber, formatPercentage, formatDate } from "@/lib/utils/formatters";

export const metadata: Metadata = {
  title: "Records",
  description: "Beopardy records, milestones, and fun statistics",
};

interface RecordCardProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  accentColor?: string;
}

function RecordCard({ title, icon, children, accentColor = "bg-beo-golden/20" }: RecordCardProps) {
  return (
    <Card variant="outlined">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className={`p-2 rounded-lg ${accentColor}`}>
            {icon}
          </div>
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

export default async function RecordsPage() {
  const supabase = await createClient();

  // Fetch all the data we need
  const [
    { data: allAppearances },
    { data: playerStats },
    { data: episodes },
  ] = await Promise.all([
    supabase
      .from("episode_appearances")
      .select(`
        *,
        players (*),
        episodes (*)
      `),
    supabase.from("player_career_stats").select("*"),
    supabase.from("episode_summary").select("*"),
  ]);

  if (!allAppearances || !playerStats || !episodes) {
    return (
      <div className="py-8">
        <Container>
          <PageHeader title="Records" description="Fun statistics and milestones" />
          <p className="text-text-muted text-center py-12">
            No data available yet.
          </p>
        </Container>
      </div>
    );
  }

  // Calculate records

  // 1. Highest single-game score
  const highestScore = [...allAppearances].sort(
    (a, b) => b.points_scored - a.points_scored
  )[0];

  // 2. Lowest winning score
  const winningScores = allAppearances.filter((a) => a.is_winner);
  const lowestWinningScore = [...winningScores].sort(
    (a, b) => a.points_scored - b.points_scored
  )[0];

  // 3. Best accuracy in a single game (min 10 questions)
  const accuracyScores = allAppearances
    .filter((a) => a.questions_seen >= 10)
    .map((a) => ({
      ...a,
      accuracy: (a.questions_correct / a.questions_seen) * 100,
    }))
    .sort((a, b) => b.accuracy - a.accuracy);
  const bestSingleGameAccuracy = accuracyScores[0];

  // 4. Most points by a non-winner (so close!)
  const nonWinners = allAppearances.filter((a) => !a.is_winner);
  const highestNonWinningScore = [...nonWinners].sort(
    (a, b) => b.points_scored - a.points_scored
  )[0];

  // 5. Most appearances without a win
  const appearancesWithoutWin = playerStats
    .filter((p) => (p.total_appearances ?? 0) > 0 && (p.total_wins ?? 0) === 0)
    .sort((a, b) => (b.total_appearances ?? 0) - (a.total_appearances ?? 0))[0];

  // 6. Best win rate (min 3 appearances)
  const bestWinRate = playerStats
    .filter((p) => (p.total_appearances ?? 0) >= 3)
    .sort((a, b) => (b.win_percentage ?? 0) - (a.win_percentage ?? 0))[0];

  // 7. Most total points
  const mostTotalPoints = playerStats
    .sort((a, b) => (b.total_points ?? 0) - (a.total_points ?? 0))[0];

  // 8. Most wins
  const mostWins = playerStats
    .sort((a, b) => (b.total_wins ?? 0) - (a.total_wins ?? 0))[0];

  // 9. Highest average points per game (min 3 appearances)
  const highestAvgPoints = playerStats
    .filter((p) => (p.total_appearances ?? 0) >= 3)
    .sort((a, b) => (b.avg_points_per_appearance ?? 0) - (a.avg_points_per_appearance ?? 0))[0];

  // 10. Most competitive game (smallest margin between 1st and 2nd)
  const gameMargins = episodes
    .filter((e) => (e.participant_count ?? 0) >= 2 && e.winner_name)
    .map((episode) => {
      const episodeResults = allAppearances
        .filter((a) => a.episode_id === episode.id)
        .sort((a, b) => b.points_scored - a.points_scored);
      if (episodeResults.length < 2) return null;
      return {
        episode,
        margin: episodeResults[0].points_scored - episodeResults[1].points_scored,
        first: episodeResults[0],
        second: episodeResults[1],
      };
    })
    .filter(Boolean)
    .sort((a, b) => a!.margin - b!.margin);
  const closestGame = gameMargins[0];

  // 11. Biggest blowout (largest margin)
  const biggestBlowout = gameMargins[gameMargins.length - 1];

  return (
    <div className="py-8">
      <Container>
        <PageHeader
          title="Records & Milestones"
          description="The best (and most interesting) moments in Beopardy history"
        />

        <div className="grid md:grid-cols-2 gap-6">
          {/* Highest Single Score */}
          {highestScore && (
            <RecordCard
              title="Highest Single Game Score"
              icon={<Trophy className="h-5 w-5 text-beo-golden-dark" />}
            >
              <Link href={ROUTES.player(highestScore.players.slug)} className="flex items-center gap-4">
                <Avatar
                  src={highestScore.players.image_url}
                  alt={highestScore.players.name}
                  size="lg"
                />
                <div>
                  <p className="font-bold text-2xl text-beo-terracotta">
                    {formatNumber(highestScore.points_scored)}
                  </p>
                  <p className="font-medium text-foreground">{highestScore.players.name}</p>
                  <p className="text-sm text-text-muted">
                    {highestScore.episodes.title} • {formatDate(highestScore.episodes.air_date)}
                  </p>
                </div>
              </Link>
            </RecordCard>
          )}

          {/* Most Wins */}
          {mostWins && (
            <RecordCard
              title="Most Career Wins"
              icon={<Crown className="h-5 w-5 text-beo-golden-dark" />}
            >
              <Link href={ROUTES.player(mostWins.slug!)} className="flex items-center gap-4">
                <Avatar
                  src={mostWins.image_url}
                  alt={mostWins.name ?? "Player"}
                  size="lg"
                />
                <div>
                  <p className="font-bold text-2xl text-beo-terracotta">
                    {mostWins.total_wins} wins
                  </p>
                  <p className="font-medium text-foreground">{mostWins.name}</p>
                  <p className="text-sm text-text-muted">
                    {formatPercentage(mostWins.win_percentage)} win rate in {mostWins.total_appearances} games
                  </p>
                </div>
              </Link>
            </RecordCard>
          )}

          {/* Best Win Rate */}
          {bestWinRate && (
            <RecordCard
              title="Best Win Rate (min. 3 games)"
              icon={<Star className="h-5 w-5 text-beo-golden-dark" />}
              accentColor="bg-beo-terracotta/20"
            >
              <Link href={ROUTES.player(bestWinRate.slug!)} className="flex items-center gap-4">
                <Avatar
                  src={bestWinRate.image_url}
                  alt={bestWinRate.name ?? "Player"}
                  size="lg"
                />
                <div>
                  <p className="font-bold text-2xl text-beo-terracotta">
                    {formatPercentage(bestWinRate.win_percentage)}
                  </p>
                  <p className="font-medium text-foreground">{bestWinRate.name}</p>
                  <p className="text-sm text-text-muted">
                    {bestWinRate.total_wins} wins in {bestWinRate.total_appearances} appearances
                  </p>
                </div>
              </Link>
            </RecordCard>
          )}

          {/* Highest Avg Points */}
          {highestAvgPoints && (
            <RecordCard
              title="Highest Avg Points (min. 3 games)"
              icon={<TrendingUp className="h-5 w-5 text-beo-terracotta" />}
              accentColor="bg-beo-terracotta/20"
            >
              <Link href={ROUTES.player(highestAvgPoints.slug!)} className="flex items-center gap-4">
                <Avatar
                  src={highestAvgPoints.image_url}
                  alt={highestAvgPoints.name ?? "Player"}
                  size="lg"
                />
                <div>
                  <p className="font-bold text-2xl text-beo-terracotta">
                    {formatNumber(Math.round(highestAvgPoints.avg_points_per_appearance ?? 0))} avg
                  </p>
                  <p className="font-medium text-foreground">{highestAvgPoints.name}</p>
                  <p className="text-sm text-text-muted">
                    {formatNumber(highestAvgPoints.total_points ?? 0)} total points
                  </p>
                </div>
              </Link>
            </RecordCard>
          )}

          {/* Best Single Game Answered % */}
          {bestSingleGameAccuracy && (
            <RecordCard
              title="Best Single Game Answered %"
              icon={<Target className="h-5 w-5 text-beo-rose" />}
              accentColor="bg-beo-rose/20"
            >
              <Link href={ROUTES.player(bestSingleGameAccuracy.players.slug)} className="flex items-center gap-4">
                <Avatar
                  src={bestSingleGameAccuracy.players.image_url}
                  alt={bestSingleGameAccuracy.players.name}
                  size="lg"
                />
                <div>
                  <p className="font-bold text-2xl text-beo-terracotta">
                    {formatPercentage(bestSingleGameAccuracy.accuracy, 0)}
                  </p>
                  <p className="font-medium text-foreground">{bestSingleGameAccuracy.players.name}</p>
                  <p className="text-sm text-text-muted">
                    {bestSingleGameAccuracy.questions_correct}/{bestSingleGameAccuracy.questions_seen} answered
                  </p>
                </div>
              </Link>
            </RecordCard>
          )}

          {/* Most Total Points */}
          {mostTotalPoints && (
            <RecordCard
              title="Most Career Points"
              icon={<Medal className="h-5 w-5 text-beo-golden-dark" />}
            >
              <Link href={ROUTES.player(mostTotalPoints.slug!)} className="flex items-center gap-4">
                <Avatar
                  src={mostTotalPoints.image_url}
                  alt={mostTotalPoints.name ?? "Player"}
                  size="lg"
                />
                <div>
                  <p className="font-bold text-2xl text-beo-terracotta">
                    {formatNumber(mostTotalPoints.total_points ?? 0)}
                  </p>
                  <p className="font-medium text-foreground">{mostTotalPoints.name}</p>
                  <p className="text-sm text-text-muted">
                    Across {mostTotalPoints.total_appearances} appearances
                  </p>
                </div>
              </Link>
            </RecordCard>
          )}

          {/* Closest Game */}
          {closestGame && (
            <RecordCard
              title="Closest Game Ever"
              icon={<Zap className="h-5 w-5 text-beo-rose" />}
              accentColor="bg-beo-rose/20"
            >
              <Link href={ROUTES.episode(closestGame.episode.id!)} className="block">
                <p className="font-medium text-foreground mb-2">
                  {closestGame.episode.title}
                </p>
                <div className="flex items-center justify-between bg-beo-cream/30 rounded-lg p-3">
                  <div className="text-center">
                    <p className="font-bold text-beo-terracotta">
                      {formatNumber(closestGame.first.points_scored)}
                    </p>
                    <p className="text-sm text-text-muted">{closestGame.first.players.name}</p>
                  </div>
                  <div className="text-center px-4">
                    <Badge variant="rose">
                      {formatNumber(closestGame.margin)} pts
                    </Badge>
                    <p className="text-xs text-text-muted mt-1">margin</p>
                  </div>
                  <div className="text-center">
                    <p className="font-bold">
                      {formatNumber(closestGame.second.points_scored)}
                    </p>
                    <p className="text-sm text-text-muted">{closestGame.second.players.name}</p>
                  </div>
                </div>
              </Link>
            </RecordCard>
          )}

          {/* Biggest Blowout */}
          {biggestBlowout && (
            <RecordCard
              title="Most Dominant Victory"
              icon={<Flame className="h-5 w-5 text-beo-terracotta" />}
              accentColor="bg-beo-terracotta/20"
            >
              <Link href={ROUTES.episode(biggestBlowout.episode.id!)} className="block">
                <p className="font-medium text-foreground mb-2">
                  {biggestBlowout.episode.title}
                </p>
                <div className="flex items-center justify-between bg-beo-cream/30 rounded-lg p-3">
                  <div className="text-center">
                    <p className="font-bold text-beo-terracotta">
                      {formatNumber(biggestBlowout.first.points_scored)}
                    </p>
                    <p className="text-sm text-text-muted">{biggestBlowout.first.players.name}</p>
                  </div>
                  <div className="text-center px-4">
                    <Badge variant="terracotta">
                      +{formatNumber(biggestBlowout.margin)}
                    </Badge>
                    <p className="text-xs text-text-muted mt-1">margin</p>
                  </div>
                  <div className="text-center">
                    <p className="font-bold">
                      {formatNumber(biggestBlowout.second.points_scored)}
                    </p>
                    <p className="text-sm text-text-muted">{biggestBlowout.second.players.name}</p>
                  </div>
                </div>
              </Link>
            </RecordCard>
          )}

          {/* So Close! */}
          {highestNonWinningScore && (
            <RecordCard
              title="So Close! (Highest Non-Winning Score)"
              icon={<Medal className="h-5 w-5 text-gray-400" />}
              accentColor="bg-gray-100"
            >
              <Link href={ROUTES.player(highestNonWinningScore.players.slug)} className="flex items-center gap-4">
                <Avatar
                  src={highestNonWinningScore.players.image_url}
                  alt={highestNonWinningScore.players.name}
                  size="lg"
                />
                <div>
                  <p className="font-bold text-2xl text-text-secondary">
                    {formatNumber(highestNonWinningScore.points_scored)}
                  </p>
                  <p className="font-medium text-foreground">{highestNonWinningScore.players.name}</p>
                  <p className="text-sm text-text-muted">
                    {highestNonWinningScore.episodes.title}
                  </p>
                </div>
              </Link>
            </RecordCard>
          )}

          {/* Lowest Winning Score */}
          {lowestWinningScore && (
            <RecordCard
              title="Lowest Winning Score"
              icon={<Trophy className="h-5 w-5 text-beo-cream-dark" />}
              accentColor="bg-beo-cream/50"
            >
              <Link href={ROUTES.player(lowestWinningScore.players.slug)} className="flex items-center gap-4">
                <Avatar
                  src={lowestWinningScore.players.image_url}
                  alt={lowestWinningScore.players.name}
                  size="lg"
                />
                <div>
                  <p className="font-bold text-2xl text-beo-golden-dark">
                    {formatNumber(lowestWinningScore.points_scored)}
                  </p>
                  <p className="font-medium text-foreground">{lowestWinningScore.players.name}</p>
                  <p className="text-sm text-text-muted">
                    Still got the W! • {lowestWinningScore.episodes.title}
                  </p>
                </div>
              </Link>
            </RecordCard>
          )}
        </div>
      </Container>
    </div>
  );
}
