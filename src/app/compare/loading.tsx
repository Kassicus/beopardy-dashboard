import { Container } from "@/components/layout/Container";
import { Skeleton } from "@/components/ui/Skeleton";

export default function CompareLoading() {
  return (
    <div className="py-8">
      <Container>
        {/* Header */}
        <div className="mb-8">
          <Skeleton className="h-10 w-56 mb-2" />
          <Skeleton className="h-5 w-96" />
        </div>

        {/* Player Selection */}
        <div className="bg-surface rounded-xl border border-border p-6 mb-8">
          <Skeleton className="h-6 w-48 mb-4" />
          <div className="flex flex-col md:flex-row items-center gap-4">
            <Skeleton className="h-16 flex-1 w-full" />
            <Skeleton className="h-12 w-12 rounded-full hidden md:block" />
            <Skeleton className="h-16 flex-1 w-full" />
          </div>
        </div>

        {/* Empty State */}
        <Skeleton className="h-64 rounded-xl" />
      </Container>
    </div>
  );
}
