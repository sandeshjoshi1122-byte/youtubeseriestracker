import { useState, useEffect, useRef, useCallback } from "react";
import { STORAGE_KEY, WINDOW_DAYS } from "../constants";
import { fetchMultipleVideoStats } from "../api/youtube";
import { daysSince } from "../utils/analyzePerformance";

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

const touch = (x) => ({ ...x, lastUpdated: Date.now() });

function promoteScheduled(list) {
  const now = Date.now();
  return list.map((s) => {
    if (!s.isScheduled || !s.scheduledDate) return s;
    const isPast = new Date(s.scheduledDate).getTime() <= now;
    if (!isPast) return s;
    return {
      ...s,
      isScheduled: false,
      uploadDate: s.scheduledDate,
      scheduledDate: null,
      viewsAt7Days: null,
      currentViews: null,
    };
  });
}

export function useSeries() {
  const [series, setSeries] = useState(() =>
    promoteScheduled(loadFromStorage()),
  );
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [lastRefreshed, setLastRefreshed] = useState(null);

  const seriesRef = useRef(series);
  useEffect(() => {
    seriesRef.current = series;
  }, [series]);
  useEffect(() => saveToStorage(series), [series]);

  const refreshStats = useCallback(async () => {
    // Auto-promote scheduled videos whose date has passed before fetching
    setSeries((prev) => {
      const promoted = promoteScheduled(prev);
      seriesRef.current = promoted;
      return promoted;
    });

    // Small tick so seriesRef is updated before we read it
    await new Promise((r) => setTimeout(r, 0));

    const current = seriesRef.current;
    const withVideo = current.filter(
      (s) => s.latestVideoId && !s.archived && !s.isScheduled,
    );
    if (!withVideo.length) return;

    setLoading(true);
    setApiError(null);

    try {
      const ids = withVideo.map((s) => s.latestVideoId);
      const statsMap = await fetchMultipleVideoStats(ids);

      setSeries((prev) =>
        prev.map((s) => {
          if (!s.latestVideoId || s.isScheduled) return s;
          const stats = statsMap[s.latestVideoId];
          if (!stats) return s;

          const uploadDate = s.uploadDate || stats.publishedAt;
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
  }, []);

  useEffect(() => {
    refreshStats();
  }, [refreshStats]);

  // ── CRUD ──────────────────────────────────────────────────────────────────
  const addSeries = (data) =>
    setSeries((s) => [
      ...s,
      {
        id: Date.now(),
        uploadedPart: 1,
        recordedPart: 1,
        lastUpdated: Date.now(),
        archived: false,
        isScheduled: false,
        ...data,
      },
    ]);

  const updateSeries = (id, data) =>
    setSeries((s) => s.map((x) => (x.id === id ? { ...x, ...data } : x)));

  const removeSeries = (id) => setSeries((s) => s.filter((x) => x.id !== id));

  const archiveSeries = (id) =>
    setSeries((s) =>
      s.map((x) => (x.id === id ? { ...x, archived: true } : x)),
    );

  const unarchiveSeries = (id) =>
    setSeries((s) =>
      s.map((x) => (x.id === id ? { ...x, archived: false } : x)),
    );

  // ── Part counters ─────────────────────────────────────────────────────────
  const incrementUploaded = (id) =>
    setSeries((s) =>
      s.map((x) =>
        x.id === id
          ? touch({ ...x, uploadedPart: (x.uploadedPart ?? 1) + 1 })
          : x,
      ),
    );

  const decrementUploaded = (id) =>
    setSeries((s) =>
      s.map((x) =>
        x.id === id && (x.uploadedPart ?? 1) > 1
          ? touch({ ...x, uploadedPart: x.uploadedPart - 1 })
          : x,
      ),
    );

  const incrementRecorded = (id) =>
    setSeries((s) =>
      s.map((x) =>
        x.id === id
          ? touch({ ...x, recordedPart: (x.recordedPart ?? 1) + 1 })
          : x,
      ),
    );

  const decrementRecorded = (id) =>
    setSeries((s) =>
      s.map((x) =>
        x.id === id && (x.recordedPart ?? 1) > 1
          ? touch({ ...x, recordedPart: x.recordedPart - 1 })
          : x,
      ),
    );

  const updateTodo = (id, value) =>
    setSeries((s) => s.map((x) => (x.id === id ? { ...x, todo: value } : x)));

  return {
    series,
    loading,
    apiError,
    lastRefreshed,
    refreshStats,
    addSeries,
    updateSeries,
    removeSeries,
    archiveSeries,
    unarchiveSeries,
    incrementUploaded,
    decrementUploaded,
    incrementRecorded,
    decrementRecorded,
    updateTodo,
  };
}
