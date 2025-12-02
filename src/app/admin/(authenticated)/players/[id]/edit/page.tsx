import { notFound } from "next/navigation";
import { Container } from "@/components/layout/Container";
import { PageHeader } from "@/components/layout/PageHeader";
import { PlayerForm } from "@/components/players/PlayerForm";
import { createClient } from "@/lib/supabase/server";

interface EditPlayerPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditPlayerPage({ params }: EditPlayerPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: player, error } = await supabase
    .from("players")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !player) {
    notFound();
  }

  return (
    <div className="py-8">
      <Container size="md">
        <PageHeader title={`Edit ${player.name}`} />
        <PlayerForm player={player} mode="edit" />
      </Container>
    </div>
  );
}
