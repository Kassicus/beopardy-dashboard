import { notFound } from "next/navigation";
import { Container } from "@/components/layout/Container";
import { PageHeader } from "@/components/layout/PageHeader";
import { ResultsEntryForm } from "@/components/episodes/ResultsEntryForm";
import { createClient } from "@/lib/supabase/server";

interface ResultsPageProps {
  params: Promise<{ id: string }>;
}

export default async function EpisodeResultsPage({ params }: ResultsPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  // Fetch episode
  const { data: episode, error: episodeError } = await supabase
    .from("episodes")
    .select("*")
    .eq("id", id)
    .single();

  if (episodeError || !episode) {
    notFound();
  }

  // Fetch all players
  const { data: players } = await supabase
    .from("players")
    .select("*")
    .order("name");

  // Fetch existing results for this episode
  const { data: existingResults } = await supabase
    .from("episode_appearances")
    .select("*")
    .eq("episode_id", id)
    .order("placement");

  return (
    <div className="py-8">
      <Container size="lg">
        <PageHeader
          title="Record Results"
          description={`Enter results for "${episode.title}"`}
        />
        <ResultsEntryForm
          episode={episode}
          players={players ?? []}
          existingResults={existingResults ?? []}
        />
      </Container>
    </div>
  );
}
