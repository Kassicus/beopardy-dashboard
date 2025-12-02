import { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient();
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://beopardy-stats.vercel.app";

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/players`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/episodes`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/leaderboards`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/compare`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/records`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.7,
    },
  ];

  // Fetch all players for dynamic pages
  const { data: players } = await supabase
    .from("players")
    .select("slug, updated_at")
    .order("updated_at", { ascending: false });

  const playerPages: MetadataRoute.Sitemap = (players ?? []).map((player) => ({
    url: `${baseUrl}/players/${player.slug}`,
    lastModified: player.updated_at ? new Date(player.updated_at) : new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  // Fetch all episodes for dynamic pages
  const { data: episodes } = await supabase
    .from("episodes")
    .select("id, updated_at")
    .order("updated_at", { ascending: false });

  const episodePages: MetadataRoute.Sitemap = (episodes ?? []).map((episode) => ({
    url: `${baseUrl}/episodes/${episode.id}`,
    lastModified: episode.updated_at ? new Date(episode.updated_at) : new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.5,
  }));

  return [...staticPages, ...playerPages, ...episodePages];
}
