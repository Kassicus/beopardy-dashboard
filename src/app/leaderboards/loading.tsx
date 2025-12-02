import { Container } from "@/components/layout/Container";
import { Skeleton } from "@/components/ui/Skeleton";

export default function LeaderboardsLoading() {
  return (
    <div className="py-8">
      <Container>
        {/* Header */}
        <div className="mb-8">
          <Skeleton className="h-10 w-48 mb-2" />
          <Skeleton className="h-5 w-80" />
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 mb-6">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-10 w-32 rounded-lg" />
          ))}
        </div>

        {/* Leaderboard Table */}
        <div className="bg-surface rounded-xl border border-border">
          <div className="p-6 border-b border-border">
            <Skeleton className="h-6 w-40 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <div className="p-6">
            {[...Array(10)].map((_, i) => (
              <Skeleton key={i} className="h-14 mb-3" />
            ))}
          </div>
        </div>
      </Container>
    </div>
  );
}
