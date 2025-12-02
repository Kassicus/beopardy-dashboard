import Link from "next/link";
import { Trophy, Target, BarChart3 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { ROUTES } from "@/lib/constants";
import { formatPercentage, formatNumber } from "@/lib/utils/formatters";
import type { Tables } from "@/types/database";

interface PlayerCardProps {
  player: Tables<"player_career_stats">;
}

export function PlayerCard({ player }: PlayerCardProps) {
  const hasStats = (player.total_appearances ?? 0) > 0;

  return (
    <Link href={ROUTES.player(player.slug!)}>
      <Card
        variant="outlined"
        className="h-full hover:border-beo-terracotta/50 hover:shadow-md transition-all duration-200"
      >
        <CardContent>
          <div className="flex items-start gap-4">
            <Avatar
              src={player.image_url}
              alt={player.name ?? "Player"}
              size="lg"
            />
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground truncate">
                {player.name}
              </h3>
              {hasStats ? (
                <div className="mt-2 space-y-1.5">
                  <div className="flex items-center gap-4 text-sm">
                    <span className="flex items-center gap-1 text-text-secondary">
                      <BarChart3 className="h-3.5 w-3.5" />
                      {player.total_appearances} game{player.total_appearances !== 1 ? "s" : ""}
                    </span>
                    <span className="flex items-center gap-1 text-beo-terracotta font-medium">
                      <Trophy className="h-3.5 w-3.5" />
                      {player.total_wins} win{player.total_wins !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-text-muted">
                    <span className="flex items-center gap-1">
                      <Target className="h-3.5 w-3.5" />
                      {formatPercentage(player.accuracy_percentage)} answered
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-text-muted mt-1">
                  No appearances yet
                </p>
              )}
            </div>
            {(player.total_wins ?? 0) > 0 && (
              <Badge variant="golden" className="shrink-0">
                {formatPercentage(player.win_percentage, 0)} win rate
              </Badge>
            )}
          </div>

          {hasStats && (
            <div className="mt-4 pt-4 border-t border-border">
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-lg font-bold text-foreground">
                    {formatNumber(player.total_points ?? 0)}
                  </p>
                  <p className="text-xs text-text-muted">Total Points</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-foreground">
                    {formatNumber(Math.round(player.avg_points_per_appearance ?? 0))}
                  </p>
                  <p className="text-xs text-text-muted">Avg Points</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-foreground">
                    {formatNumber(player.highest_score ?? 0)}
                  </p>
                  <p className="text-xs text-text-muted">Best Score</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
