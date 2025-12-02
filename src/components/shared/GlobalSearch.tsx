"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, X, Users, Tv, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { ROUTES } from "@/lib/constants";
import { formatDate } from "@/lib/utils/formatters";

interface SearchResult {
  type: "player" | "episode";
  id: string;
  title: string;
  subtitle: string;
  href: string;
  imageUrl?: string | null;
}

export function GlobalSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Keyboard shortcut to open search
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        setIsOpen(true);
        inputRef.current?.focus();
      }
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Search function
  const search = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    const supabase = createClient();

    try {
      const [playersResult, episodesResult] = await Promise.all([
        supabase
          .from("player_career_stats")
          .select("id, name, slug, image_url, total_wins, total_appearances")
          .ilike("name", `%${searchQuery}%`)
          .limit(5),
        supabase
          .from("episode_summary")
          .select("id, title, season, episode_number, air_date, winner_name")
          .or(`title.ilike.%${searchQuery}%,winner_name.ilike.%${searchQuery}%`)
          .limit(5),
      ]);

      const searchResults: SearchResult[] = [];

      // Add player results
      if (playersResult.data) {
        playersResult.data.forEach((player) => {
          searchResults.push({
            type: "player",
            id: player.id ?? "",
            title: player.name ?? "",
            subtitle: `${player.total_wins ?? 0} wins • ${player.total_appearances ?? 0} appearances`,
            href: ROUTES.player(player.slug ?? ""),
            imageUrl: player.image_url,
          });
        });
      }

      // Add episode results
      if (episodesResult.data) {
        episodesResult.data.forEach((episode) => {
          searchResults.push({
            type: "episode",
            id: episode.id ?? "",
            title: episode.title ?? "",
            subtitle: `S${episode.season} E${episode.episode_number} • ${formatDate(episode.air_date ?? "")}`,
            href: ROUTES.episode(episode.id ?? ""),
          });
        });
      }

      setResults(searchResults);
      setSelectedIndex(0);
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      search(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query, search]);

  // Handle keyboard navigation
  function handleKeyDown(event: React.KeyboardEvent) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    } else if (event.key === "Enter" && results[selectedIndex]) {
      event.preventDefault();
      router.push(results[selectedIndex].href);
      setIsOpen(false);
      setQuery("");
    }
  }

  function handleResultClick(href: string) {
    router.push(href);
    setIsOpen(false);
    setQuery("");
  }

  return (
    <div ref={containerRef} className="relative">
      {/* Search Button (Mobile) */}
      <button
        onClick={() => {
          setIsOpen(true);
          setTimeout(() => inputRef.current?.focus(), 100);
        }}
        className="md:hidden p-2 text-text-secondary hover:text-foreground transition-colors"
        aria-label="Search"
      >
        <Search className="h-5 w-5" />
      </button>

      {/* Search Input (Desktop) */}
      <div className="hidden md:block relative">
        <button
          onClick={() => {
            setIsOpen(true);
            setTimeout(() => inputRef.current?.focus(), 100);
          }}
          className="flex items-center gap-2 px-3 py-1.5 text-sm text-text-muted bg-surface border border-border rounded-lg hover:border-beo-terracotta/50 transition-colors w-64"
        >
          <Search className="h-4 w-4" />
          <span>Search...</span>
          <kbd className="ml-auto px-1.5 py-0.5 text-xs bg-beo-cream/50 rounded">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Search Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] px-4 bg-black/50">
          <div className="w-full max-w-lg bg-surface rounded-xl shadow-2xl border border-border overflow-hidden">
            {/* Search Input */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
              <Search className="h-5 w-5 text-text-muted shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search players or episodes..."
                className="flex-1 bg-transparent outline-none text-foreground placeholder:text-text-muted"
                autoComplete="off"
              />
              {isLoading && <Loader2 className="h-4 w-4 animate-spin text-text-muted" />}
              {query && !isLoading && (
                <button
                  onClick={() => setQuery("")}
                  className="p-1 text-text-muted hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Results */}
            <div className="max-h-80 overflow-y-auto">
              {results.length > 0 ? (
                <ul className="py-2">
                  {results.map((result, index) => (
                    <li key={`${result.type}-${result.id}`}>
                      <button
                        onClick={() => handleResultClick(result.href)}
                        className={`
                          w-full flex items-center gap-3 px-4 py-2 text-left
                          ${index === selectedIndex ? "bg-beo-cream/30" : "hover:bg-beo-cream/20"}
                        `}
                      >
                        {result.type === "player" ? (
                          <Avatar
                            src={result.imageUrl}
                            alt={result.title}
                            size="sm"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-beo-rose/20 flex items-center justify-center">
                            <Tv className="h-4 w-4 text-beo-rose" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground truncate">
                            {result.title}
                          </p>
                          <p className="text-sm text-text-muted truncate">
                            {result.subtitle}
                          </p>
                        </div>
                        <Badge variant={result.type === "player" ? "terracotta" : "rose"}>
                          {result.type === "player" ? (
                            <Users className="h-3 w-3 mr-1" />
                          ) : (
                            <Tv className="h-3 w-3 mr-1" />
                          )}
                          {result.type}
                        </Badge>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : query && !isLoading ? (
                <div className="py-8 text-center text-text-muted">
                  No results found for &quot;{query}&quot;
                </div>
              ) : !query ? (
                <div className="py-8 text-center text-text-muted">
                  <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>Search for players or episodes</p>
                </div>
              ) : null}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-4 py-2 border-t border-border bg-beo-cream/20 text-xs text-text-muted">
              <div className="flex items-center gap-2">
                <kbd className="px-1.5 py-0.5 bg-surface rounded border border-border">↑</kbd>
                <kbd className="px-1.5 py-0.5 bg-surface rounded border border-border">↓</kbd>
                <span>to navigate</span>
              </div>
              <div className="flex items-center gap-2">
                <kbd className="px-1.5 py-0.5 bg-surface rounded border border-border">↵</kbd>
                <span>to select</span>
              </div>
              <div className="flex items-center gap-2">
                <kbd className="px-1.5 py-0.5 bg-surface rounded border border-border">esc</kbd>
                <span>to close</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
