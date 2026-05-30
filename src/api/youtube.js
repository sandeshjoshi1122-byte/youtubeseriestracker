import { YT_API_KEY } from "../constants";

const BASE = "https://www.googleapis.com/youtube/v3";

// ── Existing function (keep this, used by useSeries) ─────────────────────────
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

// ── Get channel uploads playlist ID from handle ───────────────────────────────
export async function fetchUploadsPlaylistId(handle) {
  if (!YT_API_KEY) throw new Error("VITE_YOUTUBE_API_KEY is not set.");

  const url =
    `${BASE}/channels` +
    `?part=contentDetails` +
    `&forHandle=${encodeURIComponent(handle)}` +
    `&key=${YT_API_KEY}`;

  const res = await fetch(url);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `YouTube API ${res.status}`);
  }

  const data = await res.json();
  const playlistId = data.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;
  if (!playlistId)
    throw new Error("Could not find uploads playlist for this channel.");
  return playlistId;
}

// ── Fetch all video IDs from uploads playlist (paginated) ─────────────────────
// Stops paginating once all videos on a page are older than cutoffDate
export async function fetchAllUploadedVideoIds(playlistId, cutoffDate) {
  if (!YT_API_KEY) throw new Error("VITE_YOUTUBE_API_KEY is not set.");

  const videoIds = [];
  let pageToken = null;
  let keepGoing = true;
  const cutoffTime = new Date(cutoffDate).getTime();

  while (keepGoing) {
    const url =
      `${BASE}/playlistItems` +
      `?part=snippet` +
      `&playlistId=${playlistId}` +
      `&maxResults=50` +
      (pageToken ? `&pageToken=${pageToken}` : "") +
      `&key=${YT_API_KEY}`;

    const res = await fetch(url);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.error?.message || `YouTube API ${res.status}`);
    }

    const data = await res.json();
    const items = data.items ?? [];

    for (const item of items) {
      const publishedAt = item.snippet?.publishedAt;
      const videoId = item.snippet?.resourceId?.videoId;

      if (!publishedAt || !videoId) continue;

      // Stop if this video is older than our cutoff
      if (new Date(publishedAt).getTime() < cutoffTime) {
        keepGoing = false;
        break;
      }

      videoIds.push({ videoId, publishedAt });
    }

    // No more pages or we've gone past the cutoff
    if (!data.nextPageToken || !keepGoing) break;
    pageToken = data.nextPageToken;
  }

  return videoIds;
}

// ── Fetch full stats for a list of video IDs in batches of 50 ─────────────────
export async function fetchVideoStatsBatch(videoIds) {
  if (!videoIds.length) return {};
  if (!YT_API_KEY) throw new Error("VITE_YOUTUBE_API_KEY is not set.");

  const results = {};

  // Split into chunks of 50 (API limit per request)
  for (let i = 0; i < videoIds.length; i += 50) {
    const chunk = videoIds.slice(i, i + 50);
    const url =
      `${BASE}/videos` +
      `?part=statistics,snippet` +
      `&id=${chunk.join(",")}` +
      `&key=${YT_API_KEY}`;

    const res = await fetch(url);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.error?.message || `YouTube API ${res.status}`);
    }

    const data = await res.json();

    for (const item of data.items ?? []) {
      results[item.id] = {
        id: item.id,
        title: item.snippet.title,
        thumbnail: item.snippet.thumbnails?.medium?.url ?? null,
        publishedAt: item.snippet.publishedAt,
        viewCount: parseInt(item.statistics.viewCount ?? "0", 10),
        likeCount: parseInt(item.statistics.likeCount ?? "0", 10),
        commentCount: parseInt(item.statistics.commentCount ?? "0", 10),
      };
    }
  }

  return results;
}
