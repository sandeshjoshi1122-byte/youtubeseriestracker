import StatusBadge from "./StatusBadge";
import {
  progressPercent,
  daysRemaining,
  daysSince,
} from "../utils/analyzePerformance";
import { VIEW_THRESHOLD } from "../constants";

// ── Status-aware colour ───────────────────────────────────────────────────────
const PROGRESS_COLOR = {
  active: "#16a34a",
  watching: "#f59e0b",
  revived: "#3b82f6",
  discontinued: "#ef4444",
  no_video: "#d1d5db",
};

// ── Revival message shown on the card ────────────────────────────────────────
const REVIVAL_NOTE =
  "Missed the 7-day goal but views recovered later — consider making more episodes.";

// ── Main component ────────────────────────────────────────────────────────────
export default function SeriesCard({
  item,
  onEdit,
  onDelete,
  onIncrement,
  onDecrement,
  onIncrementUploaded,
  onDecrementUploaded,
  onUpdateTodo,
}) {
  const {
    status,
    latestVideoId,
    thumbnail,
    videoTitle,
    uploadDate,
    currentViews,
    viewsAt7Days,
    likeCount,
    commentCount,
  } = item;

  const views = currentViews ?? 0;
  const progress = progressPercent(views);
  const barColor = PROGRESS_COLOR[status] ?? PROGRESS_COLOR.no_video;
  const inWindow = status === "watching";
  const days = uploadDate ? daysSince(uploadDate) : null;
  const remaining = uploadDate ? daysRemaining(uploadDate) : null;

  return (
    <div style={s.card}>
      {/* ── Thumbnail ──────────────────────────────────────────────────── */}
      {thumbnail ? (
        <a
          href={`https://youtube.com/watch?v=${latestVideoId}`}
          target="_blank"
          rel="noreferrer"
          style={s.thumbLink}
        >
          <img src={thumbnail} alt={videoTitle ?? item.name} style={s.thumb} />
          {inWindow && remaining != null && (
            <div style={s.daysPill}>
              {remaining === 0 ? "Last day!" : `${remaining}d left`}
            </div>
          )}
          {status === "discontinued" && (
            <div style={{ ...s.daysPill, background: "rgba(185,28,28,0.85)" }}>
              Discontinued
            </div>
          )}
        </a>
      ) : (
        /* placeholder when no thumbnail yet */
        latestVideoId && (
          <div style={s.thumbPlaceholder}>
            <span style={{ fontSize: 28, opacity: 0.25 }}>▶</span>
          </div>
        )
      )}

      {/* ── Card header ────────────────────────────────────────────────── */}
      <div style={s.cardTop}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={s.name}>{item.name}</p>
          {videoTitle && (
            <p style={s.videoTitle}>
              {videoTitle.length > 44
                ? videoTitle.slice(0, 44) + "…"
                : videoTitle}
            </p>
          )}
        </div>
        <div style={s.actions}>
          <button style={s.iconBtn} title="Edit" onClick={() => onEdit(item)}>
            ✏️
          </button>
          <button
            style={s.iconBtn}
            title="Delete"
            onClick={() => onDelete(item.id)}
          >
            🗑️
          </button>
        </div>
      </div>

      {/* ── Status badge ───────────────────────────────────────────────── */}
      <div style={s.badgeRow}>
        <StatusBadge status={status} />
      </div>

      {/* ── YouTube stats (only when a video is linked) ─────────────────── */}
      {latestVideoId && (
        <div style={s.statsSection}>
          {/* Views + progress bar */}
          <div style={s.viewsRow}>
            <span style={s.viewsLabel}>Views</span>
            <span style={s.viewsNum}>
              {views.toLocaleString()}
              <span style={s.viewsGoal}> / {VIEW_THRESHOLD}</span>
            </span>
          </div>

          <div style={s.barTrack}>
            <div
              style={{
                ...s.barFill,
                width: `${progress}%`,
                background: barColor,
              }}
            />
          </div>

          {/* Likes + comments */}
          {(likeCount > 0 || commentCount > 0) && (
            <div style={s.engRow}>
              {likeCount > 0 && (
                <span style={s.eng}>👍 {likeCount.toLocaleString()}</span>
              )}
              {commentCount > 0 && (
                <span style={s.eng}>💬 {commentCount.toLocaleString()}</span>
              )}
            </div>
          )}

          {/* Context notes */}
          {inWindow && days != null && (
            <p style={s.note}>
              Day {Math.min(days + 1, 7)} of 7 —&nbsp;
              {remaining === 0
                ? "snapshot will be taken on next refresh"
                : `${remaining} day${remaining !== 1 ? "s" : ""} remaining`}
            </p>
          )}

          {viewsAt7Days != null && !inWindow && (
            <p style={s.note}>
              Views at day 7: <strong>{viewsAt7Days.toLocaleString()}</strong>
            </p>
          )}

          {status === "revived" && (
            <p style={{ ...s.note, color: "#1d4ed8" }}>💡 {REVIVAL_NOTE}</p>
          )}
        </div>
      )}

      {/* ── Part counters ──────────────────────────────────────────────── */}
      <div style={s.partsRow}>
        <PartControl
          label="Current Part"
          value={item.part}
          onInc={() => onIncrement(item.id)}
          onDec={() => onDecrement(item.id)}
          disableDec={item.part <= 1}
        />
        <div style={s.divider} />
        <PartControl
          label="Uploaded Part"
          value={item.uploadedPart ?? 1}
          color="#16a34a"
          onInc={() => onIncrementUploaded(item.id)}
          onDec={() => onDecrementUploaded(item.id)}
          disableDec={(item.uploadedPart ?? 1) <= 1}
        />
      </div>

      {/* ── Todo textarea ───────────────────────────────────────────────── */}
      <div style={s.todoSection}>
        <p style={s.todoLabel}>📝 Todo</p>
        <textarea
          style={s.todoInput}
          rows={2}
          value={item.todo || ""}
          onChange={(e) => onUpdateTodo(item.id, e.target.value)}
          placeholder="Add a note or task…"
        />
      </div>
    </div>
  );
}

