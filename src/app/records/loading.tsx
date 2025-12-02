import { Container } from "@/components/layout/Container";
import { Skeleton } from "@/components/ui/Skeleton";

export default function RecordsLoading() {
  return (
    <div className="py-8">
      <Container>
        {/* Header */}
        <div className="mb-8">
          <Skeleton className="h-10 w-64 mb-2" />
          <Skeleton className="h-5 w-96" />
        </div>

        {/* Records Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="bg-surface rounded-xl border border-border p-6">
              <div className="flex items-center gap-2 mb-4">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <Skeleton className="h-6 w-48" />
              </div>
              <div className="flex items-center gap-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-8 w-24 mb-2" />
                  <Skeleton className="h-5 w-32 mb-1" />
                  <Skeleton className="h-4 w-48" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </div>
  );
}
