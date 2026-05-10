const CONFIG = {
  upload_next: {
    label: "🚀 Upload Next Part",
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
    bg: "#f0fdf4",
    color: "#15803d",
    border: "#86efac",
  },
  revived: {
    label: "💡 Revived",
    bg: "#eff6ff",
    color: "#1d4ed8",
    border: "#93c5fd",
  },
  discontinued: {
    label: "🔴 Discontinued",
    bg: "#fef2f2",
    color: "#b91c1c",
    border: "#fca5a5",
  },
  no_video: {
    label: "🎬 No video linked",
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
        margin: "5px",
        padding: "3px 10px",
        borderRadius: 999,
        fontSize: 11,
        fontWeight: 700,
        background: cfg.bg,
        color: cfg.color,
        border: `1px solid ${cfg.border}`,
        whiteSpace: "nowrap",
        ...(status === "upload_next" && {
          animation: "pulse 2s infinite",
          fontSize: 12,
        }),
      }}
    >
      {cfg.label}
    </span>
  );
}
