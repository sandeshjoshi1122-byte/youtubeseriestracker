export default function Header({
  count,
  loading,
  apiError,
  lastRefreshed,
  onAdd,
  onRefresh,
  search,
  onSearch,
}) {
  return (
    <div style={s.wrap}>
      {/* Left: branding */}
      <div style={s.left}>
        <div style={s.logoWrap}>
          <span style={s.logoRect} />
          <span style={s.logoTriangle} />
        </div>
        <div>
          <p style={s.title}>Parts Tracker</p>
          <p style={s.sub}>
            {apiError ? (
              <span style={s.errText} title={apiError}>
                ⚠️ API error — check your key
              </span>
            ) : lastRefreshed ? (
              `Refreshed at ${lastRefreshed.toLocaleTimeString()}`
            ) : (
              "YouTube series tracker"
            )}
          </p>
        </div>
      </div>

      {/* Center: search */}
      <div style={s.searchWrap}>
        <span style={s.searchIcon}>🔍</span>
        <input
          style={s.searchInput}
          placeholder="Search series…"
          value={search}
          onChange={(e) => onSearch(e.target.value)}
        />
        {search && (
          <button style={s.clearBtn} onClick={() => onSearch("")}>
            ✕
          </button>
        )}
      </div>

      {/* Right: actions */}
      <div style={s.right}>
        {count > 0 && <span style={s.badge}>{count}</span>}
        <button
          style={{ ...s.btn, ...s.refreshBtn }}
          onClick={onRefresh}
          disabled={loading}
        >
          {loading ? <span style={s.spinner}>⏳</span> : "↻"}&nbsp;
          {loading ? "Refreshing" : "Refresh"}
        </button>
        <button style={{ ...s.btn, ...s.addBtn }} onClick={onAdd}>
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
    marginBottom: "1.25rem",
    gap: 12,
    flexWrap: "wrap",
    padding: "0.75rem 1rem",
    background: "#fff",
    borderRadius: 12,
    border: "1px solid #ebebeb",
    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
  },
  left: { display: "flex", alignItems: "center", gap: 10 },
  logoWrap: { position: "relative", width: 28, height: 20, flexShrink: 0 },
  logoRect: {
    display: "block",
    width: 28,
    height: 20,
    background: "#FF0000",
    borderRadius: 5,
    position: "absolute",
  },
  logoTriangle: {
    display: "block",
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 0,
    height: 0,
    borderTop: "5px solid transparent",
    borderBottom: "5px solid transparent",
    borderLeft: "9px solid #fff",
  },
  title: {
    fontSize: 15,
    fontWeight: 700,
    color: "#111",
    margin: 0,
    lineHeight: 1,
  },
  sub: { fontSize: 11, color: "#aaa", margin: "2px 0 0", lineHeight: 1 },
  errText: { color: "#dc2626", cursor: "help" },

  searchWrap: {
    flex: 1,
    maxWidth: 300,
    position: "relative",
    display: "flex",
    alignItems: "center",
  },
  searchIcon: {
    position: "absolute",
    left: 10,
    fontSize: 12,
    pointerEvents: "none",
  },
  searchInput: {
    width: "100%",
    padding: "7px 32px 7px 30px",
    border: "1.5px solid #ebebeb",
    borderRadius: 999,
    fontSize: 13,
    outline: "none",
    fontFamily: "inherit",
    background: "#f9fafb",
    color: "#111",
    transition: "border-color 0.15s",
    boxSizing: "border-box",
  },
  clearBtn: {
    position: "absolute",
    right: 8,
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: 11,
    color: "#aaa",
    padding: 2,
  },

  right: { display: "flex", alignItems: "center", gap: 8 },
  badge: {
    background: "#f3f4f6",
    border: "1px solid #e5e7eb",
    borderRadius: 999,
    padding: "2px 9px",
    fontSize: 12,
    color: "#6b7280",
    fontWeight: 600,
  },
  btn: {
    padding: "7px 14px",
    borderRadius: 8,
    fontSize: 13,
    cursor: "pointer",
    fontFamily: "inherit",
    fontWeight: 600,
    whiteSpace: "nowrap",
    display: "flex",
    alignItems: "center",
    gap: 4,
  },
  refreshBtn: {
    border: "1.5px solid #e8e8e8",
    background: "#fff",
    color: "#555",
  },
  addBtn: {
    border: "none",
    background: "#FF0000",
    color: "#fff",
  },
  spinner: { fontSize: 12 },
};
