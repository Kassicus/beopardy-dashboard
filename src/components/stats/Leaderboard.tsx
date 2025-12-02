"use client";

import { useState } from "react";
import Link from "next/link";
import { Trophy, Target, BarChart3, Users, Award, Crown } from "lucide-react";
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
import { ROUTES, LEADERBOARD_MIN_APPEARANCES } from "@/lib/constants";
import { formatNumber, formatPercentage } from "@/lib/utils/formatters";
import type { Tables } from "@/types/database";

type PlayerStats = Tables<"player_career_stats">;

interface LeaderboardProps {
  players: PlayerStats[];
}

type LeaderboardType = "wins" | "winRate" | "points" | "accuracy" | "appearances";

interface LeaderboardTab {
  id: LeaderboardType;
  label: string;
  icon: React.ReactNode;
  description: string;
  minAppearances?: number;
  getValue: (player: PlayerStats) => number | null;
  formatValue: (value: number | null) => string;
  sortDesc: boolean;
}

const leaderboardTabs: LeaderboardTab[] = [
  {
    id: "wins",
    label: "Most Wins",
    icon: <Trophy className="h-4 w-4" />,
    description: "Players with the most game victories",
    getValue: (p) => p.total_wins,
    formatValue: (v) => `${v ?? 0} wins`,
    sortDesc: true,
  },
  {
    id: "winRate",
    label: "Win Rate",
    icon: <Crown className="h-4 w-4" />,
    description: `Highest win percentage (min. ${LEADERBOARD_MIN_APPEARANCES} appearances)`,
    minAppearances: LEADERBOARD_MIN_APPEARANCES,
    getValue: (p) => p.win_percentage,
    formatValue: (v) => formatPercentage(v),
    sortDesc: true,
  },
  {
    id: "points",
    label: "Total Points",
    icon: <Award className="h-4 w-4" />,
    description: "Career points accumulated across all games",
    getValue: (p) => p.total_points,
    formatValue: (v) => formatNumber(v ?? 0),
    sortDesc: true,
  },
  {
    id: "accuracy",
    label: "Accuracy",
    icon: <Target className="h-4 w-4" />,
    description: `Best question accuracy (min. ${LEADERBOARD_MIN_APPEARANCES} appearances)`,
    minAppearances: LEADERBOARD_MIN_APPEARANCES,
    getValue: (p) => p.accuracy_percentage,
    formatValue: (v) => formatPercentage(v),
    sortDesc: true,
  },
  {
    id: "appearances",
    label: "Appearances",
    icon: <Users className="h-4 w-4" />,
    description: "Most games played",
    getValue: (p) => p.total_appearances,
    formatValue: (v) => `${v ?? 0} games`,
    sortDesc: true,
  },
];

function getMedalColor(rank: number): string {
  switch (rank) {
    case 1:
      return "bg-beo-golden text-white";
    case 2:
      return "bg-gray-300 text-gray-700";
    case 3:
      return "bg-amber-600 text-white";
    default:
      return "bg-beo-cream/50 text-text-secondary";
  }
}

export function Leaderboard({ players }: LeaderboardProps) {
  const [activeTab, setActiveTab] = useState<LeaderboardType>("wins");

  const currentTab = leaderboardTabs.find((t) => t.id === activeTab)!;

  // Filter and sort players based on current tab
  const rankedPlayers = players
    .filter((player) => {
      // Must have at least 1 appearance
      if ((player.total_appearances ?? 0) === 0) return false;
      // Check minimum appearances if required
      if (currentTab.minAppearances) {
        return (player.total_appearances ?? 0) >= currentTab.minAppearances;
      }
      return true;
    })
    .sort((a, b) => {
      const aVal = currentTab.getValue(a) ?? 0;
      const bVal = currentTab.getValue(b) ?? 0;
      if (currentTab.sortDesc) {
        return bVal - aVal;
      }
      return aVal - bVal;
    });

  return (
    <div>
      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 mb-6">
        {leaderboardTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
              transition-all duration-200
              ${activeTab === tab.id
                ? "bg-beo-terracotta text-white shadow-md"
                : "bg-surface border border-border text-text-secondary hover:bg-beo-cream/30 hover:text-foreground"
              }
            `}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Leaderboard Card */}
      <Card variant="outlined">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                {currentTab.icon}
                {currentTab.label}
              </CardTitle>
              <p className="text-sm text-text-muted mt-1">
                {currentTab.description}
              </p>
            </div>
            <Badge variant="cream">
              {rankedPlayers.length} player{rankedPlayers.length !== 1 ? "s" : ""}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {rankedPlayers.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Rank</TableHead>
                  <TableHead>Player</TableHead>
                  <TableHead className="text-right">Value</TableHead>
                  <TableHead className="text-right hidden sm:table-cell">Games</TableHead>
                  <TableHead className="text-right hidden md:table-cell">Win Rate</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rankedPlayers.map((player, index) => {
                  const rank = index + 1;
                  const value = currentTab.getValue(player);

                  return (
                    <TableRow key={player.id} isClickable>
                      <TableCell>
                        <div className={`
                          w-8 h-8 rounded-full flex items-center justify-center
                          text-sm font-bold ${getMedalColor(rank)}
                        `}>
                          {rank}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Link
                          href={ROUTES.player(player.slug!)}
                          className="flex items-center gap-3 group"
                        >
                          <Avatar
                            src={player.image_url}
                            alt={player.name ?? "Player"}
                            size="sm"
                          />
                          <span className="font-medium text-foreground group-hover:text-beo-terracotta transition-colors">
                            {player.name}
                          </span>
                        </Link>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className={`font-bold ${rank <= 3 ? "text-beo-terracotta" : ""}`}>
                          {currentTab.formatValue(value)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right hidden sm:table-cell text-text-secondary">
                        {player.total_appearances}
                      </TableCell>
                      <TableCell className="text-right hidden md:table-cell text-text-secondary">
                        {formatPercentage(player.win_percentage)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12 text-text-muted">
              {currentTab.minAppearances ? (
                <p>
                  No players with at least {currentTab.minAppearances} appearances yet.
                </p>
              ) : (
                <p>No player statistics available yet.</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
