import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { LoginForm } from "@/components/auth/LoginForm";
import { LogIn } from "lucide-react";

export default function AdminLoginPage() {
  return (
    <div className="py-16">
      <Container size="sm">
        <Card variant="elevated">
          <CardHeader className="text-center">
            <div className="inline-flex p-3 rounded-full bg-beo-terracotta/10 mx-auto mb-4">
              <LogIn className="h-8 w-8 text-beo-terracotta" />
            </div>
            <CardTitle className="text-2xl">Admin Login</CardTitle>
            <p className="text-text-secondary mt-2">
              Sign in to access the admin dashboard
            </p>
          </CardHeader>
          <CardContent>
            <LoginForm />
            <div className="mt-6 text-center">
              <Link
                href="/"
                className="text-sm text-text-secondary hover:text-beo-terracotta transition-colors"
              >
                ← Back to home
              </Link>
            </div>
          </CardContent>
        </Card>
      </Container>
    </div>
  );
}
