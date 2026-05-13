const CONFIG = {
  upload_next: {
    label: "🚀 Upload Next",
    bg: "#f0fdf4",
    color: "#15803d",
    border: "#86efac",
  },
  watching: {
    label: "👀 Evaluating",
    bg: "#fefce8",
    color: "#a16207",
    border: "#fde047",
  },
  active: {
    label: "✅ Active",
    bg: "#eff6ff",
    color: "#1d4ed8",
    border: "#93c5fd",
  },
  scheduled: {
    label: "⏰ Scheduled",
    bg: "#f5f3ff",
    color: "#6d28d9",
    border: "#c4b5fd",
  },
  needs_refresh: {
    label: "🔔 Mark as Public",
    bg: "#fff7ed",
    color: "#c2410c",
    border: "#fdba74",
  },
  revived: {
    label: "💡 Revived",
    bg: "#f0fdf4",
    color: "#166534",
    border: "#86efac",
  },
  discontinued: {
    label: "🔴 Discontinued",
    bg: "#fef2f2",
    color: "#b91c1c",
    border: "#fca5a5",
  },
  no_video: {
    label: "🎬 No Video",
    bg: "#f9fafb",
    color: "#6b7280",
    border: "#e5e7eb",
  },
};

export default function StatusBadge({ status }) {
  const cfg = CONFIG[status] ?? CONFIG.no_video;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "2px 8px",
        borderRadius: 999,
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: "0.01em",
        background: cfg.bg,
        color: cfg.color,
        border: `1px solid ${cfg.border}`,
        whiteSpace: "nowrap",
      }}
    >
      {cfg.label}
    </span>
  );
}
