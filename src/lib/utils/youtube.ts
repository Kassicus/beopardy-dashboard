/**
 * Extract the video ID from a YouTube URL
 * Supports various YouTube URL formats:
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://youtu.be/VIDEO_ID
 * - https://www.youtube.com/embed/VIDEO_ID
 * - https://www.youtube.com/v/VIDEO_ID
 */
export function extractYouTubeVideoId(url: string): string | null {
  if (!url) return null;

  // Try various patterns
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([^&\s?]+)/,
    /^([a-zA-Z0-9_-]{11})$/, // Just the video ID
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}

/**
 * Generate a YouTube thumbnail URL from a video URL or ID
 * Returns the highest quality thumbnail available
 */
export function getYouTubeThumbnailUrl(
  videoUrlOrId: string,
  quality: "maxres" | "hq" | "mq" | "sd" = "hq"
): string | null {
  const videoId = extractYouTubeVideoId(videoUrlOrId) || videoUrlOrId;

  if (!videoId || videoId.length !== 11) {
    return null;
  }

  const qualityMap = {
    maxres: "maxresdefault", // 1280x720 (may not exist for all videos)
    hq: "hqdefault",         // 480x360
    mq: "mqdefault",         // 320x180
    sd: "sddefault",         // 640x480
  };

  return `https://img.youtube.com/vi/${videoId}/${qualityMap[quality]}.jpg`;
}

/**
 * Get the best available thumbnail URL, with fallbacks
 * Use hqdefault as default since maxresdefault isn't always available
 */
export function getYouTubeThumbnail(videoUrl: string): string | null {
  return getYouTubeThumbnailUrl(videoUrl, "hq");
}
