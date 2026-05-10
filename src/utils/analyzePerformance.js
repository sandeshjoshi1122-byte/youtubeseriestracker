import { VIEW_THRESHOLD, WINDOW_DAYS } from "../constants";

export function daysSince(dateStr) {
  if (!dateStr) return 0;
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86_400_000);
}

export function daysRemaining(uploadDate) {
  return Math.max(0, WINDOW_DAYS - daysSince(uploadDate));
}

export function progressPercent(views) {
  return Math.min(100, Math.round(((views ?? 0) / VIEW_THRESHOLD) * 100));
}

/**
 * Status priority order (highest → lowest):
 *
 *   upload_next  → views crossed VIEW_THRESHOLD at any point — go upload!
 *   watching     → within 7-day window, not yet at threshold
 *   active       → past window, hit threshold within 7 days (already covered by upload_next on first cross)
 *   revived      → missed 7-day goal but total views recovered
 *   discontinued → never hit threshold
 *   no_video     → no video linked yet
 */
export function analyzeStatus(series) {
  const { latestVideoId, uploadDate, viewsAt7Days, currentViews } = series;

  if (!latestVideoId || !uploadDate) return "no_video";

  const days = daysSince(uploadDate);
  const views = currentViews ?? 0;
  const snap = viewsAt7Days ?? 0;
  const inWindow = days <= WINDOW_DAYS;

  // Highest priority: crossed the threshold → prompt to upload next
  if (views >= VIEW_THRESHOLD) return "upload_next";

  if (inWindow) return "watching";

  // Past the window
  if (snap >= VIEW_THRESHOLD) return "active"; // hit it early but since dropped (edge case)
  return "discontinued";
}