// ── Reusable part counter ─────────────────────────────────────────────────────
function PartControl({
  label,
  value,
  color = "#111",
  onInc,
  onDec,
  disableDec,
}) {
  return (
    <div style={s.partBlock}>
      <p style={s.partLabel}>{label}</p>
      <p style={{ ...s.partNum, color }}>{value}</p>
      <div style={s.partControls}>
        <button style={s.incBtn} onClick={onInc}>
          +
        </button>
        <button
          style={{
            ...s.decBtn,
            opacity: disableDec ? 0.3 : 1,
            cursor: disableDec ? "not-allowed" : "pointer",
          }}
          disabled={disableDec}
          onClick={onDec}
        >
          −
        </button>
      </div>
    </div>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const s = {
  card: {
    background: "#fff",
    border: "1px solid #e5e5e5",
    borderRadius: 14,
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
  },

  // Thumbnail
  thumbLink: { display: "block", position: "relative" },
  thumb: {
    width: "100%",
    aspectRatio: "16/9",
    objectFit: "cover",
    display: "block",
  },
  thumbPlaceholder: {
    width: "100%",
    aspectRatio: "16/9",
    background: "#f3f4f6",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  daysPill: {
    position: "absolute",
    bottom: 7,
    right: 7,
    background: "rgba(0,0,0,0.72)",
    color: "#fff",
    fontSize: 11,
    fontWeight: 700,
    padding: "3px 9px",
    borderRadius: 999,
  },

  // Header
  cardTop: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 8,
    padding: "0.85rem 1rem 0",
  },
  name: {
    fontSize: 15,
    fontWeight: 700,
    color: "#111",
    wordBreak: "break-word",
    lineHeight: 1.4,
    margin: 0,
  },
  videoTitle: {
    fontSize: 11,
    color: "#888",
    margin: "2px 0 0",
    lineHeight: 1.4,
  },
  actions: { display: "flex", gap: 2, flexShrink: 0 },
  iconBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: 4,
    borderRadius: 6,
    fontSize: 15,
  },

  badgeRow: { padding: "0.5rem 1rem 0" },

  // Stats
  statsSection: {
    padding: "0.6rem 1rem",
    display: "flex",
    flexDirection: "column",
    gap: 5,
  },
  viewsRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "baseline",
  },
  viewsLabel: {
    fontSize: 11,
    color: "#999",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  },
  viewsNum: { fontSize: 20, fontWeight: 700, color: "#111" },
  viewsGoal: { fontSize: 12, color: "#bbb", fontWeight: 400 },
  barTrack: {
    height: 6,
    background: "#f0f0f0",
    borderRadius: 999,
    overflow: "hidden",
  },
  barFill: { height: "100%", borderRadius: 999, transition: "width 0.5s ease" },
  engRow: { display: "flex", gap: 10 },
  eng: { fontSize: 11, color: "#888" },
  note: { fontSize: 11, color: "#999", margin: 0, lineHeight: 1.5 },

  // Part counters
  partsRow: {
    display: "flex",
    alignItems: "flex-start",
    gap: 10,
    padding: "0.75rem 1rem",
  },
  partBlock: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 4,
  },
  partLabel: {
    fontSize: 9,
    color: "#aaa",
    textTransform: "uppercase",
    letterSpacing: "0.07em",
    margin: 0,
    textAlign: "center",
  },
  partNum: { fontSize: 26, fontWeight: 700, margin: 0, lineHeight: 1 },
  partControls: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 4,
  },
  divider: {
    width: 1,
    background: "#efefef",
    alignSelf: "stretch",
    margin: "4px 0",
  },
  incBtn: {
    width: 30,
    height: 30,
    borderRadius: "50%",
    border: "1px solid #ddd",
    background: "#f5f5f5",
    cursor: "pointer",
    fontSize: 18,
    fontWeight: 700,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#111",
  },
  decBtn: {
    width: 22,
    height: 22,
    borderRadius: "50%",
    border: "1px solid #e5e5e5",
    background: "none",
    fontSize: 14,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#888",
  },

  // Todo
  todoSection: {
    padding: "0 1rem 1rem",
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },
  todoLabel: {
    fontSize: 9,
    color: "#aaa",
    textTransform: "uppercase",
    letterSpacing: "0.07em",
    margin: 0,
  },
  todoInput: {
    width: "100%",
    padding: "7px 10px",
    border: "1px solid #efefef",
    borderRadius: 8,
    fontSize: 12,
    color: "#111",
    fontFamily: "inherit",
    outline: "none",
    background: "#fafafa",
    resize: "none",
    lineHeight: 1.4,
    boxSizing: "border-box",
  },
};
