import { VIEW_THRESHOLD, WINDOW_DAYS } from "../constants";

/** How many whole days since a given ISO date string */
export function daysSince(dateStr) {
  if (!dateStr) return 0;
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86_400_000);
}

/** How many days remain in the 7-day window (0 if past it) */
export function daysRemaining(uploadDate) {
  return Math.max(0, WINDOW_DAYS - daysSince(uploadDate));
}

/** 0-100 progress percentage toward the view threshold */
export function progressPercent(views) {
  return Math.min(100, Math.round(((views ?? 0) / VIEW_THRESHOLD) * 100));
}

/**
 * Derive the status of a series based on stored data.
 *
 * Status flow:
 *   no_video     → no video ID linked yet
 *   watching     → within the 7-day evaluation window
 *   active       → hit VIEW_THRESHOLD within 7 days  ✅ continue
 *   revived      → missed 7-day goal but later hit it 💡 consider continuing
 *   discontinued → never hit the goal                🔴 stop
 */
export function analyzeStatus(series) {
  const { latestVideoId, uploadDate, viewsAt7Days, currentViews } = series;

  if (!latestVideoId || !uploadDate) return "no_video";

  const days = daysSince(uploadDate);

  if (days <= WINDOW_DAYS) return "watching";

  // Past the window — use the snapshot we captured on day 7+
  if ((viewsAt7Days ?? 0) >= VIEW_THRESHOLD) return "active";

  // Missed the 7-day goal — did it recover later?
  if ((currentViews ?? 0) >= VIEW_THRESHOLD) return "revived";

  return "discontinued";
}
