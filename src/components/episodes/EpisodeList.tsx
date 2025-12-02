"use client";

import { useState, useMemo } from "react";
import { Search, SortAsc, SortDesc } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { EpisodeCard } from "./EpisodeCard";
import type { Tables } from "@/types/database";

type EpisodeSummary = Tables<"episode_summary">;

interface EpisodeListProps {
  episodes: EpisodeSummary[];
}

type SortField = "air_date" | "episode_number" | "highest_score" | "participant_count";
type SortDirection = "asc" | "desc";

const sortOptions = [
  { value: "air_date", label: "Air Date" },
  { value: "episode_number", label: "Episode Number" },
  { value: "highest_score", label: "Highest Score" },
  { value: "participant_count", label: "Participants" },
];

export function EpisodeList({ episodes }: EpisodeListProps) {
  const [search, setSearch] = useState("");
  const [seasonFilter, setSeasonFilter] = useState<string>("all");
  const [sortField, setSortField] = useState<SortField>("air_date");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  // Get unique seasons for filter
  const seasons = useMemo(() => {
    const uniqueSeasons = [...new Set(episodes.map((e) => e.season).filter(Boolean))];
    return uniqueSeasons.sort((a, b) => (a ?? 0) - (b ?? 0));
  }, [episodes]);

  // Build season filter options
  const seasonOptions = useMemo(() => {
    return [
      { value: "all", label: "All Seasons" },
      ...seasons.map((season) => ({
        value: season?.toString() ?? "",
        label: `Season ${season}`,
      })),
    ];
  }, [seasons]);

  const filteredAndSortedEpisodes = useMemo(() => {
    let result = [...episodes];

    // Filter by search
    if (search.trim()) {
      const searchLower = search.toLowerCase();
      result = result.filter(
        (episode) =>
          episode.title?.toLowerCase().includes(searchLower) ||
          episode.winner_name?.toLowerCase().includes(searchLower)
      );
    }

    // Filter by season
    if (seasonFilter !== "all") {
      result = result.filter((episode) => episode.season === parseInt(seasonFilter));
    }

    // Sort
    result.sort((a, b) => {
      let aVal: string | number | null;
      let bVal: string | number | null;

      if (sortField === "air_date") {
        aVal = a.air_date ?? "";
        bVal = b.air_date ?? "";
      } else {
        aVal = a[sortField] ?? 0;
        bVal = b[sortField] ?? 0;
      }

      if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    return result;
  }, [episodes, search, seasonFilter, sortField, sortDirection]);

  function toggleSortDirection() {
    setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
  }

  return (
    <div>
      {/* Search and Filter Controls */}
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search episodes or winners..."
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex gap-2">
            {seasons.length > 1 && (
              <Select
                value={seasonFilter}
                onChange={(e) => setSeasonFilter(e.target.value)}
                options={seasonOptions}
                className="w-36"
              />
            )}
            <Select
              value={sortField}
              onChange={(e) => setSortField(e.target.value as SortField)}
              options={sortOptions}
              className="w-40"
            />
            <button
              onClick={toggleSortDirection}
              className="p-2.5 rounded-lg border border-border bg-surface hover:bg-beo-cream/30 transition-colors"
              title={sortDirection === "asc" ? "Oldest First" : "Newest First"}
            >
              {sortDirection === "asc" ? (
                <SortAsc className="h-5 w-5 text-text-secondary" />
              ) : (
                <SortDesc className="h-5 w-5 text-text-secondary" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <p className="text-sm text-text-muted mb-4">
        Showing {filteredAndSortedEpisodes.length} of {episodes.length} episode{episodes.length !== 1 ? "s" : ""}
        {seasonFilter !== "all" && ` in Season ${seasonFilter}`}
      </p>

      {/* Episode Grid */}
      {filteredAndSortedEpisodes.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedEpisodes.map((episode) => (
            <EpisodeCard key={episode.id} episode={episode} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-text-muted">
            {search || seasonFilter !== "all"
              ? "No episodes found matching your filters."
              : "No episodes available."}
          </p>
        </div>
      )}
    </div>
  );
}
