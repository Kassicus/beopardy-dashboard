import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar, Users, Trophy, ExternalLink, Play } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { StatCard } from "@/components/ui/StatCard";
import { EpisodeResults } from "@/components/episodes/EpisodeResults";
import { StructuredData, generateEpisodeSchema, generateBreadcrumbSchema } from "@/components/seo/StructuredData";
import { ROUTES } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";
import { formatDate, formatNumber } from "@/lib/utils/formatters";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://beopardy-stats.vercel.app";

interface EpisodePageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: EpisodePageProps): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();

  const { data: episode } = await supabase
    .from("episode_summary")
    .select("title, season, episode_number, air_date, thumbnail_url, winner_name, participant_count")
    .eq("id", id)
    .single();

  if (!episode) {
    return { title: "Episode Not Found" };
  }

  const title = `S${episode.season} E${episode.episode_number}: ${episode.title}`;
  const winnerText = episode.winner_name ? `Winner: ${episode.winner_name}. ` : "";
  const participantText = episode.participant_count ? `${episode.participant_count} contestants competed.` : "";
  const description = `${winnerText}${participantText} View results and statistics for this Beopardy episode.`;

  return {
    title,
    description,
    openGraph: {
      title: `${title} | Beopardy Stats`,
      description,
      type: "article",
      ...(episode.air_date && { publishedTime: episode.air_date }),
      ...(episode.thumbnail_url && { images: [{ url: episode.thumbnail_url, alt: episode.title ?? "Episode" }] }),
    },
    twitter: {
      card: episode.thumbnail_url ? "summary_large_image" : "summary",
      title: `${title} | Beopardy Stats`,
      description,
      ...(episode.thumbnail_url && { images: [episode.thumbnail_url] }),
    },
  };
}

export default async function EpisodePage({ params }: EpisodePageProps) {
  const { id } = await params;
  const supabase = await createClient();

  // Fetch episode details
  const { data: episode, error } = await supabase
    .from("episodes")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !episode) {
    notFound();
  }

  // Fetch results with player details
  const { data: results } = await supabase
    .from("episode_appearances")
    .select(`
      *,
      players (*)
    `)
    .eq("episode_id", id)
    .order("points_scored", { ascending: false });

  // Calculate episode stats
  const participantCount = results?.length ?? 0;
  const winner = results?.find((r) => r.is_winner);
  const highestScore = results?.[0]?.points_scored ?? 0;
  const totalPoints = results?.reduce((sum, r) => sum + r.points_scored, 0) ?? 0;
  const avgAccuracy = participantCount > 0
    ? (results?.reduce((sum, r) => {
        if (r.questions_seen > 0) {
          return sum + (r.questions_correct / r.questions_seen);
        }
        return sum;
      }, 0) ?? 0) / participantCount * 100
    : 0;

  // Structured data for SEO
  const episodeSchema = generateEpisodeSchema({
    id: episode.id,
    title: episode.title,
    air_date: episode.air_date,
    season: episode.season ?? 1,
    episode_number: episode.episode_number ?? 1,
    description: episode.description,
    thumbnail_url: episode.thumbnail_url,
    youtube_url: episode.youtube_url,
  }, BASE_URL);

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: BASE_URL },
    { name: "Episodes", url: `${BASE_URL}/episodes` },
    { name: episode.title, url: `${BASE_URL}/episodes/${episode.id}` },
  ]);

  return (
    <>
      <StructuredData data={episodeSchema} />
      <StructuredData data={breadcrumbSchema} />
      <div className="py-8">
        <Container>
          {/* Back Link */}
          <Link href={ROUTES.episodes} className="inline-block mb-6">
            <Button variant="ghost" size="sm" leftIcon={<ArrowLeft className="h-4 w-4" />}>
              Back to Episodes
            </Button>
          </Link>

          {/* Episode Header */}
          <Card variant="elevated" className="mb-8">
            <CardContent className="py-8">
              <div className="flex flex-col lg:flex-row gap-6">
                {/* Left side: Episode info */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="rose">
                      Season {episode.season} Episode {episode.episode_number}
                    </Badge>
                    {winner && (
                      <Badge variant="golden" className="gap-1">
                        <Trophy className="h-3 w-3" />
                        {winner.players.name} wins!
                      </Badge>
                    )}
                  </div>
                  <h1 className="text-3xl sm:text-4xl font-bold font-display text-foreground mb-3">
                    {episode.title}
                  </h1>
                  <div className="flex items-center gap-4 text-text-secondary mb-4">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {formatDate(episode.air_date)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {participantCount} participant{participantCount !== 1 ? "s" : ""}
                    </span>
                  </div>
                  {episode.description && (
                    <p className="text-text-secondary">{episode.description}</p>
                  )}

                  {/* YouTube Link */}
                  {episode.youtube_url && (
                    <div className="mt-4">
                      <a
                        href={episode.youtube_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                      >
                        <Play className="h-4 w-4" />
                        Watch on YouTube
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  )}
                </div>

                {/* Right side: Thumbnail */}
                {episode.thumbnail_url && (
                  <div className="lg:w-80 shrink-0">
                    <div className="relative aspect-video rounded-lg overflow-hidden bg-beo-cream/30">
                      <img
                        src={episode.thumbnail_url}
                        alt={episode.title}
                        className="object-cover w-full h-full"
                      />
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Episode Stats */}
          {participantCount > 0 && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <StatCard
                label="Highest Score"
                value={formatNumber(highestScore)}
                icon={<Trophy className="h-5 w-5" />}
                accentColor="golden"
              />
              <StatCard
                label="Total Points"
                value={formatNumber(totalPoints)}
                icon={<Users className="h-5 w-5" />}
                accentColor="terracotta"
              />
              <StatCard
                label="Participants"
                value={participantCount}
                icon={<Users className="h-5 w-5" />}
                accentColor="rose"
              />
              <StatCard
                label="Avg Accuracy"
                value={`${avgAccuracy.toFixed(0)}%`}
                icon={<Trophy className="h-5 w-5" />}
                accentColor="cream"
              />
            </div>
          )}

          {/* Results Table */}
          <EpisodeResults results={results ?? []} />
        </Container>
      </div>
    </>
  );
}

// Revalidate every hour
export const revalidate = 3600;
