"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ArrowRight, Trophy, Target, BarChart3, Award, Users, Swords } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ROUTES } from "@/lib/constants";
import { formatNumber, formatPercentage, formatDate } from "@/lib/utils/formatters";
import type { Tables } from "@/types/database";

type PlayerStats = Tables<"player_career_stats">;

interface AppearanceWithDetails {
  episode_id: string;
  player_id: string;
  points_scored: number;
  is_winner: boolean;
  questions_correct: number;
  questions_seen: number;
  episode_title: string;
  episode_date: string;
}

interface PlayerComparisonProps {
  players: PlayerStats[];
  appearances: AppearanceWithDetails[];
}

interface ComparisonStat {
  label: string;
  player1Value: number | string;
  player2Value: number | string;
  player1Raw: number;
  player2Raw: number;
  higherIsBetter: boolean;
  icon: React.ReactNode;
}

export function PlayerComparison({ players, appearances }: PlayerComparisonProps) {
  const [player1Id, setPlayer1Id] = useState<string>("");
  const [player2Id, setPlayer2Id] = useState<string>("");

  const playerOptions = useMemo(() => {
    return players
      .filter((p) => (p.total_appearances ?? 0) > 0)
      .map((p) => ({
        value: p.id ?? "",
        label: p.name ?? "",
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [players]);

  const player1 = players.find((p) => p.id === player1Id);
  const player2 = players.find((p) => p.id === player2Id);

  // Find head-to-head matchups (episodes where both players appeared)
  const headToHead = useMemo(() => {
    if (!player1Id || !player2Id) return { games: [], player1Wins: 0, player2Wins: 0 };

    const player1Appearances = appearances.filter((a) => a.player_id === player1Id);
    const player2Appearances = appearances.filter((a) => a.player_id === player2Id);

    const sharedEpisodes = player1Appearances
      .filter((a1) => player2Appearances.some((a2) => a2.episode_id === a1.episode_id))
      .map((a1) => {
        const a2 = player2Appearances.find((a) => a.episode_id === a1.episode_id)!;
        return {
          episodeId: a1.episode_id,
          episodeTitle: a1.episode_title,
          episodeDate: a1.episode_date,
          player1Points: a1.points_scored,
          player2Points: a2.points_scored,
          player1Won: a1.is_winner,
          player2Won: a2.is_winner,
          player1Accuracy: a1.questions_seen > 0 ? (a1.questions_correct / a1.questions_seen) * 100 : 0,
          player2Accuracy: a2.questions_seen > 0 ? (a2.questions_correct / a2.questions_seen) * 100 : 0,
        };
      })
      .sort((a, b) => new Date(b.episodeDate).getTime() - new Date(a.episodeDate).getTime());

    return {
      games: sharedEpisodes,
      player1Wins: sharedEpisodes.filter((g) => g.player1Won).length,
      player2Wins: sharedEpisodes.filter((g) => g.player2Won).length,
    };
  }, [player1Id, player2Id, appearances]);

  const comparisonStats: ComparisonStat[] = useMemo(() => {
    if (!player1 || !player2) return [];

    return [
      {
        label: "Total Wins",
        player1Value: player1.total_wins ?? 0,
        player2Value: player2.total_wins ?? 0,
        player1Raw: player1.total_wins ?? 0,
        player2Raw: player2.total_wins ?? 0,
        higherIsBetter: true,
        icon: <Trophy className="h-4 w-4" />,
      },
      {
        label: "Win Rate",
        player1Value: formatPercentage(player1.win_percentage),
        player2Value: formatPercentage(player2.win_percentage),
        player1Raw: player1.win_percentage ?? 0,
        player2Raw: player2.win_percentage ?? 0,
        higherIsBetter: true,
        icon: <Award className="h-4 w-4" />,
      },
      {
        label: "Appearances",
        player1Value: player1.total_appearances ?? 0,
        player2Value: player2.total_appearances ?? 0,
        player1Raw: player1.total_appearances ?? 0,
        player2Raw: player2.total_appearances ?? 0,
        higherIsBetter: true,
        icon: <Users className="h-4 w-4" />,
      },
      {
        label: "Total Points",
        player1Value: formatNumber(player1.total_points ?? 0),
        player2Value: formatNumber(player2.total_points ?? 0),
        player1Raw: player1.total_points ?? 0,
        player2Raw: player2.total_points ?? 0,
        higherIsBetter: true,
        icon: <BarChart3 className="h-4 w-4" />,
      },
      {
        label: "Avg Points",
        player1Value: formatNumber(Math.round(player1.avg_points_per_appearance ?? 0)),
        player2Value: formatNumber(Math.round(player2.avg_points_per_appearance ?? 0)),
        player1Raw: player1.avg_points_per_appearance ?? 0,
        player2Raw: player2.avg_points_per_appearance ?? 0,
        higherIsBetter: true,
        icon: <BarChart3 className="h-4 w-4" />,
      },
      {
        label: "Correct %",
        player1Value: formatPercentage(player1.accuracy_percentage),
        player2Value: formatPercentage(player2.accuracy_percentage),
        player1Raw: player1.accuracy_percentage ?? 0,
        player2Raw: player2.accuracy_percentage ?? 0,
        higherIsBetter: true,
        icon: <Target className="h-4 w-4" />,
      },
      {
        label: "Highest Score",
        player1Value: formatNumber(player1.highest_score ?? 0),
        player2Value: formatNumber(player2.highest_score ?? 0),
        player1Raw: player1.highest_score ?? 0,
        player2Raw: player2.highest_score ?? 0,
        higherIsBetter: true,
        icon: <Trophy className="h-4 w-4" />,
      },
    ];
  }, [player1, player2]);

  function getWinnerClass(stat: ComparisonStat, isPlayer1: boolean): string {
    const player1Better = stat.higherIsBetter
      ? stat.player1Raw > stat.player2Raw
      : stat.player1Raw < stat.player2Raw;
    const isTie = stat.player1Raw === stat.player2Raw;

    if (isTie) return "";
    if ((isPlayer1 && player1Better) || (!isPlayer1 && !player1Better)) {
      return "text-beo-terracotta font-bold";
    }
    return "text-text-muted";
  }

  return (
    <div className="space-y-8">
      {/* Player Selection */}
      <Card variant="outlined">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Swords className="h-5 w-5" />
            Select Players to Compare
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="flex-1 w-full">
              <Select
                label="Player 1"
                value={player1Id}
                onChange={(e) => setPlayer1Id(e.target.value)}
                options={playerOptions}
                placeholder="Select first player..."
              />
            </div>
            <div className="hidden md:flex items-center justify-center">
              <div className="p-3 rounded-full bg-beo-cream/50">
                <Swords className="h-6 w-6 text-beo-terracotta" />
              </div>
            </div>
            <div className="flex-1 w-full">
              <Select
                label="Player 2"
                value={player2Id}
                onChange={(e) => setPlayer2Id(e.target.value)}
                options={playerOptions.filter((p) => p.value !== player1Id)}
                placeholder="Select second player..."
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Comparison Results */}
      {player1 && player2 && (
        <>
          {/* Player Headers */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card variant="elevated" className="text-center">
              <CardContent className="py-6">
                <Link href={ROUTES.player(player1.slug!)}>
                  <Avatar
                    src={player1.image_url}
                    alt={player1.name ?? "Player 1"}
                    size="xl"
                    className="mx-auto mb-4"
                  />
                  <h3 className="text-xl font-bold text-foreground hover:text-beo-terracotta transition-colors">
                    {player1.name}
                  </h3>
                </Link>
              </CardContent>
            </Card>
            <Card variant="elevated" className="text-center">
              <CardContent className="py-6">
                <Link href={ROUTES.player(player2.slug!)}>
                  <Avatar
                    src={player2.image_url}
                    alt={player2.name ?? "Player 2"}
                    size="xl"
                    className="mx-auto mb-4"
                  />
                  <h3 className="text-xl font-bold text-foreground hover:text-beo-terracotta transition-colors">
                    {player2.name}
                  </h3>
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* Head-to-Head Record */}
          {headToHead.games.length > 0 && (
            <Card variant="outlined">
              <CardHeader>
                <CardTitle>Head-to-Head Record</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center gap-8 mb-6">
                  <div className="text-center">
                    <p className="text-4xl font-bold text-beo-terracotta">
                      {headToHead.player1Wins}
                    </p>
                    <p className="text-sm text-text-muted">wins</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-text-muted">vs</p>
                    <p className="text-sm text-text-muted">{headToHead.games.length} games</p>
                  </div>
                  <div className="text-center">
                    <p className="text-4xl font-bold text-beo-terracotta">
                      {headToHead.player2Wins}
                    </p>
                    <p className="text-sm text-text-muted">wins</p>
                  </div>
                </div>

                {/* Recent matchups */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-text-secondary mb-3">Recent Matchups</h4>
                  {headToHead.games.slice(0, 5).map((game) => (
                    <Link
                      key={game.episodeId}
                      href={ROUTES.episode(game.episodeId)}
                      className="block"
                    >
                      <div className="flex items-center justify-between p-3 rounded-lg hover:bg-beo-cream/20 transition-colors">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-text-muted">
                            {formatDate(game.episodeDate)}
                          </span>
                          <span className="text-sm font-medium line-clamp-1">
                            {game.episodeTitle}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <span className={game.player1Won ? "font-bold text-beo-terracotta" : "text-text-muted"}>
                            {formatNumber(game.player1Points)}
                            {game.player1Won && <Trophy className="h-3 w-3 inline ml-1" />}
                          </span>
                          <span className="text-text-muted">-</span>
                          <span className={game.player2Won ? "font-bold text-beo-terracotta" : "text-text-muted"}>
                            {game.player2Won && <Trophy className="h-3 w-3 inline mr-1" />}
                            {formatNumber(game.player2Points)}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Stats Comparison */}
          <Card variant="outlined">
            <CardHeader>
              <CardTitle>Career Stats Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {comparisonStats.map((stat) => (
                  <div key={stat.label} className="flex items-center gap-4">
                    <div className="flex-1 text-right">
                      <span className={getWinnerClass(stat, true)}>
                        {stat.player1Value}
                      </span>
                    </div>
                    <div className="w-32 text-center">
                      <div className="flex items-center justify-center gap-2 text-sm text-text-secondary">
                        {stat.icon}
                        <span>{stat.label}</span>
                      </div>
                    </div>
                    <div className="flex-1 text-left">
                      <span className={getWinnerClass(stat, false)}>
                        {stat.player2Value}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Empty State */}
      {(!player1 || !player2) && (
        <Card variant="elevated" className="text-center py-12">
          <CardContent>
            <Swords className="h-12 w-12 text-beo-cream-dark mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Select Two Players
            </h3>
            <p className="text-text-muted max-w-md mx-auto">
              Choose two players above to see their head-to-head record and compare their career statistics.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
