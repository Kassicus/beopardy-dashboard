import { Container } from "@/components/layout/Container";
import { Skeleton } from "@/components/ui/Skeleton";

export default function EpisodeDetailLoading() {
  return (
    <div className="py-8">
      <Container>
        {/* Back Link */}
        <Skeleton className="h-8 w-36 mb-6" />

        {/* Episode Header */}
        <div className="bg-surface rounded-xl shadow-md p-8 mb-8">
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1">
              <div className="flex gap-2 mb-3">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-6 w-40" />
              </div>
              <Skeleton className="h-12 w-96 mb-3" />
              <div className="flex gap-4 mb-4">
                <Skeleton className="h-5 w-28" />
                <Skeleton className="h-5 w-32" />
              </div>
              <Skeleton className="h-10 w-40 mt-4" />
            </div>
            <Skeleton className="lg:w-80 aspect-video rounded-lg" />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>

        {/* Results Table */}
        <div className="bg-surface rounded-xl border border-border">
          <div className="p-6 border-b border-border">
            <Skeleton className="h-6 w-48" />
          </div>
          <div className="p-6">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-14 mb-3" />
            ))}
          </div>
        </div>
      </Container>
    </div>
  );
}
