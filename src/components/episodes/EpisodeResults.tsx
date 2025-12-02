import Link from "next/link";
import { Trophy, Target, ExternalLink, Crown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/Table";
import { ROUTES } from "@/lib/constants";
import { formatNumber, formatPercentage, formatOrdinal } from "@/lib/utils/formatters";
import type { Tables } from "@/types/database";

interface ResultWithPlayer extends Tables<"episode_appearances"> {
  players: Tables<"players">;
}

interface EpisodeResultsProps {
  results: ResultWithPlayer[];
}

export function EpisodeResults({ results }: EpisodeResultsProps) {
  if (results.length === 0) {
    return (
      <Card variant="outlined">
        <CardHeader>
          <CardTitle>Results</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-text-muted text-center py-8">
            No results have been recorded for this episode yet.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Sort by placement (winner first), then by points
  const sortedResults = [...results].sort((a, b) => {
    if (a.is_winner && !b.is_winner) return -1;
    if (!a.is_winner && b.is_winner) return 1;
    if (a.placement && b.placement) return a.placement - b.placement;
    return b.points_scored - a.points_scored;
  });

  return (
    <Card variant="outlined">
      <CardHeader>
        <CardTitle>Results ({results.length} participants)</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">Place</TableHead>
              <TableHead>Player</TableHead>
              <TableHead className="text-right">Points</TableHead>
              <TableHead className="text-right hidden sm:table-cell">Accuracy</TableHead>
              <TableHead className="text-center hidden md:table-cell">Final</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedResults.map((result, index) => {
              const accuracy = result.questions_seen > 0
                ? (result.questions_correct / result.questions_seen) * 100
                : 0;

              return (
                <TableRow key={result.id} isClickable>
                  <TableCell>
                    {result.is_winner ? (
                      <div className="flex items-center gap-1">
                        <div className="w-8 h-8 rounded-full bg-beo-golden flex items-center justify-center">
                          <Crown className="h-4 w-4 text-white" />
                        </div>
                      </div>
                    ) : (
                      <div className={`
                        w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                        ${index === 1 ? "bg-gray-200 text-gray-600" : ""}
                        ${index === 2 ? "bg-amber-100 text-amber-700" : ""}
                        ${index > 2 ? "bg-beo-cream/50 text-text-secondary" : ""}
                      `}>
                        {result.placement ?? index + 1}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <Link
                      href={ROUTES.player(result.players.slug)}
                      className="group flex items-center gap-3"
                    >
                      <Avatar
                        src={result.players.image_url}
                        alt={result.players.name}
                        size="sm"
                      />
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-foreground group-hover:text-beo-terracotta transition-colors">
                          {result.players.name}
                        </span>
                        <ExternalLink className="h-3 w-3 text-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </Link>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className={`font-mono font-bold ${result.is_winner ? "text-beo-terracotta" : ""}`}>
                      {formatNumber(result.points_scored)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right hidden sm:table-cell">
                    <div className="flex items-center justify-end gap-2">
                      <Target className="h-3.5 w-3.5 text-text-muted" />
                      <span className="font-medium">{formatPercentage(accuracy, 0)}</span>
                      <span className="text-text-muted text-xs">
                        ({result.questions_correct}/{result.questions_seen})
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center hidden md:table-cell">
                    {result.final_correct !== null ? (
                      <div className="flex flex-col items-center gap-1">
                        <Badge variant={result.final_correct ? "success" : "error"}>
                          {result.final_correct ? "Correct" : "Wrong"}
                        </Badge>
                        {result.final_wager !== null && result.final_wager > 0 && (
                          <span className="text-xs text-text-muted">
                            Wager: {formatNumber(result.final_wager)}
                          </span>
                        )}
                      </div>
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
