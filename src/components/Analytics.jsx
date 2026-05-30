import { useState, useCallback } from "react";
import {
  fetchUploadsPlaylistId,
  fetchAllUploadedVideoIds,
  fetchVideoStatsBatch,
} from "../api/youtube";
import { VIEW_THRESHOLD } from "../constants";

const CHANNEL_HANDLE = "@gamernbdy";

const WINDOWS = [
  { label: "Last 7 days", days: 7 },
  { label: "Last 15 days", days: 15 },
  { label: "Last 30 days", days: 30 },
];

function getCutoffDate(days) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

function daysAgoLabel(dateStr) {
  const days = Math.floor(
    (Date.now() - new Date(dateStr).getTime()) / 86_400_000,
  );
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  return `${days}d ago`;
}

export default function Analytics() {
  const [activeWindow, setActiveWindow] = useState(30);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasFetched, setHasFetched] = useState(false);
  const [fetchedWindow, setFetchedWindow] = useState(null);
  const [progress, setProgress] = useState("");

  const fetchAnalytics = useCallback(async (days) => {
    setLoading(true);
    setError(null);
    setVideos([]);
    setProgress("Fetching channel info…");

    try {
      // Step 1: get uploads playlist ID
      const playlistId = await fetchUploadsPlaylistId(CHANNEL_HANDLE);

      // Step 2: paginate through uploads, stop when past cutoff
      setProgress("Fetching upload history…");
      const cutoff = getCutoffDate(days);
      const uploaded = await fetchAllUploadedVideoIds(playlistId, cutoff);

      if (!uploaded.length) {
        setVideos([]);
        setHasFetched(true);
        setFetchedWindow(days);
        setProgress("");
        setLoading(false);
        return;
      }

      // Step 3: fetch stats in batches of 50
      setProgress(`Fetching stats for ${uploaded.length} videos…`);
      const ids = uploaded.map((v) => v.videoId);
      const statsMap = await fetchVideoStatsBatch(ids);

      // Step 4: merge publishedAt from playlist with stats
      const merged = uploaded
        .map(({ videoId, publishedAt }) => {
          const stats = statsMap[videoId];
          if (!stats) return null;
          return {
            id: videoId,
            title: stats.title,
            thumbnail: stats.thumbnail,
            publishedAt: publishedAt,
            viewCount: stats.viewCount,
            likeCount: stats.likeCount,
            commentCount: stats.commentCount,
          };
        })
        .filter(Boolean)
        .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));

      setVideos(merged);
      setHasFetched(true);
      setFetchedWindow(days);
    } catch (err) {
      setError(err.message);
    } finally {
      setProgress("");
      setLoading(false);
    }
  }, []);

  const handleWindowChange = (days) => {
    setActiveWindow(days);
    // Always fetch fresh when switching windows
    fetchAnalytics(days);
  };

  // Stats derived from fetched videos
  const totalViews = videos.reduce((s, v) => s + v.viewCount, 0);
  const totalLikes = videos.reduce((s, v) => s + v.likeCount, 0);
  const totalComments = videos.reduce((s, v) => s + v.commentCount, 0);
  const avgViews = videos.length ? Math.round(totalViews / videos.length) : 0;
  const hitGoal = videos.filter((v) => v.viewCount >= VIEW_THRESHOLD).length;
  const topVideo = videos.length
    ? [...videos].sort((a, b) => b.viewCount - a.viewCount)[0]
    : null;
  const lowVideo =
    videos.length > 1
      ? [...videos].sort((a, b) => a.viewCount - b.viewCount)[0]
      : null;

  return (
    <div style={s.page}>
      {/* Window tabs */}
      <div style={s.tabs}>
        {WINDOWS.map(({ label, days }) => {
          const isActive = activeWindow === days;
          return (
            <button
              key={days}
              style={{
                ...s.tab,
                background: isActive ? "#111" : "#fff",
                color: isActive ? "#fff" : "#666",
                borderColor: isActive ? "#111" : "#e5e7eb",
              }}
              onClick={() => handleWindowChange(days)}
              disabled={loading}
            >
              {label}
              {hasFetched && fetchedWindow === days && (
                <span
                  style={{
                    ...s.tabCount,
                    background: isActive ? "rgba(255,255,255,0.2)" : "#f3f4f6",
                    color: isActive ? "#fff" : "#888",
                  }}
                >
                  {videos.length}
                </span>
              )}
            </button>
          );
        })}

        <button
          style={{
            ...s.tab,
            background: "#FF0000",
            color: "#fff",
            borderColor: "#FF0000",
            marginLeft: "auto",
          }}
          onClick={() => fetchAnalytics(activeWindow)}
          disabled={loading}
        >
          {loading ? "⏳ Loading…" : "↻ Refresh"}
        </button>
      </div>

      {/* Initial state — not fetched yet */}
      {!hasFetched && !loading && !error && (
        <div style={s.empty}>
          <div style={s.emptyIcon}>📊</div>
          <p style={s.emptyText}>
            Select a time window above to load your analytics.
          </p>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div style={s.loadingWrap}>
          <div style={s.spinner}>
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                style={{
                  ...s.spinnerBar,
                  animationDelay: `${i * 0.12}s`,
                  height: `${20 + i * 8}px`,
                }}
              />
            ))}
          </div>
          <p style={s.loadingText}>{progress}</p>
        </div>
      )}

      {/* Error state */}
      {error && !loading && (
        <div style={s.errorWrap}>
          <p style={s.errorTitle}>⚠️ Failed to load analytics</p>
          <p style={s.errorMsg}>{error}</p>
          <button
            style={s.retryBtn}
            onClick={() => fetchAnalytics(activeWindow)}
          >
            Try again
          </button>
        </div>
      )}

      {/* Results */}
      {hasFetched && !loading && !error && (
        <>
          {videos.length === 0 ? (
            <div style={s.empty}>
              <div style={s.emptyIcon}>🎬</div>
              <p style={s.emptyText}>
                No videos uploaded in the last {activeWindow} days.
              </p>
            </div>
          ) : (
            <>
              {/* Summary stat cards */}
              <div style={s.summaryGrid}>
                <StatCard
                  label="Videos uploaded"
                  value={videos.length}
                  color="#3b82f6"
                />
                <StatCard
                  label="Total views"
                  value={totalViews.toLocaleString()}
                  color="#8b5cf6"
                />
                <StatCard
                  label="Avg views"
                  value={avgViews.toLocaleString()}
                  color="#f59e0b"
                />
                <StatCard
                  label="Hit 100 views"
                  value={`${hitGoal} / ${videos.length}`}
                  color="#16a34a"
                />
                <StatCard
                  label="Total likes"
                  value={totalLikes.toLocaleString()}
                  color="#ec4899"
                />
                <StatCard
                  label="Total comments"
                  value={totalComments.toLocaleString()}
                  color="#14b8a6"
                />
              </div>

              {/* Best + worst */}
              {videos.length >= 2 && (
                <div style={s.insightsRow}>
                  <InsightCard
                    label="🏆 Best performer"
                    video={topVideo}
                    color="#16a34a"
                  />
                  <InsightCard
                    label="⚠️ Needs attention"
                    video={lowVideo}
                    color="#ef4444"
                  />
                </div>
              )}

              {/* Video table */}
              <div style={s.tableWrap}>
                <div style={s.tableHead}>
                  <span style={{ flex: 4 }}>Video</span>
                  <span style={{ flex: 2 }}>Uploaded</span>
                  <span style={{ flex: 2, textAlign: "right" }}>Views</span>
                  <span style={{ flex: 2, textAlign: "right" }}>Progress</span>
                  <span style={{ flex: 1, textAlign: "right" }}>👍</span>
                  <span style={{ flex: 1, textAlign: "right" }}>💬</span>
                </div>

                {videos.map((video, idx) => {
                  const pct = Math.min(
                    100,
                    Math.round((video.viewCount / VIEW_THRESHOLD) * 100),
                  );
                  const hitGoal = video.viewCount >= VIEW_THRESHOLD;
                  return (
                    <div
                      key={video.id}
                      style={{
                        ...s.row,
                        background: idx % 2 === 0 ? "#fff" : "#fafafa",
                      }}
                    >
                      {/* Thumbnail + title */}
                      <div style={{ ...s.cell, flex: 4, gap: 10 }}>
                        {video.thumbnail && (
                          <img
                            src={video.thumbnail}
                            alt={video.title}
                            style={s.thumb}
                          />
                        )}
                        <div style={s.titleCol}>
                          <a
                            href={`https://youtube.com/watch?v=${video.id}`}
                            target="_blank"
                            rel="noreferrer"
                            style={s.videoTitle}
                          >
                            {video.title.length > 50
                              ? video.title.slice(0, 50) + "…"
                              : video.title}
                          </a>
                        </div>
                      </div>

                      {/* Uploaded */}
                      <div style={{ ...s.cell, flex: 2 }}>
                        <span style={s.daysAgo}>
                          {daysAgoLabel(video.publishedAt)}
                        </span>
                      </div>

                      {/* Views */}
                      <div
                        style={{
                          ...s.cell,
                          flex: 2,
                          justifyContent: "flex-end",
                        }}
                      >
                        <span
                          style={{
                            ...s.views,
                            color: hitGoal ? "#16a34a" : "#111",
                          }}
                        >
                          {video.viewCount.toLocaleString()}
                        </span>
                      </div>

                      {/* Progress bar + % */}
                      <div
                        style={{
                          ...s.cell,
                          flex: 2,
                          justifyContent: "flex-end",
                          gap: 6,
                        }}
                      >
                        <div style={s.barTrack}>
                          <div
                            style={{
                              ...s.barFill,
                              width: `${pct}%`,
                              background: hitGoal
                                ? "#16a34a"
                                : pct > 50
                                  ? "#f59e0b"
                                  : "#ef4444",
                            }}
                          />
                        </div>
                        <span
                          style={{
                            ...s.pct,
                            color: hitGoal ? "#16a34a" : "#aaa",
                          }}
                        >
                          {hitGoal ? "✅" : `${pct}%`}
                        </span>
                      </div>

                      {/* Likes */}
                      <div
                        style={{
                          ...s.cell,
                          flex: 1,
                          justifyContent: "flex-end",
                        }}
                      >
                        <span style={s.stat}>
                          {video.likeCount.toLocaleString()}
                        </span>
                      </div>

                      {/* Comments */}
                      <div
                        style={{
                          ...s.cell,
                          flex: 1,
                          justifyContent: "flex-end",
                        }}
                      >
                        <span style={s.stat}>
                          {video.commentCount.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}

function StatCard({ label, value, color }) {
  return (
    <div style={sc.card}>
      <div style={{ ...sc.bar, background: color }} />
      <div style={sc.body}>
        <p style={sc.value}>{value}</p>
        <p style={sc.label}>{label}</p>
      </div>
    </div>
  );
}

function InsightCard({ label, video, color }) {
  return (
    <div style={{ ...si.card, borderColor: color }}>
      <p style={{ ...si.label, color }}>{label}</p>
      <div style={si.row}>
        {video.thumbnail && (
          <img src={video.thumbnail} alt={video.title} style={si.thumb} />
        )}
        <div style={si.info}>
          <a
            href={`https://youtube.com/watch?v=${video.id}`}
            target="_blank"
            rel="noreferrer"
            style={si.title}
          >
            {video.title.length > 45
              ? video.title.slice(0, 45) + "…"
              : video.title}
          </a>
          <p style={si.views}>{video.viewCount.toLocaleString()} views</p>
        </div>
      </div>
    </div>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const s = {
  page: { paddingTop: "0.25rem" },
  tabs: {
    display: "flex",
    gap: 8,
    marginBottom: "1.25rem",
    flexWrap: "wrap",
    alignItems: "center",
  },
  tab: {
    display: "inline-flex",
    alignItems: "center",
    gap: 7,
    padding: "7px 16px",
    borderRadius: 999,
    border: "1.5px solid",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "inherit",
    transition: "all 0.15s",
  },
  tabCount: {
    fontSize: 11,
    fontWeight: 700,
    borderRadius: 999,
    padding: "1px 7px",
  },

  empty: { textAlign: "center", padding: "4rem 1rem" },
  emptyIcon: { fontSize: 36, marginBottom: "0.75rem" },
  emptyText: { fontSize: 14, color: "#bbb", maxWidth: 300, margin: "0 auto" },

  loadingWrap: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "4rem 1rem",
    gap: 16,
  },
  spinner: { display: "flex", gap: 4, alignItems: "flex-end", height: 60 },
  spinnerBar: {
    width: 6,
    borderRadius: 999,
    background: "#FF0000",
    animation: "bounce 0.6s ease infinite alternate",
  },
  loadingText: { fontSize: 13, color: "#aaa" },

  errorWrap: {
    textAlign: "center",
    padding: "3rem 1rem",
    background: "#fef2f2",
    borderRadius: 12,
    border: "1px solid #fca5a5",
  },
  errorTitle: {
    fontSize: 15,
    fontWeight: 700,
    color: "#b91c1c",
    marginBottom: 6,
  },
  errorMsg: { fontSize: 13, color: "#ef4444", marginBottom: 16 },
  retryBtn: {
    padding: "8px 20px",
    borderRadius: 8,
    border: "none",
    background: "#ef4444",
    color: "#fff",
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 600,
    fontFamily: "inherit",
  },

  summaryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
    gap: 10,
    marginBottom: "1.25rem",
  },

  insightsRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 10,
    marginBottom: "1.25rem",
  },

  tableWrap: {
    background: "#fff",
    borderRadius: 12,
    border: "1px solid #ebebeb",
    overflow: "hidden",
  },
  tableHead: {
    display: "flex",
    gap: 8,
    padding: "0.6rem 1rem",
    background: "#f9fafb",
    borderBottom: "1px solid #ebebeb",
    fontSize: 11,
    fontWeight: 700,
    color: "#aaa",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  },
  row: {
    display: "flex",
    gap: 8,
    padding: "0.6rem 1rem",
    borderBottom: "1px solid #f5f5f5",
    alignItems: "center",
  },
  cell: { display: "flex", alignItems: "center" },
  thumb: {
    width: 64,
    height: 36,
    objectFit: "cover",
    borderRadius: 4,
    flexShrink: 0,
  },
  titleCol: { display: "flex", flexDirection: "column", minWidth: 0 },
  videoTitle: {
    fontSize: 12,
    fontWeight: 600,
    color: "#111",
    textDecoration: "none",
    lineHeight: 1.4,
    overflow: "hidden",
    whiteSpace: "nowrap",
    textOverflow: "ellipsis",
  },
  daysAgo: { fontSize: 12, color: "#888" },
  views: { fontSize: 14, fontWeight: 700 },
  barTrack: {
    width: 56,
    height: 4,
    background: "#f3f4f6",
    borderRadius: 999,
    overflow: "hidden",
  },
  barFill: { height: "100%", borderRadius: 999, transition: "width 0.5s ease" },
  pct: { fontSize: 11, fontWeight: 700, minWidth: 24, textAlign: "right" },
  stat: { fontSize: 12, color: "#888" },
};

const sc = {
  card: {
    background: "#fff",
    border: "1px solid #ebebeb",
    borderRadius: 10,
    overflow: "hidden",
    display: "flex",
    boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
  },
  bar: { width: 4, flexShrink: 0 },
  body: {
    padding: "0.75rem 0.9rem",
    display: "flex",
    flexDirection: "column",
    gap: 3,
  },
  value: {
    fontSize: 20,
    fontWeight: 800,
    color: "#111",
    margin: 0,
    lineHeight: 1,
  },
  label: {
    fontSize: 11,
    fontWeight: 700,
    color: "#aaa",
    margin: 0,
    textTransform: "uppercase",
    letterSpacing: "0.04em",
  },
};

const si = {
  card: {
    background: "#fff",
    border: "1.5px solid",
    borderRadius: 10,
    padding: "0.85rem 1rem",
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  label: {
    fontSize: 11,
    fontWeight: 700,
    margin: 0,
    textTransform: "uppercase",
    letterSpacing: "0.04em",
  },
  row: { display: "flex", alignItems: "center", gap: 10 },
  thumb: {
    width: 80,
    height: 45,
    objectFit: "cover",
    borderRadius: 6,
    flexShrink: 0,
  },
  info: { display: "flex", flexDirection: "column", gap: 3, minWidth: 0 },
  title: {
    fontSize: 13,
    fontWeight: 600,
    color: "#111",
    textDecoration: "none",
    lineHeight: 1.4,
  },
  views: { fontSize: 12, color: "#888", margin: 0 },
};
