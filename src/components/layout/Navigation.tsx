"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { ROUTES } from "@/lib/constants";
import { GlobalSearch } from "@/components/shared/GlobalSearch";

const navLinks = [
  { href: ROUTES.home, label: "Home" },
  { href: ROUTES.players, label: "Players" },
  { href: ROUTES.episodes, label: "Episodes" },
  { href: ROUTES.leaderboards, label: "Leaderboards" },
  { href: ROUTES.compare, label: "Compare" },
  { href: ROUTES.records, label: "Records" },
];

export function Navigation() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <nav
      className="sticky top-0 z-40 bg-surface/95 backdrop-blur border-b border-border"
      aria-label="Main navigation"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2" aria-label="Beopardy Stats - Home">
            <span className="text-2xl font-bold font-display text-beo-terracotta">
              Beopardy
            </span>
            <span className="text-sm font-medium text-text-secondary">Stats</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex lg:items-center lg:gap-1" role="menubar">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`
                  px-3 py-2 rounded-lg text-sm font-medium
                  transition-colors duration-200
                  ${
                    isActive(link.href)
                      ? "bg-beo-terracotta/10 text-beo-terracotta"
                      : "text-text-secondary hover:text-foreground hover:bg-beo-cream/30"
                  }
                `}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Search and Mobile Menu */}
          <div className="flex items-center gap-2">
            <GlobalSearch />

            {/* Mobile menu button */}
            <button
              className="lg:hidden p-2 rounded-lg text-text-secondary hover:bg-beo-cream/30"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-menu"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div id="mobile-menu" className="lg:hidden py-4 border-t border-border" role="menu">
            <div className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`
                    px-4 py-3 rounded-lg text-sm font-medium
                    transition-colors duration-200
                    ${
                      isActive(link.href)
                        ? "bg-beo-terracotta/10 text-beo-terracotta"
                        : "text-text-secondary hover:text-foreground hover:bg-beo-cream/30"
                    }
                  `}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
