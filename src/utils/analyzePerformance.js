import { VIEW_THRESHOLD, WINDOW_DAYS, STALE_DAYS } from "../constants";

export function daysSince(dateStr) {
  if (!dateStr) return 0;
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86_400_000);
}

export function daysUntil(dateStr) {
  if (!dateStr) return 0;
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86_400_000);
}

export function daysRemaining(uploadDate) {
  return Math.max(0, WINDOW_DAYS - daysSince(uploadDate));
}

export function getThreshold(series) {
  return series.viewThreshold || VIEW_THRESHOLD;
}

export function progressPercent(views, threshold) {
  const t = threshold || VIEW_THRESHOLD;
  return Math.min(100, Math.round(((views ?? 0) / t) * 100));
}

export function isStale(series) {
  if (!series.lastUpdated) return false;
  return daysSince(new Date(series.lastUpdated).toISOString()) >= STALE_DAYS;
}

export function timeAgo(ts) {
  if (!ts) return null;
  const mins = Math.floor((Date.now() - ts) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

export function analyzeStatus(series) {
  const {
    latestVideoId,
    uploadDate,
    viewsAt7Days,
    currentViews,
    isScheduled,
    scheduledDate,
  } = series;
  const threshold = getThreshold(series);

  if (isScheduled) {
    const d = scheduledDate ? daysUntil(scheduledDate) : null;
    return d === null || d > 0 ? "scheduled" : "needs_refresh";
  }

  if (!latestVideoId || !uploadDate) return "no_video";

  const days = daysSince(uploadDate);
  const views = currentViews ?? 0;
  const snap = viewsAt7Days ?? 0;
  const inWindow = days <= WINDOW_DAYS;

  if (views >= threshold) return "upload_next";
  if (inWindow) return "watching";
  if (snap >= threshold) return "active";
  return "discontinued";
}
