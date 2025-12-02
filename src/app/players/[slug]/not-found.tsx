import Link from "next/link";
import { User, ArrowLeft, Home } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ROUTES } from "@/lib/constants";

export default function PlayerNotFound() {
  return (
    <div className="py-16">
      <Container size="sm">
        <Card variant="elevated" className="text-center">
          <CardContent className="py-12">
            <div className="inline-flex p-4 rounded-full bg-beo-cream/50 mb-6">
              <User className="h-12 w-12 text-beo-terracotta" />
            </div>
            <h1 className="text-2xl font-bold font-display text-foreground mb-2">
              Player Not Found
            </h1>
            <p className="text-text-secondary mb-8 max-w-sm mx-auto">
              The player you&apos;re looking for doesn&apos;t exist or may have been removed.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href={ROUTES.players}>
                <Button leftIcon={<ArrowLeft className="h-4 w-4" />}>
                  Browse Players
                </Button>
              </Link>
              <Link href={ROUTES.home}>
                <Button variant="outline" leftIcon={<Home className="h-4 w-4" />}>
                  Go Home
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </Container>
    </div>
  );
}
