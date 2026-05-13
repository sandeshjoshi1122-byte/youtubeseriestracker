const STATUS_CONFIG = {
  all: { label: "All", emoji: "" },
  upload_next: { label: "Upload Next", emoji: "🚀" },
  watching: { label: "Evaluating", emoji: "👀" },
  active: { label: "Active", emoji: "✅" },
  scheduled: { label: "Scheduled", emoji: "⏰" },
  needs_refresh: { label: "Go Live", emoji: "🔔" },
  revived: { label: "Revived", emoji: "💡" },
  discontinued: { label: "Discontinued", emoji: "🔴" },
  no_video: { label: "No Video", emoji: "🎬" },
  archived: { label: "Archived", emoji: "🗄️" },
};

const PILL_COLORS = {
  all: {
    bg: "#f3f4f6",
    active: "#374151",
    text: "#6b7280",
    activeText: "#fff",
  },
  upload_next: {
    bg: "#f0fdf4",
    active: "#16a34a",
    text: "#16a34a",
    activeText: "#fff",
  },
  watching: {
    bg: "#fefce8",
    active: "#a16207",
    text: "#a16207",
    activeText: "#fff",
  },
  active: {
    bg: "#eff6ff",
    active: "#2563eb",
    text: "#2563eb",
    activeText: "#fff",
  },
  scheduled: {
    bg: "#f5f3ff",
    active: "#6d28d9",
    text: "#6d28d9",
    activeText: "#fff",
  },
  needs_refresh: {
    bg: "#fff7ed",
    active: "#c2410c",
    text: "#c2410c",
    activeText: "#fff",
  },
  revived: {
    bg: "#f0fdf4",
    active: "#166534",
    text: "#166534",
    activeText: "#fff",
  },
  discontinued: {
    bg: "#fef2f2",
    active: "#dc2626",
    text: "#dc2626",
    activeText: "#fff",
  },
  no_video: {
    bg: "#f9fafb",
    active: "#6b7280",
    text: "#9ca3af",
    activeText: "#fff",
  },
  archived: {
    bg: "#f1f5f9",
    active: "#475569",
    text: "#64748b",
    activeText: "#fff",
  },
};

export default function SummaryBar({
  series,
  archivedCount,
  activeFilter,
  onFilter,
}) {
  const counts = series.reduce((acc, s) => {
    acc[s.status] = (acc[s.status] || 0) + 1;
    return acc;
  }, {});
  const total = series.length;
  const tabs = [
    "all",
    "upload_next",
    "watching",
    "active",
    "scheduled",
    "needs_refresh",
    "revived",
    "discontinued",
    "no_video",
    "archived",
  ];

  return (
    <div style={s.wrap}>
      {tabs.map((key) => {
        const count =
          key === "all"
            ? total
            : key === "archived"
              ? archivedCount
              : counts[key] || 0;
        if (key !== "all" && count === 0) return null;

        const cfg = STATUS_CONFIG[key];
        const colors = PILL_COLORS[key];
        const isActive = activeFilter === key;

        return (
          <button
            key={key}
            onClick={() => onFilter(key)}
            style={{
              ...s.pill,
              background: isActive ? colors.active : colors.bg,
              color: isActive ? colors.activeText : colors.text,
              border: `1.5px solid ${isActive ? colors.active : "transparent"}`,
            }}
          >
            {cfg.emoji && <span>{cfg.emoji}</span>}
            <span>{cfg.label}</span>
            <span
              style={{
                ...s.count,
                background: isActive
                  ? "rgba(255,255,255,0.2)"
                  : "rgba(0,0,0,0.08)",
              }}
            >
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
}

const s = {
  wrap: { display: "flex", gap: 6, flexWrap: "wrap", marginBottom: "1rem" },
  pill: {
    display: "inline-flex",
    alignItems: "center",
    gap: 5,
    padding: "5px 11px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "inherit",
    transition: "all 0.15s",
    whiteSpace: "nowrap",
  },
  count: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 999,
    padding: "1px 6px",
    fontSize: 11,
    fontWeight: 700,
  },
};
