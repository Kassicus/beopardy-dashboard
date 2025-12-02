import { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { PageHeader } from "@/components/layout/PageHeader";
import { Leaderboard } from "@/components/stats/Leaderboard";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Leaderboards",
  description: "Beopardy player rankings and statistics leaderboards",
};

// Revalidate every 30 minutes
export const revalidate = 1800;

export default async function LeaderboardsPage() {
  const supabase = await createClient();

  const { data: players } = await supabase
    .from("player_career_stats")
    .select("*");

  return (
    <div className="py-8">
      <Container>
        <PageHeader
          title="Leaderboards"
          description="See who's on top across various statistics"
        />
        <Leaderboard players={players ?? []} />
      </Container>
    </div>
  );
}
