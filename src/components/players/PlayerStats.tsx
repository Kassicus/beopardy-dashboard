import { Trophy, Target, BarChart3, TrendingUp, TrendingDown, Award, User, Users } from "lucide-react";
import { StatCard } from "@/components/ui/StatCard";
import { formatPercentage, formatNumber } from "@/lib/utils/formatters";
import type { Tables } from "@/types/database";

interface PlayerStatsProps {
  stats: Tables<"player_career_stats">;
}

export function PlayerStats({ stats }: PlayerStatsProps) {
  const hasStats = (stats.total_appearances ?? 0) > 0;

  if (!hasStats) {
    return (
      <div className="text-center py-8 text-text-muted">
        No game statistics available yet.
      </div>
    );
  }

  const hasSoloGames = (stats.solo_appearances ?? 0) > 0;
  const hasTeamGames = (stats.team_appearances ?? 0) > 0;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      <StatCard
        label="Appearances"
        value={stats.total_appearances ?? 0}
        subValue={hasSoloGames && hasTeamGames ? `${stats.solo_appearances} solo, ${stats.team_appearances} team` : undefined}
        icon={<BarChart3 className="h-5 w-5" />}
        accentColor="terracotta"
      />
      {hasSoloGames && (
        <StatCard
          label="Solo Wins"
          value={stats.solo_wins ?? 0}
          subValue={`${formatPercentage(stats.solo_win_percentage)} in ${stats.solo_appearances} games`}
          icon={<User className="h-5 w-5" />}
          accentColor="golden"
        />
      )}
      {hasTeamGames && (
        <StatCard
          label="Team Wins"
          value={stats.team_wins ?? 0}
          subValue={`${formatPercentage(stats.team_win_percentage)} in ${stats.team_appearances} games`}
          icon={<Users className="h-5 w-5" />}
          accentColor="rose"
        />
      )}
      {!hasSoloGames && !hasTeamGames && (
        <StatCard
          label="Wins"
          value={stats.total_wins ?? 0}
          subValue={`${formatPercentage(stats.win_percentage)} win rate`}
          icon={<Trophy className="h-5 w-5" />}
          accentColor="golden"
        />
      )}
      <StatCard
        label="Total Points"
        value={formatNumber(stats.total_points ?? 0)}
        subValue={`${formatNumber(Math.round(stats.avg_points_per_appearance ?? 0))} avg per game`}
        icon={<Award className="h-5 w-5" />}
        accentColor="rose"
      />
      <StatCard
        label="Answered"
        value={`${stats.total_questions_correct ?? 0}/${stats.total_questions_seen ?? 0}`}
        subValue={`${formatPercentage(stats.accuracy_percentage)} answer rate`}
        icon={<Target className="h-5 w-5" />}
        accentColor="cream"
      />
      <StatCard
        label="Highest Score"
        value={formatNumber(stats.highest_score ?? 0)}
        icon={<TrendingUp className="h-5 w-5" />}
        accentColor="golden"
      />
      <StatCard
        label="Lowest Score"
        value={formatNumber(stats.lowest_score ?? 0)}
        icon={<TrendingDown className="h-5 w-5" />}
        accentColor="cream"
      />
    </div>
  );
}
