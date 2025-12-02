import { notFound } from "next/navigation";
import { Container } from "@/components/layout/Container";
import { PageHeader } from "@/components/layout/PageHeader";
import { EpisodeForm } from "@/components/episodes/EpisodeForm";
import { createClient } from "@/lib/supabase/server";

interface EditEpisodePageProps {
  params: Promise<{ id: string }>;
}

export default async function EditEpisodePage({ params }: EditEpisodePageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: episode, error } = await supabase
    .from("episodes")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !episode) {
    notFound();
  }

  return (
    <div className="py-8">
      <Container size="md">
        <PageHeader title={`Edit Episode`} />
        <EpisodeForm episode={episode} mode="edit" />
      </Container>
    </div>
  );
}
