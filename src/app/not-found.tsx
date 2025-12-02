import Link from "next/link";
import { FileQuestion, Home, Users, Tv } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ROUTES } from "@/lib/constants";

export default function NotFound() {
  return (
    <div className="py-16">
      <Container size="sm">
        <Card variant="elevated" className="text-center">
          <CardContent className="py-12">
            <div className="inline-flex p-4 rounded-full bg-beo-cream/50 mb-6">
              <FileQuestion className="h-12 w-12 text-beo-terracotta" />
            </div>
            <h1 className="text-3xl font-bold font-display text-foreground mb-2">
              Page Not Found
            </h1>
            <p className="text-text-secondary mb-8 max-w-sm mx-auto">
              The page you&apos;re looking for doesn&apos;t exist or has been moved.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href={ROUTES.home}>
                <Button leftIcon={<Home className="h-4 w-4" />}>
                  Go Home
                </Button>
              </Link>
              <Link href={ROUTES.players}>
                <Button variant="outline" leftIcon={<Users className="h-4 w-4" />}>
                  Players
                </Button>
              </Link>
              <Link href={ROUTES.episodes}>
                <Button variant="outline" leftIcon={<Tv className="h-4 w-4" />}>
                  Episodes
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </Container>
    </div>
  );
}
