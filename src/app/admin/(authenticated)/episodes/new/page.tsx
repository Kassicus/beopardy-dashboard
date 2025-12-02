import { Container } from "@/components/layout/Container";
import { PageHeader } from "@/components/layout/PageHeader";
import { EpisodeForm } from "@/components/episodes/EpisodeForm";

export default function NewEpisodePage() {
  return (
    <div className="py-8">
      <Container size="md">
        <PageHeader title="Add New Episode" />
        <EpisodeForm mode="create" />
      </Container>
    </div>
  );
}
