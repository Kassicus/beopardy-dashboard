import Link from "next/link";
import { Trophy, UserPlus, Tv, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { ROUTES } from "@/lib/constants";
import { formatRelativeDate } from "@/lib/utils/formatters";

interface ActivityItem {
  type: "new_player" | "new_episode" | "episode_results";
  id: string;
  title: string;
  subtitle?: string;
  date: string;
  href: string;
  imageUrl?: string | null;
  metadata?: {
    winnerName?: string;
    playerCount?: number;
  };
}

interface RecentActivityProps {
  activities: ActivityItem[];
}

function getActivityIcon(type: ActivityItem["type"]) {
  switch (type) {
    case "new_player":
      return <UserPlus className="h-4 w-4 text-beo-terracotta" />;
    case "new_episode":
      return <Tv className="h-4 w-4 text-beo-rose" />;
    case "episode_results":
      return <Trophy className="h-4 w-4 text-beo-golden-dark" />;
  }
}

function getActivityBadge(type: ActivityItem["type"]) {
  switch (type) {
    case "new_player":
      return <Badge variant="terracotta">New Player</Badge>;
    case "new_episode":
      return <Badge variant="rose">New Episode</Badge>;
    case "episode_results":
      return <Badge variant="golden">Results Added</Badge>;
  }
}

export function RecentActivity({ activities }: RecentActivityProps) {
  if (activities.length === 0) {
    return (
      <Card variant="outlined">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-text-muted text-center py-8">
            No recent activity to show.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card variant="outlined">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-border">
          {activities.map((activity, index) => (
            <Link
              key={`${activity.type}-${activity.id}-${index}`}
              href={activity.href}
              className="flex items-start gap-4 p-4 hover:bg-beo-cream/20 transition-colors"
            >
              <div className="mt-1 p-2 rounded-full bg-beo-cream/50">
                {getActivityIcon(activity.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  {getActivityBadge(activity.type)}
                  <span className="text-xs text-text-muted">
                    {formatRelativeDate(activity.date)}
                  </span>
                </div>
                <p className="font-medium text-foreground truncate">
                  {activity.title}
                </p>
                {activity.subtitle && (
                  <p className="text-sm text-text-muted truncate">
                    {activity.subtitle}
                  </p>
                )}
                {activity.metadata?.winnerName && (
                  <p className="text-sm text-beo-terracotta mt-1">
                    <Trophy className="h-3 w-3 inline mr-1" />
                    {activity.metadata.winnerName} won!
                  </p>
                )}
              </div>
              {activity.type === "new_player" && activity.imageUrl && (
                <Avatar
                  src={activity.imageUrl}
                  alt={activity.title}
                  size="sm"
                />
              )}
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
