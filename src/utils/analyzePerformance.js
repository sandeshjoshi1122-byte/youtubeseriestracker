import { VIEW_THRESHOLD, WINDOW_DAYS, STALE_DAYS } from "../constants";

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

export function analyzeStatus(series) {
  const { latestVideoId, uploadDate, viewsAt7Days, currentViews } = series;

  if (!latestVideoId || !uploadDate) return "no_video";

  const days = daysSince(uploadDate);
  const views = currentViews ?? 0;
  const snap = viewsAt7Days ?? 0;
  const inWindow = days <= WINDOW_DAYS;

  if (views >= VIEW_THRESHOLD) return "upload_next";
  if (inWindow) return "watching";
  if (snap >= VIEW_THRESHOLD) return "active";
  return "discontinued";
}

/** True if the series hasn't had any part bumped in STALE_DAYS */
export function isStale(series) {
  if (!series.lastUpdated) return false;
  return daysSince(new Date(series.lastUpdated).toISOString()) >= STALE_DAYS;
}
