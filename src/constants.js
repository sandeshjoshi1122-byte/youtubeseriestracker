export const STORAGE_KEY = "yt-parts-tracker-v2";
export const VIEW_THRESHOLD = 100;
export const WINDOW_DAYS = 7;
export const YT_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;

export const STATUS_ORDER = {
  upload_next: 0,
  watching: 1,
  active: 2,
  revived: 3,
  discontinued: 4,
  no_video: 5,
};

export const SERIES_COLORS = [
  { name: "Red", value: "#ef4444" },
  { name: "Orange", value: "#f97316" },
  { name: "Amber", value: "#f59e0b" },
  { name: "Lime", value: "#84cc16" },
  { name: "Green", value: "#22c55e" },
  { name: "Teal", value: "#14b8a6" },
  { name: "Blue", value: "#3b82f6" },
  { name: "Violet", value: "#8b5cf6" },
  { name: "Pink", value: "#ec4899" },
  { name: "Slate", value: "#94a3b8" },
];

export const STALE_DAYS = 14; // days before a series is considered inactive
