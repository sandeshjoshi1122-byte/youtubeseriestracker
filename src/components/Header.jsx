export default function Header({
  count,
  loading,
  apiError,
  lastRefreshed,
  onAdd,
  onRefresh,
}) {
  return (
    <div style={s.wrap}>
      <div style={s.left}>
        <span style={s.dot} />
        <div>
          <p style={s.title}>YouTube Parts Tracker</p>
          <p style={s.sub}>
            {lastRefreshed
              ? `Last refreshed ${lastRefreshed.toLocaleTimeString()}`
              : "Track series performance with the YouTube API"}
          </p>
        </div>
      </div>

      <div style={s.right}>
        {apiError && (
          <span style={s.error} title={apiError}>
            ⚠️ API error
          </span>
        )}
        {count > 0 && <span style={s.badge}>{count} series</span>}
        <button style={s.refreshBtn} onClick={onRefresh} disabled={loading}>
          {loading ? "⏳ Refreshing…" : "🔄 Refresh"}
        </button>
        <button style={s.addBtn} onClick={onAdd}>
          + Add series
        </button>
      </div>
    </div>
  );
}

const s = {
  wrap: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "1.5rem",
    gap: 12,
    flexWrap: "wrap",
  },
  left: { display: "flex", alignItems: "center", gap: 10 },
  dot: {
    width: 11,
    height: 11,
    borderRadius: "50%",
    background: "#FF0000",
    flexShrink: 0,
  },
  title: { fontSize: 18, fontWeight: 700, color: "#111", margin: 0 },
  sub: { fontSize: 12, color: "#888", margin: "2px 0 0" },
  right: { display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" },
  badge: {
    background: "#f3f3f3",
    border: "1px solid #e5e5e5",
    borderRadius: 999,
    padding: "2px 10px",
    fontSize: 12,
    color: "#666",
  },
  error: {
    background: "#fee2e2",
    color: "#b91c1c",
    borderRadius: 999,
    padding: "2px 10px",
    fontSize: 12,
    cursor: "help",
  },
  refreshBtn: {
    padding: "7px 14px",
    borderRadius: 8,
    border: "1px solid #ddd",
    background: "#fff",
    color: "#333",
    fontSize: 13,
    cursor: "pointer",
    fontFamily: "inherit",
    whiteSpace: "nowrap",
  },
  addBtn: {
    background: "#FF0000",
    color: "#fff",
    border: "none",
    padding: "8px 16px",
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "inherit",
  },
};
