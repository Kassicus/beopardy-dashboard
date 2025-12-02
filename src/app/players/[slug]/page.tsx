import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { Card, CardContent } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { PlayerStats } from "@/components/players/PlayerStats";
import { PlayerAppearanceHistory } from "@/components/players/PlayerAppearanceHistory";
import { PerformanceTrend } from "@/components/stats/PerformanceTrend";
import { StructuredData, generatePersonSchema, generateBreadcrumbSchema } from "@/components/seo/StructuredData";
import { ROUTES } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils/formatters";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://beopardy-stats.vercel.app";

interface PlayerPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: PlayerPageProps): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: player } = await supabase
    .from("player_career_stats")
    .select("name, image_url, total_wins, total_appearances, win_percentage")
    .eq("slug", slug)
    .single();

  if (!player) {
    return { title: "Player Not Found" };
  }

  const description = `${player.name} has ${player.total_wins ?? 0} wins in ${player.total_appearances ?? 0} Beopardy appearances (${player.win_percentage ?? 0}% win rate). View their full career statistics.`;

  return {
    title: player.name,
    description,
    openGraph: {
      title: `${player.name} | Beopardy Stats`,
      description,
      type: "profile",
      ...(player.image_url && { images: [{ url: player.image_url, alt: player.name ?? "Player" }] }),
    },
    twitter: {
      card: player.image_url ? "summary_large_image" : "summary",
      title: `${player.name} | Beopardy Stats`,
      description,
      ...(player.image_url && { images: [player.image_url] }),
    },
  };
}

export default async function PlayerPage({ params }: PlayerPageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  // Fetch player career stats
  const { data: playerStats, error } = await supabase
    .from("player_career_stats")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error || !playerStats) {
    notFound();
  }

  // Fetch appearance history with episode details
  const { data: appearances } = await supabase
    .from("episode_appearances")
    .select(`
      *,
      episodes (*)
    `)
    .eq("player_id", playerStats.id!)
    .order("created_at", { ascending: false });

  // Structured data for SEO
  const personSchema = generatePersonSchema({
    name: playerStats.name ?? "",
    slug: playerStats.slug ?? "",
    image_url: playerStats.image_url,
    total_wins: playerStats.total_wins,
    total_appearances: playerStats.total_appearances,
  }, BASE_URL);

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: BASE_URL },
    { name: "Players", url: `${BASE_URL}/players` },
    { name: playerStats.name ?? "Player", url: `${BASE_URL}/players/${playerStats.slug}` },
  ]);

  return (
    <>
      <StructuredData data={personSchema} />
      <StructuredData data={breadcrumbSchema} />
      <div className="py-8">
        <Container>
          {/* Back Link */}
        <Link href={ROUTES.players} className="inline-block mb-6">
          <Button variant="ghost" size="sm" leftIcon={<ArrowLeft className="h-4 w-4" />}>
            Back to Players
          </Button>
        </Link>

        {/* Player Header */}
        <Card variant="elevated" className="mb-8">
          <CardContent className="py-8">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              <Avatar
                src={playerStats.image_url}
                alt={playerStats.name ?? "Player"}
                size="xl"
                className="w-24 h-24 sm:w-32 sm:h-32 text-2xl"
              />
              <div className="text-center sm:text-left flex-1">
                <h1 className="text-3xl sm:text-4xl font-bold font-display text-foreground mb-2">
                  {playerStats.name}
                </h1>
                {playerStats.first_appearance && (
                  <div className="flex items-center justify-center sm:justify-start gap-2 text-text-secondary">
                    <Calendar className="h-4 w-4" />
                    <span>
                      First appeared {formatDate(playerStats.first_appearance)}
                    </span>
                  </div>
                )}
                {playerStats.last_appearance && playerStats.last_appearance !== playerStats.first_appearance && (
                  <p className="text-sm text-text-muted mt-1">
                    Last appeared {formatDate(playerStats.last_appearance)}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-4">Career Statistics</h2>
          <PlayerStats stats={playerStats} />
        </div>

        {/* Performance Trend Chart */}
        {appearances && appearances.length >= 2 && (
          <div className="mb-8">
            <PerformanceTrend
              appearances={appearances.map((a) => ({
                episode_date: a.episodes.air_date,
                episode_title: a.episodes.title,
                points_scored: a.points_scored,
                questions_correct: a.questions_correct,
                questions_seen: a.questions_seen,
                is_winner: a.is_winner,
              }))}
              playerName={playerStats.name ?? "Player"}
            />
          </div>
        )}

        {/* Appearance History */}
        <PlayerAppearanceHistory appearances={appearances ?? []} />
      </Container>
    </div>
    </>
  );
}

// Revalidate every hour
export const revalidate = 3600;
