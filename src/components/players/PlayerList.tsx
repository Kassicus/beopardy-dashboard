"use client";

import { useState, useMemo } from "react";
import { Search, SortAsc, SortDesc } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { PlayerCard } from "./PlayerCard";
import type { Tables } from "@/types/database";

type PlayerStats = Tables<"player_career_stats">;

interface PlayerListProps {
  players: PlayerStats[];
}

type SortField = "name" | "total_wins" | "win_percentage" | "total_appearances" | "total_points" | "accuracy_percentage";
type SortDirection = "asc" | "desc";

const sortOptions: { value: SortField; label: string }[] = [
  { value: "name", label: "Name" },
  { value: "total_wins", label: "Wins" },
  { value: "win_percentage", label: "Win Rate" },
  { value: "total_appearances", label: "Appearances" },
  { value: "total_points", label: "Total Points" },
  { value: "accuracy_percentage", label: "Accuracy" },
];

export function PlayerList({ players }: PlayerListProps) {
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  const filteredAndSortedPlayers = useMemo(() => {
    let result = [...players];

    // Filter by search
    if (search.trim()) {
      const searchLower = search.toLowerCase();
      result = result.filter((player) =>
        player.name?.toLowerCase().includes(searchLower)
      );
    }

    // Sort
    result.sort((a, b) => {
      let aVal: string | number | null;
      let bVal: string | number | null;

      if (sortField === "name") {
        aVal = a.name?.toLowerCase() ?? "";
        bVal = b.name?.toLowerCase() ?? "";
      } else {
        aVal = a[sortField] ?? 0;
        bVal = b[sortField] ?? 0;
      }

      if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    return result;
  }, [players, search, sortField, sortDirection]);

  function toggleSortDirection() {
    setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
  }

  return (
    <div>
      {/* Search and Sort Controls */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search players..."
              className="pl-10"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Select
            value={sortField}
            onChange={(e) => setSortField(e.target.value as SortField)}
            options={sortOptions}
            className="w-40"
          />
          <button
            onClick={toggleSortDirection}
            className="p-2.5 rounded-lg border border-border bg-surface hover:bg-beo-cream/30 transition-colors"
            title={sortDirection === "asc" ? "Ascending" : "Descending"}
          >
            {sortDirection === "asc" ? (
              <SortAsc className="h-5 w-5 text-text-secondary" />
            ) : (
              <SortDesc className="h-5 w-5 text-text-secondary" />
            )}
          </button>
        </div>
      </div>

      {/* Results Count */}
      <p className="text-sm text-text-muted mb-4">
        Showing {filteredAndSortedPlayers.length} of {players.length} player{players.length !== 1 ? "s" : ""}
      </p>

      {/* Player Grid */}
      {filteredAndSortedPlayers.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAndSortedPlayers.map((player) => (
            <PlayerCard key={player.id} player={player} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-text-muted">
            {search ? "No players found matching your search." : "No players available."}
          </p>
        </div>
      )}
    </div>
  );
}
