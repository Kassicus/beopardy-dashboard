import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/Table";
import { DeleteButton } from "@/components/shared/DeleteButton";
import { TvMinimalPlay, Pencil, ClipboardList, Tv, Trophy } from "lucide-react";
import { ROUTES } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils/formatters";

export default async function AdminEpisodesPage() {
  const supabase = await createClient();

  const { data: episodes, error } = await supabase
    .from("episode_summary")
    .select("*")
    .order("air_date", { ascending: false });

  if (error) {
    return (
      <div className="py-8">
        <Container>
          <PageHeader title="Manage Episodes">
            <Link href={ROUTES.admin.newEpisode}>
              <Button leftIcon={<TvMinimalPlay className="h-4 w-4" />}>
                Add Episode
              </Button>
            </Link>
          </PageHeader>
          <Card variant="elevated" className="text-center py-12">
            <CardContent>
              <p className="text-red-500">Error loading episodes: {error.message}</p>
            </CardContent>
          </Card>
        </Container>
      </div>
    );
  }

  return (
    <div className="py-8">
      <Container>
        <PageHeader title="Manage Episodes" description="Add episodes and record results">
          <Link href={ROUTES.admin.newEpisode}>
            <Button leftIcon={<TvMinimalPlay className="h-4 w-4" />}>
              Add Episode
            </Button>
          </Link>
        </PageHeader>

        {episodes && episodes.length > 0 ? (
          <Card variant="outlined" padding="none">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Episode</TableHead>
                  <TableHead>Air Date</TableHead>
                  <TableHead>Winner</TableHead>
                  <TableHead>Participants</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {episodes.map((episode) => (
                  <TableRow key={episode.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{episode.title}</div>
                        <div className="text-sm text-text-muted">
                          S{episode.season} E{episode.episode_number}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-text-secondary">
                      {episode.air_date ? formatDate(episode.air_date) : "—"}
                    </TableCell>
                    <TableCell>
                      {episode.winner_name ? (
                        <div className="flex items-center gap-1">
                          <Trophy className="h-4 w-4 text-beo-golden" />
                          <span>{episode.winner_name}</span>
                        </div>
                      ) : (
                        <Badge variant="cream">No results</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {episode.participant_count ? (
                        <Badge variant="default">{episode.participant_count}</Badge>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        <Link href={ROUTES.admin.episodeResults(episode.id!)}>
                          <Button variant="ghost" size="sm" title="Record Results">
                            <ClipboardList className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Link href={`/admin/episodes/${episode.id}/edit`}>
                          <Button variant="ghost" size="sm" title="Edit Episode">
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </Link>
                        <DeleteButton
                          table="episodes"
                          id={episode.id!}
                          itemName={episode.title!}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        ) : (
          <Card variant="elevated" className="text-center py-12">
            <CardContent>
              <Tv className="h-12 w-12 text-beo-rose mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-foreground mb-2">
                No Episodes Yet
              </h2>
              <p className="text-text-secondary max-w-md mx-auto mb-4">
                Get started by adding your first episode.
              </p>
              <Link href={ROUTES.admin.newEpisode}>
                <Button leftIcon={<TvMinimalPlay className="h-4 w-4" />}>
                  Add Episode
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </Container>
    </div>
  );
}
