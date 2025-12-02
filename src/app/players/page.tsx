import { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { PageHeader } from "@/components/layout/PageHeader";
import { PlayerList } from "@/components/players/PlayerList";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Players",
  description: "View all Beopardy contestants and their career statistics",
};

// Revalidate every 30 minutes
export const revalidate = 1800;

export default async function PlayersPage() {
  const supabase = await createClient();

  const { data: players } = await supabase
    .from("player_career_stats")
    .select("*")
    .order("name");

  return (
    <div className="py-8">
      <Container>
        <PageHeader
          title="Players"
          description="All Beopardy contestants and their career statistics"
        />
        <PlayerList players={players ?? []} />
      </Container>
    </div>
  );
}
