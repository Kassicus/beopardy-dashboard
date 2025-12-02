import Link from "next/link";
import { Trophy, Target, ExternalLink, Crown, Sparkles, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
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
import { formatNumber, formatPercentage } from "@/lib/utils/formatters";
import type { Tables } from "@/types/database";

interface ResultWithPlayer extends Tables<"episode_appearances"> {
  players: Tables<"players">;
}

interface TeamWithMembers extends Tables<"episode_teams"> {
  members: ResultWithPlayer[];
}

interface EpisodeResultsProps {
  results: ResultWithPlayer[];
  finalBeopardyWinnerId?: string | null;
  episodeType?: "solo" | "team";
  teams?: TeamWithMembers[];
}

export function EpisodeResults({
  results,
  finalBeopardyWinnerId,
  episodeType = "solo",
  teams = [],
}: EpisodeResultsProps) {
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

  const hasFinalBeopardy = !!finalBeopardyWinnerId;

  // Team episode display
  if (episodeType === "team" && teams.length > 0) {
    // Sort teams by winner status, then by placement/points
    const sortedTeams = [...teams].sort((a, b) => {
      if (a.is_winner && !b.is_winner) return -1;
      if (!a.is_winner && b.is_winner) return 1;
      if (a.placement && b.placement) return a.placement - b.placement;
      return b.total_points - a.total_points;
    });

    return (
      <Card variant="outlined">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Team Results ({teams.length} teams, {results.length} participants)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {sortedTeams.map((team, teamIndex) => {
            // Sort members by points
            const sortedMembers = [...team.members].sort(
              (a, b) => b.points_scored - a.points_scored
            );

            return (
              <div key={team.id} className="relative">
                {/* Team color indicator */}
                {team.team_color && (
                  <div
                    className="absolute left-0 top-0 w-1 h-full rounded-l-lg"
                    style={{ backgroundColor: team.team_color }}
                  />
                )}

                <div
                  className={`
                    border rounded-lg overflow-hidden
                    ${team.is_winner ? "ring-2 ring-beo-golden border-beo-golden/50" : "border-border"}
                  `}
                >
                  {/* Team Header */}
                  <div
                    className={`
                      px-4 py-3 flex items-center justify-between
                      ${team.is_winner ? "bg-beo-golden/10" : "bg-beo-cream/20"}
                    `}
                  >
                    <div className="flex items-center gap-3">
                      {team.is_winner ? (
                        <div className="w-8 h-8 rounded-full bg-beo-golden flex items-center justify-center">
                          <Crown className="h-4 w-4 text-white" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-beo-cream/50 flex items-center justify-center text-sm font-bold text-text-secondary">
                          {team.placement ?? teamIndex + 1}
                        </div>
                      )}
                      <div>
                        <h3 className="font-semibold text-foreground">
                          {team.team_name}
                        </h3>
                        <p className="text-sm text-text-muted">
                          {team.members.length} member{team.members.length !== 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-lg font-bold tabular-nums ${team.is_winner ? "text-beo-golden" : ""}`}>
                        {formatNumber(team.total_points)}
                      </p>
                      <p className="text-xs text-text-muted">total points</p>
                    </div>
                  </div>

                  {/* Team Final Beopardy */}
                  {team.final_correct !== null && (
                    <div className="flex items-center justify-between px-4 py-2 bg-surface/50 border-t border-border">
                      <span className="text-sm font-medium text-text-secondary">Final Beopardy</span>
                      <div className="flex items-center gap-3">
                        <Badge variant={team.final_correct ? "success" : "error"}>
                          {team.final_correct ? "Correct" : "Wrong"}
                        </Badge>
                        {team.final_wager != null && team.final_wager > 0 && (
                          <span className={`text-sm font-bold ${team.final_correct ? "text-green-600" : "text-red-600"}`}>
                            {team.final_correct ? "+" : "-"}{formatNumber(team.final_wager)}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Team Members */}
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Player</TableHead>
                        <TableHead className="w-24 text-right">Points</TableHead>
                        <TableHead className="w-40 text-right hidden sm:table-cell">Answered</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sortedMembers.map((member) => {
                        const accuracy = member.questions_seen > 0
                          ? (member.questions_correct / member.questions_seen) * 100
                          : 0;

                        return (
                          <TableRow key={member.id} isClickable>
                            <TableCell>
                              <Link
                                href={ROUTES.player(member.players.slug)}
                                className="group flex items-center gap-3"
                              >
                                <Avatar
                                  src={member.players.image_url}
                                  alt={member.players.name}
                                  size="sm"
                                />
                                <span className="font-medium text-foreground group-hover:text-beo-terracotta transition-colors">
                                  {member.players.name}
                                </span>
                                <ExternalLink className="h-3 w-3 text-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                              </Link>
                            </TableCell>
                            <TableCell className="text-right tabular-nums">
                              <span className="font-mono font-medium">
                                {formatNumber(member.points_scored)}
                              </span>
                            </TableCell>
                            <TableCell className="text-right hidden sm:table-cell">
                              <div className="flex items-center justify-end gap-1.5">
                                <span className="font-medium tabular-nums">
                                  {member.questions_correct}/{member.questions_seen}
                                </span>
                                <span className="text-text-muted text-xs tabular-nums">
                                  ({formatPercentage(accuracy, 0)})
                                </span>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    );
  }

  // Solo episode display (original)
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
              <TableHead className="w-14 text-center">Place</TableHead>
              <TableHead>Player</TableHead>
              <TableHead className="w-24 text-right">Points</TableHead>
              <TableHead className="w-40 text-right hidden sm:table-cell">Answered</TableHead>
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
                      {result.final_correct !== null ? (
                        <div className="flex flex-col items-center gap-0.5">
                          {isFinalBeopardyWinner && (
                            <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-beo-golden/20 text-beo-golden">
                              <Sparkles className="h-3.5 w-3.5" />
                              <span className="text-xs font-semibold">Winner</span>
                            </div>
                          )}
                          {!isFinalBeopardyWinner && (
                            <Badge variant={result.final_correct ? "success" : "error"} className="text-xs">
                              {result.final_correct ? "Correct" : "Wrong"}
                            </Badge>
                          )}
                          {result.final_wager != null && result.final_wager > 0 && (
                            <span className={`text-xs font-medium ${result.final_correct ? "text-green-600" : "text-red-600"}`}>
                              {result.final_correct ? "+" : "-"}{result.final_wager}
                            </span>
                          )}
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
