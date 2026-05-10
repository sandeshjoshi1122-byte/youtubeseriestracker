import { useState, useEffect, useRef, useCallback } from "react";
import { STORAGE_KEY, WINDOW_DAYS } from "../constants";
import { fetchMultipleVideoStats } from "../api/youtube";
import { daysSince, analyzeStatus } from "../utils/analyzePerformance";

// ── persistence ──────────────────────────────────────────────────────────────

function loadFromStorage() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function saveToStorage(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    return;
  }
}

// ── hook ─────────────────────────────────────────────────────────────────────

export function useSeries() {
  const [series, setSeries] = useState(loadFromStorage);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [lastRefreshed, setLastRefreshed] = useState(null);

  // Keep a ref so refreshStats always sees the latest series
  // without needing it in its dependency array.
  const seriesRef = useRef(series);
  useEffect(() => {
    seriesRef.current = series;
  }, [series]);

  // Persist on every change
  useEffect(() => saveToStorage(series), [series]);

  // ── YouTube refresh ─────────────────────────────────────────────────────

  const refreshStats = useCallback(async () => {
    const current = seriesRef.current;
    const withVideo = current.filter((s) => s.latestVideoId);
    if (!withVideo.length) return;

    setLoading(true);
    setApiError(null);

    try {
      const ids = withVideo.map((s) => s.latestVideoId);
      const statsMap = await fetchMultipleVideoStats(ids);

      setSeries((prev) =>
        prev.map((s) => {
          if (!s.latestVideoId) return s;
          const stats = statsMap[s.latestVideoId];
          if (!stats) return s;

          // Resolve upload date: prefer what the user stored, else use YT's publishedAt
          const uploadDate = s.uploadDate || stats.publishedAt;

          // Snapshot viewsAt7Days exactly once — the first time we fetch
          // after the 7-day window has closed and we don't have a snapshot yet.
          const pastWindow = daysSince(uploadDate) >= WINDOW_DAYS;
          const needsSnapshot = pastWindow && s.viewsAt7Days == null;

          return {
            ...s,
            uploadDate,
            currentViews: stats.viewCount,
            likeCount: stats.likeCount,
            commentCount: stats.commentCount,
            thumbnail: stats.thumbnail,
            videoTitle: stats.title,
            viewsAt7Days: needsSnapshot ? stats.viewCount : s.viewsAt7Days,
          };
        }),
      );

      setLastRefreshed(new Date());
    } catch (err) {
      setApiError(err.message);
    } finally {
      setLoading(false);
    }
  }, []); // stable — uses seriesRef internally

  // Auto-refresh once on mount
  useEffect(() => {
    refreshStats();
  }, [refreshStats]);

  // ── CRUD ────────────────────────────────────────────────────────────────

  const addSeries = (data) =>
    setSeries((s) => [
      ...s,
      { id: Date.now(), part: 1, uploadedPart: 1, ...data },
    ]);

  const updateSeries = (id, data) =>
    setSeries((s) => s.map((x) => (x.id === id ? { ...x, ...data } : x)));

  const removeSeries = (id) => setSeries((s) => s.filter((x) => x.id !== id));

  // ── Part counters ───────────────────────────────────────────────────────

  const incrementPart = (id) =>
    setSeries((s) =>
      s.map((x) => (x.id === id ? { ...x, part: x.part + 1 } : x)),
    );

  const decrementPart = (id) =>
    setSeries((s) =>
      s.map((x) =>
        x.id === id && x.part > 1 ? { ...x, part: x.part - 1 } : x,
      ),
    );

  const incrementUploaded = (id) =>
    setSeries((s) =>
      s.map((x) =>
        x.id === id ? { ...x, uploadedPart: (x.uploadedPart ?? 1) + 1 } : x,
      ),
    );

  const decrementUploaded = (id) =>
    setSeries((s) =>
      s.map((x) =>
        x.id === id && (x.uploadedPart ?? 1) > 1
          ? { ...x, uploadedPart: x.uploadedPart - 1 }
          : x,
      ),
    );

  const updateTodo = (id, value) =>
    setSeries((s) => s.map((x) => (x.id === id ? { ...x, todo: value } : x)));

  // ── Derived: inject computed status ────────────────────────────────────

  const seriesWithStatus = series.map((s) => ({
    ...s,
    status: analyzeStatus(s),
  }));

  return {
    series: seriesWithStatus,
    loading,
    apiError,
    lastRefreshed,
    refreshStats,
    addSeries,
    updateSeries,
    removeSeries,
    incrementPart,
    decrementPart,
    incrementUploaded,
    decrementUploaded,
    updateTodo,
  };
}
