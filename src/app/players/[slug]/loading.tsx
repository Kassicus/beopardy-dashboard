import { Container } from "@/components/layout/Container";
import { Skeleton } from "@/components/ui/Skeleton";

export default function PlayerDetailLoading() {
  return (
    <div className="py-8">
      <Container>
        {/* Back Link */}
        <Skeleton className="h-8 w-32 mb-6" />

        {/* Player Header */}
        <div className="bg-surface rounded-xl shadow-md p-8 mb-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <Skeleton className="w-24 h-24 sm:w-32 sm:h-32 rounded-full" />
            <div className="flex-1 text-center sm:text-left">
              <Skeleton className="h-10 w-48 mx-auto sm:mx-0 mb-2" />
              <Skeleton className="h-5 w-64 mx-auto sm:mx-0" />
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="mb-8">
          <Skeleton className="h-6 w-40 mb-4" />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))}
          </div>
        </div>

        {/* Appearance History */}
        <div className="bg-surface rounded-xl border border-border">
          <div className="p-6 border-b border-border">
            <Skeleton className="h-6 w-48" />
          </div>
          <div className="p-6">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 mb-3" />
            ))}
          </div>
        </div>
      </Container>
    </div>
  );
}
