"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, Tv, ArrowLeft } from "lucide-react";
import { SignOutButton } from "@/components/auth/SignOutButton";
import { ROUTES } from "@/lib/constants";

const adminLinks = [
  { href: ROUTES.admin.dashboard, label: "Dashboard", icon: LayoutDashboard },
  { href: ROUTES.admin.players, label: "Players", icon: Users },
  { href: ROUTES.admin.episodes, label: "Episodes", icon: Tv },
];

export function AdminNav() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  };

  return (
    <div className="bg-surface border-b border-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between">
          <div className="flex items-center gap-6">
            <Link
              href="/"
              className="flex items-center gap-2 text-text-secondary hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="text-sm">Back to site</span>
            </Link>

            <div className="h-6 w-px bg-border" />

            <nav className="flex items-center gap-1">
              {adminLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`
                    flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium
                    transition-colors duration-200
                    ${
                      isActive(link.href)
                        ? "bg-beo-terracotta/10 text-beo-terracotta"
                        : "text-text-secondary hover:text-foreground hover:bg-beo-cream/30"
                    }
                  `}
                >
                  <link.icon className="h-4 w-4" />
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          <SignOutButton />
        </div>
      </div>
    </div>
  );
}
