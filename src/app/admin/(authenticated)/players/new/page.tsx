import { Container } from "@/components/layout/Container";
import { PageHeader } from "@/components/layout/PageHeader";
import { PlayerForm } from "@/components/players/PlayerForm";

export default function NewPlayerPage() {
  return (
    <div className="py-8">
      <Container size="md">
        <PageHeader title="Add New Player" />
        <PlayerForm mode="create" />
      </Container>
    </div>
  );
}
