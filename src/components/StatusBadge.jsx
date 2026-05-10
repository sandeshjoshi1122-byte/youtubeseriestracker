const CONFIG = {
  active: {
    label: "✅ Active",
    bg: "#dcfce7",
    color: "#15803d",
    tip: "Hit 100 views within 7 days — keep going!",
  },
  watching: {
    label: "👀 Evaluating",
    bg: "#fef9c3",
    color: "#a16207",
    tip: "Within the 7-day window — checking performance",
  },
  revived: {
    label: "💡 Revived",
    bg: "#dbeafe",
    color: "#1d4ed8",
    tip: "Missed 7-day goal but recovered — consider more episodes",
  },
  discontinued: {
    label: "🔴 Discontinued",
    bg: "#fee2e2",
    color: "#b91c1c",
    tip: "Didn't reach 100 views in 7 days and hasn't recovered",
  },
  no_video: {
    label: "🎬 No video",
    bg: "#f3f4f6",
    color: "#6b7280",
    tip: "Paste a video ID to start tracking",
  },
};

export default function StatusBadge({ status }) {
  const cfg = CONFIG[status] ?? CONFIG.no_video;
  return (
    <span
      title={cfg.tip}
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "3px 9px",
        borderRadius: 999,
        fontSize: 11,
        fontWeight: 600,
        background: cfg.bg,
        color: cfg.color,
        whiteSpace: "nowrap",
        cursor: "help",
      }}
    >
      {cfg.label}
    </span>
  );
}
