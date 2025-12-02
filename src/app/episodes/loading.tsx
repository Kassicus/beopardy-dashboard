import { Container } from "@/components/layout/Container";
import { Skeleton } from "@/components/ui/Skeleton";

export default function EpisodesLoading() {
  return (
    <div className="py-8">
      <Container>
        {/* Header */}
        <div className="mb-8">
          <Skeleton className="h-10 w-48 mb-2" />
          <Skeleton className="h-5 w-96" />
        </div>

        {/* Search and Filter Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <Skeleton className="h-10 flex-1" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-36" />
            <Skeleton className="h-10 w-40" />
            <Skeleton className="h-10 w-10" />
          </div>
        </div>

        {/* Results Count */}
        <Skeleton className="h-4 w-32 mb-4" />

        {/* Episode Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="rounded-xl overflow-hidden border border-border">
              <Skeleton className="aspect-video" />
              <div className="p-4">
                <Skeleton className="h-5 w-20 mb-2" />
                <Skeleton className="h-6 w-full mb-2" />
                <Skeleton className="h-4 w-24 mb-4" />
                <Skeleton className="h-8 w-full" />
              </div>
            </div>
          ))}
        </div>
      </Container>
    </div>
  );
}
