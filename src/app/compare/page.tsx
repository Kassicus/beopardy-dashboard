import { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { PageHeader } from "@/components/layout/PageHeader";
import { PlayerComparison } from "@/components/stats/PlayerComparison";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Compare Players",
  description: "Compare head-to-head records and statistics between Beopardy players",
};

export default async function ComparePage() {
  const supabase = await createClient();

  // Fetch all players with stats
  const { data: players } = await supabase
    .from("player_career_stats")
    .select("*");

  // Fetch all appearances with episode details for head-to-head analysis
  const { data: appearances } = await supabase
    .from("episode_appearances")
    .select(`
      episode_id,
      player_id,
      points_scored,
      is_winner,
      questions_correct,
      questions_seen,
      episodes (
        title,
        air_date
      )
    `);

  // Transform appearances data
  const transformedAppearances = (appearances ?? []).map((a) => ({
    episode_id: a.episode_id,
    player_id: a.player_id,
    points_scored: a.points_scored,
    is_winner: a.is_winner,
    questions_correct: a.questions_correct,
    questions_seen: a.questions_seen,
    episode_title: (a.episodes as { title: string; air_date: string })?.title ?? "",
    episode_date: (a.episodes as { title: string; air_date: string })?.air_date ?? "",
  }));

  return (
    <div className="py-8">
      <Container>
        <PageHeader
          title="Compare Players"
          description="Head-to-head matchups and career statistics comparison"
        />
        <PlayerComparison
          players={players ?? []}
          appearances={transformedAppearances}
        />
      </Container>
    </div>
  );
}
