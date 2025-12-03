import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import { Toaster } from "react-hot-toast";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { BuyMeACoffee } from "@/components/BuyMeACoffee";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Beopardy Stats",
    template: "%s | Beopardy Stats",
  },
  description: "Track player statistics from the Smosh Pit Beopardy game show",
  keywords: ["Beopardy", "Smosh", "Smosh Pit", "game show", "statistics", "leaderboard", "Jeopardy"],
  authors: [{ name: "Beopardy Stats" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Beopardy Stats",
    title: "Beopardy Stats",
    description: "Track player statistics, episode results, and leaderboards from the Smosh Pit Beopardy game show.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Beopardy Stats",
    description: "Track player statistics, episode results, and leaderboards from the Smosh Pit Beopardy game show.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${jakarta.variable} antialiased min-h-screen flex flex-col`}
      >
        <a href="#main-content" className="skip-to-content">
          Skip to main content
        </a>
        <Header />
        <main id="main-content" className="flex-1" role="main">
          {children}
        </main>
        <BuyMeACoffee />
        <Footer />
        <Toaster
          position="bottom-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: "#FFFFFF",
              color: "#1F2937",
              border: "1px solid #E5E7EB",
            },
            success: {
              iconTheme: {
                primary: "#AC4838",
                secondary: "#FFFFFF",
              },
            },
          }}
        />
      </body>
    </html>
  );
}
