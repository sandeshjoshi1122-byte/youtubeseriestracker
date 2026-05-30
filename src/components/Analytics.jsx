import { useMemo, useState } from "react";
import { daysSince, progressPercent } from "../utils/analyzePerformance";
import { VIEW_THRESHOLD } from "../constants";

const WINDOWS = [
  { label: "Last 7 days", days: 7 },
  { label: "Last 15 days", days: 15 },
  { label: "Last 30 days", days: 30 },
];

export default function Analytics({ series }) {
  const [activeWindow, setActiveWindow] = useState(7);

  // Only non-archived series with a video and upload date
  const eligible = useMemo(
    () => series.filter((s) => !s.archived && s.latestVideoId && s.uploadDate),
    [series],
  );

  const windowData = useMemo(() => {
    return WINDOWS.map(({ label, days }) => {
      const videos = eligible
        .filter((s) => daysSince(s.uploadDate) <= days)
        .sort((a, b) => (b.currentViews ?? 0) - (a.currentViews ?? 0));

      const totalViews = videos.reduce(
        (sum, s) => sum + (s.currentViews ?? 0),
        0,
      );
      const totalLikes = videos.reduce((sum, s) => sum + (s.likeCount ?? 0), 0);
      const totalComments = videos.reduce(
        (sum, s) => sum + (s.commentCount ?? 0),
        0,
      );
      const hitGoal = videos.filter(
        (s) => (s.currentViews ?? 0) >= (s.viewThreshold || VIEW_THRESHOLD),
      ).length;
      const avgViews = videos.length
        ? Math.round(totalViews / videos.length)
        : 0;

      return {
        label,
        days,
        videos,
        totalViews,
        totalLikes,
        totalComments,
        hitGoal,
        avgViews,
      };
    });
  }, [eligible]);

  const active = windowData.find((w) => w.days === activeWindow);

  return (
    <div style={s.page}>
      {/* Tab switcher */}
      <div style={s.tabs}>
        {WINDOWS.map(({ label, days }) => (
          <button
            key={days}
            style={{
              ...s.tab,
              background: activeWindow === days ? "#111" : "#fff",
              color: activeWindow === days ? "#fff" : "#666",
              borderColor: activeWindow === days ? "#111" : "#e5e7eb",
            }}
            onClick={() => setActiveWindow(days)}
          >
            {label}
            <span
              style={{
                ...s.tabCount,
                background:
                  activeWindow === days ? "rgba(255,255,255,0.2)" : "#f3f4f6",
                color: activeWindow === days ? "#fff" : "#888",
              }}
            >
              {windowData.find((w) => w.days === days)?.videos.length ?? 0}
            </span>
          </button>
        ))}
      </div>

      {active?.videos.length === 0 ? (
        <div style={s.empty}>
          <div style={s.emptyIcon}>📊</div>
          <p>No videos uploaded in the {active.label.toLowerCase()}.</p>
        </div>
      ) : (
        <>
          {/* Summary cards */}
          <div style={s.summaryGrid}>
            <StatCard
              label="Total views"
              value={active.totalViews.toLocaleString()}
              sub={`across ${active.videos.length} video${active.videos.length !== 1 ? "s" : ""}`}
              color="#3b82f6"
            />
            <StatCard
              label="Avg views / video"
              value={active.avgViews.toLocaleString()}
              sub="mean across window"
              color="#8b5cf6"
            />
            <StatCard
              label="Hit goal"
              value={`${active.hitGoal} / ${active.videos.length}`}
              sub={`reached view threshold`}
              color="#16a34a"
            />
            <StatCard
              label="Total likes"
              value={active.totalLikes.toLocaleString()}
              sub="combined engagement"
              color="#f59e0b"
            />
            <StatCard
              label="Total comments"
              value={active.totalComments.toLocaleString()}
              sub="combined discussion"
              color="#ec4899"
            />
          </div>

          {/* Video rows */}
          <div style={s.tableWrap}>
            <div style={s.tableHeader}>
              <span style={{ flex: 3 }}>Series</span>
              <span style={{ flex: 2 }}>Uploaded</span>
              <span style={{ flex: 2, textAlign: "right" }}>Views</span>
              <span style={{ flex: 2, textAlign: "right" }}>Goal</span>
              <span style={{ flex: 1, textAlign: "right" }}>Likes</span>
              <span style={{ flex: 1, textAlign: "right" }}>Comments</span>
            </div>

            {active.videos.map((s) => {
              const threshold = s.viewThreshold || VIEW_THRESHOLD;
              const views = s.currentViews ?? 0;
              const progress = progressPercent(views, threshold);
              const hitGoal = views >= threshold;
              const daysAgo = daysSince(s.uploadDate);
              const accentColor = s.color || "#e5e7eb";

              return (
                <div key={s.id} style={s2.row}>
                  {/* Color dot + name */}
                  <div style={{ ...s2.cell, flex: 3 }}>
                    <span style={{ ...s2.dot, background: accentColor }} />
                    <div style={s2.nameCol}>
                      <span style={s2.name}>{s.name}</span>
                      {s.videoTitle && (
                        <a
                          href={`https://youtube.com/watch?v=${s.latestVideoId}`}
                          target="_blank"
                          rel="noreferrer"
                          style={s2.videoTitle}
                        >
                          {s.videoTitle.length > 40
                            ? s.videoTitle.slice(0, 40) + "…"
                            : s.videoTitle}
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Days ago */}
                  <div style={{ ...s2.cell, flex: 2 }}>
                    <span style={s2.daysAgo}>
                      {daysAgo === 0
                        ? "Today"
                        : daysAgo === 1
                          ? "Yesterday"
                          : `${daysAgo}d ago`}
                    </span>
                  </div>

                  {/* Views + bar */}
                  <div
                    style={{
                      ...s2.cell,
                      flex: 2,
                      flexDirection: "column",
                      alignItems: "flex-end",
                      gap: 4,
                    }}
                  >
                    <span
                      style={{
                        ...s2.views,
                        color: hitGoal ? "#16a34a" : "#111",
                      }}
                    >
                      {views.toLocaleString()}
                    </span>
                    <div style={s2.miniBarTrack}>
                      <div
                        style={{
                          ...s2.miniBarFill,
                          width: `${progress}%`,
                          background: hitGoal
                            ? "#16a34a"
                            : progress > 50
                              ? "#f59e0b"
                              : "#ef4444",
                        }}
                      />
                    </div>
                  </div>

                  {/* Goal */}
                  <div
                    style={{ ...s2.cell, flex: 2, justifyContent: "flex-end" }}
                  >
                    <span
                      style={{
                        ...s2.goalBadge,
                        background: hitGoal ? "#f0fdf4" : "#fef2f2",
                        color: hitGoal ? "#16a34a" : "#dc2626",
                        border: `1px solid ${hitGoal ? "#bbf7d0" : "#fca5a5"}`,
                      }}
                    >
                      {hitGoal ? "✅" : `${progress}%`} /{" "}
                      {threshold.toLocaleString()}
                    </span>
                  </div>

                  {/* Likes */}
                  <div
                    style={{ ...s2.cell, flex: 1, justifyContent: "flex-end" }}
                  >
                    <span style={s2.stat}>
                      {(s.likeCount ?? 0).toLocaleString()}
                    </span>
                  </div>

                  {/* Comments */}
                  <div
                    style={{ ...s2.cell, flex: 1, justifyContent: "flex-end" }}
                  >
                    <span style={s2.stat}>
                      {(s.commentCount ?? 0).toLocaleString()}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Best + worst performer */}
          {active.videos.length >= 2 && (
            <div style={s.insightsRow}>
              <Insight
                label="🏆 Best performer"
                series={active.videos[0]}
                color="#16a34a"
              />
              <Insight
                label="⚠️ Needs attention"
                series={active.videos[active.videos.length - 1]}
                color="#ef4444"
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}

function StatCard({ label, value, sub, color }) {
  return (
    <div style={sc.card}>
      <div style={{ ...sc.bar, background: color }} />
      <div style={sc.body}>
        <p style={sc.value}>{value}</p>
        <p style={sc.label}>{label}</p>
        <p style={sc.sub}>{sub}</p>
      </div>
    </div>
  );
}

function Insight({ label, series, color }) {
  const threshold = series.viewThreshold || VIEW_THRESHOLD;
  const views = series.currentViews ?? 0;
  return (
    <div style={{ ...si.card, borderColor: color }}>
      <p style={{ ...si.label, color }}>{label}</p>
      <div style={si.row}>
        <span style={{ ...si.dot, background: series.color || "#e5e7eb" }} />
        <span style={si.name}>{series.name}</span>
      </div>
      <p style={si.views}>{views.toLocaleString()} views</p>
      <p style={si.goal}>Goal: {threshold.toLocaleString()}</p>
    </div>
  );
}

// Styles
const s = {
  page: { paddingTop: "0.25rem" },
  tabs: { display: "flex", gap: 8, marginBottom: "1.25rem", flexWrap: "wrap" },
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
  empty: { textAlign: "center", padding: "4rem 1rem", color: "#bbb" },
  emptyIcon: { fontSize: 36, marginBottom: "0.75rem" },

  summaryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
    gap: 10,
    marginBottom: "1.25rem",
  },

  tableWrap: {
    background: "#fff",
    borderRadius: 12,
    border: "1px solid #ebebeb",
    overflow: "hidden",
    marginBottom: "1.25rem",
  },
  tableHeader: {
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

  insightsRow: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 },
};

const s2 = {
  row: {
    display: "flex",
    gap: 8,
    padding: "0.65rem 1rem",
    borderBottom: "1px solid #f5f5f5",
    alignItems: "center",
    transition: "background 0.1s",
  },
  cell: { display: "flex", alignItems: "center", gap: 6 },
  dot: { width: 8, height: 8, borderRadius: "50%", flexShrink: 0 },
  nameCol: { display: "flex", flexDirection: "column", gap: 1, minWidth: 0 },
  name: {
    fontSize: 13,
    fontWeight: 600,
    color: "#111",
    overflow: "hidden",
    whiteSpace: "nowrap",
    textOverflow: "ellipsis",
  },
  videoTitle: {
    fontSize: 11,
    color: "#aaa",
    textDecoration: "none",
    overflow: "hidden",
    whiteSpace: "nowrap",
    textOverflow: "ellipsis",
  },
  daysAgo: { fontSize: 12, color: "#888" },
  views: { fontSize: 14, fontWeight: 700 },
  miniBarTrack: {
    width: 60,
    height: 3,
    background: "#f3f4f6",
    borderRadius: 999,
    overflow: "hidden",
  },
  miniBarFill: {
    height: "100%",
    borderRadius: 999,
    transition: "width 0.5s ease",
  },
  goalBadge: {
    fontSize: 11,
    fontWeight: 600,
    padding: "2px 8px",
    borderRadius: 999,
    whiteSpace: "nowrap",
  },
  stat: { fontSize: 12, color: "#888" },
};

const sc = {
  card: {
    background: "#fff",
    border: "1px solid #ebebeb",
    borderRadius: 10,
    overflow: "hidden",
    display: "flex",
    flexDirection: "row",
    boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
  },
  bar: { width: 4, flexShrink: 0 },
  body: {
    padding: "0.75rem 0.9rem",
    display: "flex",
    flexDirection: "column",
    gap: 2,
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
    color: "#888",
    margin: 0,
    textTransform: "uppercase",
    letterSpacing: "0.04em",
  },
  sub: { fontSize: 10, color: "#bbb", margin: 0 },
};

const si = {
  card: {
    background: "#fff",
    border: "1.5px solid",
    borderRadius: 10,
    padding: "0.85rem 1rem",
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },
  label: {
    fontSize: 11,
    fontWeight: 700,
    margin: 0,
    textTransform: "uppercase",
    letterSpacing: "0.04em",
  },
  row: { display: "flex", alignItems: "center", gap: 6 },
  dot: { width: 8, height: 8, borderRadius: "50%", flexShrink: 0 },
  name: { fontSize: 14, fontWeight: 700, color: "#111" },
  views: { fontSize: 13, color: "#555", margin: 0 },
  goal: { fontSize: 11, color: "#bbb", margin: 0 },
};
