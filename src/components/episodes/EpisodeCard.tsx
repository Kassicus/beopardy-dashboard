import Link from "next/link";
import Image from "next/image";
import { Calendar, Users, Trophy, Crown, Play, UsersRound } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ROUTES } from "@/lib/constants";
import { formatDate, formatNumber } from "@/lib/utils/formatters";
import { getYouTubeThumbnail } from "@/lib/utils/youtube";
import type { Tables } from "@/types/database";

interface EpisodeCardProps {
  episode: Tables<"episode_summary">;
}

export function EpisodeCard({ episode }: EpisodeCardProps) {
  const isTeamEpisode = episode.episode_type === "team";
  const hasResults = isTeamEpisode
    ? episode.winning_team_name !== null
    : episode.winner_name !== null;
  const winnerDisplay = isTeamEpisode
    ? episode.winning_team_name
    : episode.winner_name;

  // Use stored thumbnail, or generate from YouTube URL as fallback
  const thumbnailUrl = episode.thumbnail_url ||
    (episode.youtube_url ? getYouTubeThumbnail(episode.youtube_url) : null);

  return (
    <Link href={ROUTES.episode(episode.id!)}>
      <Card
        variant="outlined"
        className="h-full hover:border-beo-rose/50 hover:shadow-md transition-all duration-200 overflow-hidden"
      >
        {/* Thumbnail */}
        {thumbnailUrl ? (
          <div className="relative aspect-video bg-beo-cream/30">
            <Image
              src={thumbnailUrl}
              alt={episode.title ?? "Episode thumbnail"}
              fill
              className="object-cover"
              unoptimized={thumbnailUrl.includes("img.youtube.com")}
            />
            {episode.youtube_url && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 hover:opacity-100 transition-opacity">
                <div className="p-3 bg-white/90 rounded-full">
                  <Play className="h-6 w-6 text-beo-terracotta" />
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="aspect-video bg-gradient-to-br from-beo-rose/20 to-beo-terracotta/20 flex items-center justify-center">
            <div className="text-beo-rose/50 text-center">
              <Play className="h-12 w-12 mx-auto mb-2" />
              <span className="text-sm">S{episode.season} E{episode.episode_number}</span>
            </div>
          </div>
        )}

        <CardContent className="pt-4">
          {/* Title and Season/Episode */}
          <div className="mb-3">
            <div className="flex items-center gap-2 text-xs text-text-muted mb-1">
              <Badge variant="rose" className="text-xs">
                S{episode.season} E{episode.episode_number}
              </Badge>
              {isTeamEpisode && (
                <Badge variant="cream" className="text-xs gap-1">
                  <UsersRound className="h-3 w-3" />
                  Team
                </Badge>
              )}
            </div>
            <h3 className="font-semibold text-foreground line-clamp-2">
              {episode.title}
            </h3>
          </div>

          {/* Air Date */}
          <div className="flex items-center gap-1 text-sm text-text-secondary mb-3">
            <Calendar className="h-3.5 w-3.5" />
            {formatDate(episode.air_date!)}
          </div>

          {/* Stats Row */}
          <div className="flex items-center justify-between pt-3 border-t border-border">
            {hasResults ? (
              <>
                <div className="flex items-center gap-2">
                  <Badge variant="golden" className="gap-1">
                    {isTeamEpisode ? <UsersRound className="h-3 w-3" /> : <Crown className="h-3 w-3" />}
                    {winnerDisplay}
                  </Badge>
                </div>
                <div className="flex items-center gap-3 text-sm text-text-muted">
                  <span className="flex items-center gap-1">
                    <Users className="h-3.5 w-3.5" />
                    {episode.participant_count}
                  </span>
                  <span className="flex items-center gap-1">
                    <Trophy className="h-3.5 w-3.5" />
                    {formatNumber(episode.highest_score ?? 0)}
                  </span>
                </div>
              </>
            ) : (
              <Badge variant="cream">Results Pending</Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
