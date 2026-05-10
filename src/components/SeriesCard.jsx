import StatusBadge from "./StatusBadge";
import {
  progressPercent,
  daysRemaining,
  daysSince,
  isStale,
} from "../utils/analyzePerformance";
import { VIEW_THRESHOLD } from "../constants";

const BAR_COLOR = {
  upload_next: "#16a34a",
  active: "#16a34a",
  watching: "#f59e0b",
  revived: "#8b5cf6",
  discontinued: "#ef4444",
  no_video: "#e5e7eb",
};

export default function SeriesCard({
  item,
  onEdit,
  onDelete,
  onArchive,
  onUnarchive,
  onIncrementUploaded,
  onDecrementUploaded,
  onIncrementRecorded,
  onDecrementRecorded,
  // onUpdateTodo,
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
    color,
    todo,
    archived,
  } = item;

  const views = currentViews ?? 0;
  const progress = progressPercent(views);
  const barColor = BAR_COLOR[status] ?? BAR_COLOR.no_video;
  const inWindow = status === "watching";
  const isUploadNext = status === "upload_next";
  const days = uploadDate ? daysSince(uploadDate) : null;
  const remaining = uploadDate ? daysRemaining(uploadDate) : null;
  const backlog = Math.max(
    0,
    (item.recordedPart ?? 1) - (item.uploadedPart ?? 1),
  );
  const accentColor = color || "#e5e7eb";
  const stale = !archived && isStale(item);
  const staleDays = item.lastUpdated
    ? daysSince(new Date(item.lastUpdated).toISOString())
    : null;

  return (
    <div style={{ ...s.card, ...(stale ? s.staleCard : {}) }}>
      {/* Colored left border */}
      <div style={{ ...s.accent, background: accentColor }} />

      <div style={s.inner}>
        {/* Thumbnail */}
        {thumbnail && (
          <a
            href={`https://youtube.com/watch?v=${latestVideoId}`}
            target="_blank"
            rel="noreferrer"
            style={s.thumbLink}
          >
            <img
              src={thumbnail}
              alt={videoTitle ?? item.name}
              style={s.thumb}
            />
            {inWindow && remaining != null && (
              <div style={s.pill}>
                {remaining === 0 ? "Last day!" : `${remaining}d left`}
              </div>
            )}
          </a>
        )}

        {/* Name + actions */}
        <div style={s.topRow}>
          <div style={s.nameWrap}>
            <span style={{ ...s.colorDot, background: accentColor }} />
            <p style={s.name}>{item.name}</p>
          </div>
          <div style={s.actions}>
            {!archived && (
              <button
                style={s.iconBtn}
                title="Edit"
                onClick={() => onEdit(item)}
              >
                ✏️
              </button>
            )}
            {archived ? (
              <button
                style={s.iconBtn}
                title="Restore"
                onClick={() => onUnarchive(item.id)}
              >
                ↩️
              </button>
            ) : (
              <button
                style={s.iconBtn}
                title="Archive"
                onClick={() => onArchive(item.id)}
              >
                🗄️
              </button>
            )}
            <button
              style={s.iconBtn}
              title="Delete permanently"
              onClick={() => onDelete(item.id)}
            >
              🗑️
            </button>
          </div>
        </div>

        {/* Stale warning */}
        {stale && (
          <div style={s.staleWarning}>⚠️ Inactive for {staleDays} days</div>
        )}

        {/* Archived banner */}
        {archived && (
          <div style={s.archivedBanner}>🗄️ Archived — hit ↩️ to restore</div>
        )}

        {/* Status badge */}
        {!archived && <StatusBadge status={status} />}

        {/* Upload next banner */}
        {isUploadNext && !archived && (
          <div style={s.banner}>
            🚀 Ready — upload part {(item.uploadedPart ?? 1) + 1}!
          </div>
        )}

        {/* Views + progress */}
        {latestVideoId && !archived && (
          <div style={s.viewsBlock}>
            <div style={s.viewsRow}>
              <span style={s.viewsNum}>{views.toLocaleString()}</span>
              <span style={s.viewsSlash}>/</span>
              <span style={s.viewsGoal}>{VIEW_THRESHOLD}</span>
              <span style={{ ...s.pct, color: barColor }}>{progress}%</span>
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
            <div style={s.metaRow}>
              {likeCount > 0 && (
                <span style={s.meta}>👍 {likeCount.toLocaleString()}</span>
              )}
              {commentCount > 0 && (
                <span style={s.meta}>💬 {commentCount.toLocaleString()}</span>
              )}
              {inWindow && days != null && (
                <span style={s.meta}>Day {Math.min(days + 1, 7)}/7</span>
              )}
              {viewsAt7Days != null && !inWindow && (
                <span style={s.meta}>
                  Day-7: {viewsAt7Days.toLocaleString()}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Part counters */}
        {!archived && (
          <div style={s.partsRow}>
            <PartControl
              label="Recorded"
              value={item.recordedPart ?? 1}
              color="#8b5cf6"
              onInc={() => onIncrementRecorded(item.id)}
              onDec={() => onDecrementRecorded(item.id)}
              disableDec={(item.recordedPart ?? 1) <= 1}
            />
            <div style={s.divider} />
            <PartControl
              label="Uploaded"
              value={item.uploadedPart ?? 1}
              color={backlog > 0 ? "#f59e0b" : "#16a34a"}
              onInc={() => onIncrementUploaded(item.id)}
              onDec={() => onDecrementUploaded(item.id)}
              disableDec={(item.uploadedPart ?? 1) <= 1}
            />
          </div>
        )}

        {/* Backlog */}
        {backlog > 0 && !archived && (
          <div style={s.backlogBadge}>
            📦 {backlog} part{backlog > 1 ? "s" : ""} recorded, not yet uploaded
          </div>
        )}

        {/* Todo */}
        {todo && !archived && <p style={s.todoText}>📝 {todo}</p>}
      </div>
    </div>
  );
}

function PartControl({ label, value, color, onInc, onDec, disableDec }) {
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
            opacity: disableDec ? 0.25 : 1,
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

const s = {
  card: {
    background: "#fff",
    border: "1px solid #ececec",
    borderRadius: 10,
    overflow: "hidden",
    display: "flex",
    flexDirection: "row",
    boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
    transition: "border-color 0.2s",
  },
  staleCard: {
    border: "1px solid #fde68a",
    boxShadow: "0 1px 4px rgba(251,191,36,0.15)",
  },
  accent: { width: 4, flexShrink: 0 },
  inner: { flex: 1, display: "flex", flexDirection: "column", minWidth: 0 },

  thumbLink: { display: "block", position: "relative" },
  thumb: { width: "100%", height: 90, objectFit: "cover", display: "block" },
  pill: {
    position: "absolute",
    bottom: 5,
    right: 5,
    background: "rgba(0,0,0,0.7)",
    color: "#fff",
    fontSize: 10,
    fontWeight: 700,
    padding: "2px 7px",
    borderRadius: 999,
  },

  topRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 4,
    padding: "0.55rem 0.65rem 0.2rem",
  },
  nameWrap: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    flex: 1,
    minWidth: 0,
  },
  colorDot: { width: 8, height: 8, borderRadius: "50%", flexShrink: 0 },
  name: {
    fontSize: 13,
    fontWeight: 700,
    color: "#111",
    margin: 0,
    overflow: "hidden",
    whiteSpace: "nowrap",
    textOverflow: "ellipsis",
  },
  actions: { display: "flex", flexShrink: 0 },
  iconBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: "2px 3px",
    fontSize: 12,
    lineHeight: 1,
  },

  // Warnings / banners
  staleWarning: {
    margin: "0 0.65rem 0.2rem",
    background: "#fffbeb",
    color: "#92400e",
    fontSize: 11,
    fontWeight: 600,
    padding: "3px 8px",
    borderRadius: 6,
    border: "1px solid #fde68a",
  },
  archivedBanner: {
    margin: "0 0.65rem 0.4rem",
    background: "#f1f5f9",
    color: "#475569",
    fontSize: 11,
    fontWeight: 600,
    padding: "3px 8px",
    borderRadius: 6,
    border: "1px solid #e2e8f0",
  },
  banner: {
    margin: "4px 0.65rem 0",
    background: "#f0fdf4",
    color: "#15803d",
    fontSize: 11,
    fontWeight: 600,
    padding: "4px 8px",
    borderRadius: 6,
    border: "1px solid #bbf7d0",
  },

  viewsBlock: {
    padding: "0.3rem 0.65rem 0",
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },
  viewsRow: { display: "flex", alignItems: "baseline", gap: 4 },
  viewsNum: { fontSize: 17, fontWeight: 700, color: "#111", lineHeight: 1 },
  viewsSlash: { fontSize: 12, color: "#ddd" },
  viewsGoal: { fontSize: 12, color: "#ccc" },
  pct: { fontSize: 11, fontWeight: 700, marginLeft: "auto" },
  barTrack: {
    height: 3,
    background: "#f3f4f6",
    borderRadius: 999,
    overflow: "hidden",
  },
  barFill: { height: "100%", borderRadius: 999, transition: "width 0.6s ease" },
  metaRow: { display: "flex", gap: 8, flexWrap: "wrap" },
  meta: { fontSize: 10, color: "#bbb" },

  partsRow: {
    display: "flex",
    alignItems: "center",
    padding: "0.4rem 0.65rem 0.3rem",
    gap: 6,
  },
  partBlock: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 2,
  },
  partLabel: {
    fontSize: 9,
    color: "#ccc",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    margin: 0,
    whiteSpace: "nowrap",
  },
  partNum: { fontSize: 19, fontWeight: 700, margin: 0, lineHeight: 1 },
  partControls: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 2,
  },
  divider: { width: 1, background: "#f3f4f6", alignSelf: "stretch" },
  incBtn: {
    width: 20,
    height: 20,
    borderRadius: "50%",
    border: "1px solid #e8e8e8",
    background: "#f8f8f8",
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 700,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#444",
  },
  decBtn: {
    width: 15,
    height: 15,
    borderRadius: "50%",
    border: "1px solid #f0f0f0",
    background: "none",
    fontSize: 11,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#aaa",
  },

  backlogBadge: {
    margin: "0 0.65rem 0.3rem",
    fontSize: 10,
    color: "#92400e",
    background: "#fffbeb",
    border: "1px solid #fde68a",
    borderRadius: 5,
    padding: "3px 7px",
    fontWeight: 600,
  },
  todoText: {
    margin: "0 0.65rem 0.55rem",
    fontSize: 11,
    color: "#888",
    lineHeight: 1.4,
    overflow: "hidden",
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
  },
};
