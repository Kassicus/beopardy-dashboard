import { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { PageHeader } from "@/components/layout/PageHeader";
import { EpisodeList } from "@/components/episodes/EpisodeList";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Episodes",
  description: "Browse all Beopardy episodes and their results",
};

// Revalidate every 30 minutes
export const revalidate = 1800;

export default async function EpisodesPage() {
  const supabase = await createClient();

  const { data: episodes } = await supabase
    .from("episode_summary")
    .select("*")
    .order("air_date", { ascending: false });

  return (
    <div className="py-8">
      <Container>
        <PageHeader
          title="Episodes"
          description="Browse all Beopardy episodes and their results"
        />
        <EpisodeList episodes={episodes ?? []} />
      </Container>
    </div>
  );
}
