import Link from "next/link";
import { Trophy, Target, ExternalLink, Crown, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
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
import { formatNumber, formatPercentage } from "@/lib/utils/formatters";
import type { Tables } from "@/types/database";

interface ResultWithPlayer extends Tables<"episode_appearances"> {
  players: Tables<"players">;
}

interface EpisodeResultsProps {
  results: ResultWithPlayer[];
  finalBeopardyWinnerId?: string | null;
}

export function EpisodeResults({ results, finalBeopardyWinnerId }: EpisodeResultsProps) {
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

  const hasFinalBeopardy = !!finalBeopardyWinnerId;

  return (
    <Card variant="outlined">
      <CardHeader>
        <CardTitle>Results ({results.length} participants)</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-14 text-center">Place</TableHead>
              <TableHead>Player</TableHead>
              <TableHead className="w-24 text-right">Points</TableHead>
              <TableHead className="w-40 text-right hidden sm:table-cell">Correct</TableHead>
              {hasFinalBeopardy && (
                <TableHead className="w-24 text-center hidden md:table-cell">Final Beo</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedResults.map((result, index) => {
              const accuracy = result.questions_seen > 0
                ? (result.questions_correct / result.questions_seen) * 100
                : 0;
              const isFinalBeopardyWinner = finalBeopardyWinnerId === result.player_id;

              return (
                <TableRow key={result.id} isClickable>
                  <TableCell className="text-center">
                    {result.is_winner ? (
                      <div className="flex items-center justify-center">
                        <div className="w-8 h-8 rounded-full bg-beo-golden flex items-center justify-center">
                          <Crown className="h-4 w-4 text-white" />
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center">
                        <div className={`
                          w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                          ${index === 1 ? "bg-gray-200 text-gray-600" : ""}
                          ${index === 2 ? "bg-amber-100 text-amber-700" : ""}
                          ${index > 2 ? "bg-beo-cream/50 text-text-secondary" : ""}
                        `}>
                          {result.placement ?? index + 1}
                        </div>
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
                      <span className="font-medium text-foreground group-hover:text-beo-terracotta transition-colors">
                        {result.players.name}
                      </span>
                      <ExternalLink className="h-3 w-3 text-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    <span className={`font-mono font-bold ${result.is_winner ? "text-beo-terracotta" : ""}`}>
                      {formatNumber(result.points_scored)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right hidden sm:table-cell">
                    <div className="flex items-center justify-end gap-1.5">
                      <span className="font-medium tabular-nums">
                        {result.questions_correct}/{result.questions_seen}
                      </span>
                      <span className="text-text-muted text-xs tabular-nums">
                        ({formatPercentage(accuracy, 0)})
                      </span>
                    </div>
                  </TableCell>
                  {hasFinalBeopardy && (
                    <TableCell className="text-center hidden md:table-cell">
                      {isFinalBeopardyWinner ? (
                        <div className="flex items-center justify-center">
                          <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-beo-golden/20 text-beo-golden">
                            <Sparkles className="h-3.5 w-3.5" />
                            <span className="text-xs font-semibold">Winner</span>
                          </div>
                        </div>
                      ) : (
                        <span className="text-text-muted">—</span>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
