import Link from "next/link";
import Image from "next/image";
import { ROUTES } from "@/lib/constants";

export function Footer() {
  return (
    <footer className="bg-surface border-t border-border mt-auto" role="contentinfo">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <Link href="/" aria-label="Beopardy Stats - Home">
              <Image
                src="/logo.svg"
                alt="Beopardy Stats"
                width={120}
                height={32}
                className="h-8 w-auto"
              />
            </Link>
            <p className="mt-2 text-sm text-text-muted max-w-md">
              Tracking player statistics from the Smosh Pit Beopardy game show.
            </p>
          </div>

          <nav className="flex flex-wrap gap-6 text-sm" aria-label="Footer navigation">
            <Link
              href={ROUTES.players}
              className="text-text-secondary hover:text-beo-terracotta transition-colors"
            >
              Players
            </Link>
            <Link
              href={ROUTES.episodes}
              className="text-text-secondary hover:text-beo-terracotta transition-colors"
            >
              Episodes
            </Link>
            <Link
              href={ROUTES.leaderboards}
              className="text-text-secondary hover:text-beo-terracotta transition-colors"
            >
              Leaderboards
            </Link>
          </nav>
        </div>

        <div className="mt-8 pt-6 border-t border-border">
          <p className="text-xs text-text-muted text-center">
            Made with <span className="text-red-500">♥</span> in Salt Lake City, Utah
          </p>
        </div>
      </div>
    </footer>
  );
}
