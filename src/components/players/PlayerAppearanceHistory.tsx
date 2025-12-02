import Link from "next/link";
import { Trophy, Calendar, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/Table";
import { ROUTES } from "@/lib/constants";
import { formatDate, formatNumber, formatPercentage, formatOrdinal } from "@/lib/utils/formatters";
import type { Tables } from "@/types/database";

interface AppearanceWithEpisode extends Tables<"episode_appearances"> {
  episodes: Tables<"episodes">;
}

interface PlayerAppearanceHistoryProps {
  appearances: AppearanceWithEpisode[];
}

export function PlayerAppearanceHistory({ appearances }: PlayerAppearanceHistoryProps) {
  if (appearances.length === 0) {
    return (
      <Card variant="outlined">
        <CardHeader>
          <CardTitle>Appearance History</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-text-muted text-center py-8">
            No game appearances recorded yet.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Sort by air date descending (most recent first)
  const sortedAppearances = [...appearances].sort((a, b) => {
    return new Date(b.episodes.air_date).getTime() - new Date(a.episodes.air_date).getTime();
  });

  return (
    <Card variant="outlined">
      <CardHeader>
        <CardTitle>Appearance History ({appearances.length})</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Episode</TableHead>
              <TableHead className="hidden sm:table-cell">Date</TableHead>
              <TableHead className="text-center">Place</TableHead>
              <TableHead className="text-right">Points</TableHead>
              <TableHead className="text-right hidden md:table-cell">Accuracy</TableHead>
              <TableHead className="text-center hidden lg:table-cell">Final</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedAppearances.map((appearance) => {
              const accuracy = appearance.questions_seen > 0
                ? (appearance.questions_correct / appearance.questions_seen) * 100
                : 0;

              return (
                <TableRow key={appearance.id} isClickable>
                  <TableCell>
                    <Link
                      href={ROUTES.episode(appearance.episode_id)}
                      className="group"
                    >
                      <div className="flex items-center gap-2">
                        <div>
                          <p className="font-medium text-foreground group-hover:text-beo-terracotta transition-colors line-clamp-1">
                            {appearance.episodes.title}
                          </p>
                          <p className="text-xs text-text-muted sm:hidden">
                            {formatDate(appearance.episodes.air_date)}
                          </p>
                        </div>
                        <ExternalLink className="h-3 w-3 text-text-muted opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                      </div>
                    </Link>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <div className="flex items-center gap-1 text-text-secondary">
                      <Calendar className="h-3.5 w-3.5" />
                      {formatDate(appearance.episodes.air_date)}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    {appearance.is_winner ? (
                      <Badge variant="golden" className="gap-1">
                        <Trophy className="h-3 w-3" />
                        1st
                      </Badge>
                    ) : appearance.placement ? (
                      <Badge variant="cream">
                        {formatOrdinal(appearance.placement)}
                      </Badge>
                    ) : (
                      <span className="text-text-muted">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {formatNumber(appearance.points_scored)}
                  </TableCell>
                  <TableCell className="text-right hidden md:table-cell">
                    <div className="text-sm">
                      <span className="font-medium">{formatPercentage(accuracy, 0)}</span>
                      <span className="text-text-muted ml-1">
                        ({appearance.questions_correct}/{appearance.questions_seen})
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center hidden lg:table-cell">
                    {appearance.final_correct !== null ? (
                      <Badge variant={appearance.final_correct ? "success" : "error"}>
                        {appearance.final_correct ? "Correct" : "Wrong"}
                      </Badge>
                    ) : (
                      <span className="text-text-muted">—</span>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
