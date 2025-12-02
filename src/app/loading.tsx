import { Container } from "@/components/layout/Container";
import { Skeleton } from "@/components/ui/Skeleton";

export default function HomeLoading() {
  return (
    <div className="py-12">
      <Container>
        {/* Hero Section Skeleton */}
        <div className="text-center mb-16">
          <Skeleton className="h-12 w-96 mx-auto mb-4" />
          <Skeleton className="h-6 w-[32rem] mx-auto mb-8" />
          <div className="flex justify-center gap-4">
            <Skeleton className="h-12 w-40" />
            <Skeleton className="h-12 w-36" />
          </div>
        </div>

        {/* Stats Overview Skeleton */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>

        {/* Quick Links Skeleton */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-xl" />
          ))}
        </div>

        {/* Recent Content Skeleton */}
        <div className="grid lg:grid-cols-2 gap-6">
          <Skeleton className="h-80 rounded-xl" />
          <Skeleton className="h-80 rounded-xl" />
        </div>
      </Container>
    </div>
  );
}
