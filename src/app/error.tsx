"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, Home, RefreshCw } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ROUTES } from "@/lib/constants";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="py-16">
      <Container size="sm">
        <Card variant="elevated" className="text-center">
          <CardContent className="py-12">
            <div className="inline-flex p-4 rounded-full bg-red-100 mb-6">
              <AlertTriangle className="h-12 w-12 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold font-display text-foreground mb-2">
              Something Went Wrong
            </h1>
            <p className="text-text-secondary mb-8 max-w-sm mx-auto">
              An unexpected error occurred. Please try again or go back to the homepage.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button onClick={reset} leftIcon={<RefreshCw className="h-4 w-4" />}>
                Try Again
              </Button>
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
