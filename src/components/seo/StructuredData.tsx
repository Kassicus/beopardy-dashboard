interface StructuredDataProps {
  data: object;
}

export function StructuredData({ data }: StructuredDataProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

// Helper functions to generate structured data

export function generateWebsiteSchema(baseUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Beopardy Stats",
    url: baseUrl,
    description: "Track player statistics from the Smosh Pit Beopardy game show",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${baseUrl}/players?search={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function generatePersonSchema(player: {
  name: string;
  slug: string;
  image_url?: string | null;
  total_wins?: number | null;
  total_appearances?: number | null;
}, baseUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: player.name,
    url: `${baseUrl}/players/${player.slug}`,
    ...(player.image_url && { image: player.image_url }),
    description: `Beopardy contestant with ${player.total_wins ?? 0} wins in ${player.total_appearances ?? 0} appearances`,
  };
}

export function generateEpisodeSchema(episode: {
  id: string;
  title: string;
  air_date: string;
  season: number;
  episode_number: number;
  description?: string | null;
  thumbnail_url?: string | null;
  youtube_url?: string | null;
}, baseUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "TVEpisode",
    name: episode.title,
    url: `${baseUrl}/episodes/${episode.id}`,
    datePublished: episode.air_date,
    episodeNumber: episode.episode_number,
    partOfSeason: {
      "@type": "TVSeason",
      seasonNumber: episode.season,
    },
    partOfSeries: {
      "@type": "TVSeries",
      name: "Beopardy",
    },
    ...(episode.description && { description: episode.description }),
    ...(episode.thumbnail_url && { image: episode.thumbnail_url }),
    ...(episode.youtube_url && {
      video: {
        "@type": "VideoObject",
        url: episode.youtube_url,
      },
    }),
  };
}

export function generateBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
