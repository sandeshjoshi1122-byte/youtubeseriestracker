import { YT_API_KEY } from "../constants";

const BASE = "https://www.googleapis.com/youtube/v3";

/**
 * Fetch stats for multiple video IDs in one API call (1 unit total).
 * Returns a map of { [videoId]: stats }
 */
export async function fetchMultipleVideoStats(videoIds) {
  if (!videoIds.length) return {};
  if (!YT_API_KEY) {
    console.warn("VITE_YOUTUBE_API_KEY is not set.");
    return {};
  }

  const url =
    `${BASE}/videos` +
    `?part=statistics,snippet` +
    `&id=${videoIds.join(",")}` +
    `&key=${YT_API_KEY}`;

  const res = await fetch(url);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `YouTube API ${res.status}`);
  }

  const data = await res.json();
  const map = {};

  for (const item of data.items ?? []) {
    map[item.id] = {
      title: item.snippet.title,
      thumbnail: item.snippet.thumbnails?.medium?.url ?? null,
      publishedAt: item.snippet.publishedAt,
      viewCount: parseInt(item.statistics.viewCount ?? "0", 10),
      likeCount: parseInt(item.statistics.likeCount ?? "0", 10),
      commentCount: parseInt(item.statistics.commentCount ?? "0", 10),
    };
  }

  return map;
}
