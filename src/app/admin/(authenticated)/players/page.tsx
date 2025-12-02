import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/Table";
import { DeleteButton } from "@/components/shared/DeleteButton";
import { UserPlus, Pencil, Users } from "lucide-react";
import { ROUTES } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils/formatters";

export default async function AdminPlayersPage() {
  const supabase = await createClient();

  const { data: players, error } = await supabase
    .from("players")
    .select("*")
    .order("name");

  if (error) {
    return (
      <div className="py-8">
        <Container>
          <PageHeader title="Manage Players">
            <Link href={ROUTES.admin.newPlayer}>
              <Button leftIcon={<UserPlus className="h-4 w-4" />}>
                Add Player
              </Button>
            </Link>
          </PageHeader>
          <Card variant="elevated" className="text-center py-12">
            <CardContent>
              <p className="text-red-500">Error loading players: {error.message}</p>
            </CardContent>
          </Card>
        </Container>
      </div>
    );
  }

  return (
    <div className="py-8">
      <Container>
        <PageHeader title="Manage Players" description="Add, edit, or remove players">
          <Link href={ROUTES.admin.newPlayer}>
            <Button leftIcon={<UserPlus className="h-4 w-4" />}>
              Add Player
            </Button>
          </Link>
        </PageHeader>

        {players && players.length > 0 ? (
          <Card variant="outlined" padding="none">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Player</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {players.map((player) => (
                  <TableRow key={player.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar
                          src={player.image_url}
                          alt={player.name}
                          size="sm"
                        />
                        <span className="font-medium">{player.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <code className="text-sm text-text-muted bg-beo-cream/30 px-2 py-0.5 rounded">
                        {player.slug}
                      </code>
                    </TableCell>
                    <TableCell className="text-text-secondary">
                      {player.created_at ? formatDate(player.created_at) : "—"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/admin/players/${player.id}/edit`}>
                          <Button variant="ghost" size="sm">
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </Link>
                        <DeleteButton
                          table="players"
                          id={player.id}
                          itemName={player.name}
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
              <Users className="h-12 w-12 text-beo-terracotta mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-foreground mb-2">
                No Players Yet
              </h2>
              <p className="text-text-secondary max-w-md mx-auto mb-4">
                Get started by adding your first player.
              </p>
              <Link href={ROUTES.admin.newPlayer}>
                <Button leftIcon={<UserPlus className="h-4 w-4" />}>
                  Add Player
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </Container>
    </div>
  );
}
