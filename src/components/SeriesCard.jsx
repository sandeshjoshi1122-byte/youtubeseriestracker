import { useState, useRef, useEffect } from "react";
import StatusBadge from "./StatusBadge";
import {
  progressPercent,
  daysRemaining,
  daysSince,
  daysUntil,
  isStale,
  timeAgo,
} from "../utils/analyzePerformance";
import { VIEW_THRESHOLD } from "../constants";

const BAR_COLOR = {
  upload_next: "#16a34a",
  active: "#3b82f6",
  watching: "#f59e0b",
  scheduled: "#8b5cf6",
  needs_refresh: "#f97316",
  revived: "#16a34a",
  discontinued: "#ef4444",
  no_video: "#e5e7eb",
};

export default function SeriesCard({
  item,
  archived,
  onEdit,
  onDelete,
  onArchive,
  onUnarchive,
  onMarkAsPublic,
  onIncrementUploaded,
  onDecrementUploaded,
  onIncrementRecorded,
  onDecrementRecorded,
  onUpdateTodo,
}) {
  const [confirmAction, setConfirmAction] = useState(null); // "archive" | "delete"
  const [editingTodo, setEditingTodo] = useState(false);
  const [todoValue, setTodoValue] = useState(item.todo || "");
  const [flashKey, setFlashKey] = useState({ rec: 0, upl: 0 });
  const todoRef = useRef(null);
  const threshold = item.viewThreshold || VIEW_THRESHOLD;

  const setTodoRef = (el) => {
    todoRef.current = el;
    if (el) el.focus(); // focuses automatically when the element mounts
  };

  const openTodoEdit = () => {
    setTodoValue(item.todo || ""); // sync value only when user opens edit
    setEditingTodo(true);
  };

  const cancelTodoEdit = () => {
    setTodoValue(item.todo || "");
    setEditingTodo(false);
  };
  const {
    status,
    latestVideoId,
    videoTitle,
    uploadDate,
    currentViews,
    viewsAt7Days,
    likeCount,
    commentCount,
    color,
    isScheduled,
    scheduledDate,
  } = item;

  const views = currentViews ?? 0;
  const progress = progressPercent(views, threshold);
  const barColor = BAR_COLOR[status] ?? BAR_COLOR.no_video;
  const inWindow = status === "watching";
  const isUploadNext = status === "upload_next";
  const needsRefresh = status === "needs_refresh";
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
  const countdownDays = scheduledDate ? daysUntil(scheduledDate) : null;

  const thumbnail =
    item.thumbnail ||
    (item.latestVideoId
      ? `https://i.ytimg.com/vi/${item.latestVideoId}/mqdefault.jpg`
      : null);

  const flash = (field) =>
    setFlashKey((k) => ({ ...k, [field]: k[field] + 1 }));

  const handleIncrementRecorded = (id) => {
    flash("rec");
    onIncrementRecorded(id);
  };
  const handleIncrementUploaded = (id) => {
    flash("upl");
    onIncrementUploaded(id);
  };

  const saveTodo = () => {
    onUpdateTodo(item.id, todoValue);
    setEditingTodo(false);
  };

  return (
    <div
      style={{
        ...s.card,
        ...(stale ? s.staleCard : {}),
        ...(archived ? s.archivedCard : {}),
      }}
    >
      {/* Color accent bar */}
      <div style={{ ...s.accent, background: accentColor }} />

      <div style={s.inner}>
        {/* Thumbnail — show if available regardless of scheduled status */}
        {thumbnail ? (
          <a
            href={
              latestVideoId
                ? `https://youtube.com/watch?v=${latestVideoId}`
                : undefined
            }
            target="_blank"
            rel="noreferrer"
            style={s.thumbLink}
            onClick={(e) => {
              if (!latestVideoId) e.preventDefault();
            }}
          >
            <img
              src={thumbnail}
              alt={videoTitle ?? item.name}
              style={s.thumb}
            />

            {/* Scheduled overlay on top of thumbnail */}
            {isScheduled && (
              <div style={s.scheduledOverlay}>
                <span style={s.scheduledOverlayIcon}>⏰</span>
                <span style={s.scheduledOverlayText}>
                  {countdownDays !== null && countdownDays > 0
                    ? `Goes public in ${countdownDays}d`
                    : "Should be live now"}
                </span>
              </div>
            )}

            {/* Normal pills for non-scheduled */}
            {!isScheduled && inWindow && remaining != null && (
              <div style={s.pill}>
                {remaining === 0 ? "Last day!" : `${remaining}d left`}
              </div>
            )}
            {!isScheduled && isUploadNext && (
              <div style={{ ...s.pill, background: "rgba(21,128,61,0.9)" }}>
                🚀 Upload next!
              </div>
            )}
          </a>
        ) : (
          /* No thumbnail yet — show placeholder */
          <div style={s.scheduledThumb}>
            <div style={s.scheduledInner}>
              <span style={s.scheduledIcon}>{isScheduled ? "⏰" : "▶"}</span>
              {isScheduled && (
                <span style={s.scheduledDays}>
                  {countdownDays !== null && countdownDays > 0
                    ? `Goes public in ${countdownDays}d`
                    : "Should be live now"}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Header: name + actions */}
        <div style={s.header}>
          <div style={s.nameWrap}>
            <span style={{ ...s.colorDot, background: accentColor }} />
            <p style={s.name} title={item.name}>
              {item.name}
            </p>
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
              <>
                <button
                  style={s.iconBtn}
                  title="Restore"
                  onClick={() => onUnarchive(item.id)}
                >
                  ↩️
                </button>
                {confirmAction === "delete" ? (
                  <span style={s.confirmWrap}>
                    <button
                      style={s.confirmYes}
                      onClick={() => {
                        onDelete(item.id);
                        setConfirmAction(null);
                      }}
                    >
                      Delete
                    </button>
                    <button
                      style={s.confirmNo}
                      onClick={() => setConfirmAction(null)}
                    >
                      Cancel
                    </button>
                  </span>
                ) : (
                  <button
                    style={s.iconBtn}
                    title="Delete permanently"
                    onClick={() => setConfirmAction("delete")}
                  >
                    🗑️
                  </button>
                )}
              </>
            ) : confirmAction === "archive" ? (
              <span style={s.confirmWrap}>
                <button
                  style={s.confirmYes}
                  onClick={() => {
                    onArchive(item.id);
                    setConfirmAction(null);
                  }}
                >
                  Archive
                </button>
                <button
                  style={s.confirmNo}
                  onClick={() => setConfirmAction(null)}
                >
                  Cancel
                </button>
              </span>
            ) : (
              <button
                style={s.iconBtn}
                title="Archive"
                onClick={() => setConfirmAction("archive")}
              >
                🗄️
              </button>
            )}
          </div>
        </div>

        {/* Status + badges row */}
        <div style={s.badgeRow}>
          <StatusBadge status={status} />
          {stale && <span style={s.stalePill}>⚠️ {staleDays}d inactive</span>}
        </div>

        {/* Needs-refresh CTA */}
        {needsRefresh && (
          <button
            style={s.markPublicBtn}
            onClick={() => onMarkAsPublic(item.id)}
          >
            🔔 Mark as public — start tracking
          </button>
        )}

        {/* Upload-next banner */}
        {isUploadNext && (
          <div style={s.uploadBanner}>
            🚀 {views.toLocaleString()} views — upload part{" "}
            {(item.uploadedPart ?? 1) + 1}!
          </div>
        )}

        {/* Views + progress */}
        {latestVideoId && !isScheduled && !archived && (
          <div style={s.viewsBlock}>
            <div style={s.viewsRow}>
              <span style={{ ...s.viewsNum, color: barColor }}>
                {views.toLocaleString()}
              </span>
              <span style={s.viewsGoal}>/ {threshold} views</span>
              <span style={s.pct}>{progress}%</span>
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
              {videoTitle && (
                <a
                  href={`https://youtube.com/watch?v=${latestVideoId}`}
                  target="_blank"
                  rel="noreferrer"
                  style={s.videoLink}
                >
                  ↗ Watch
                </a>
              )}
            </div>
          </div>
        )}

        {/* Part counters */}
        {!archived && (
          <div style={s.partsRow}>
            <PartControl
              label="🎬 Rec"
              value={item.recordedPart ?? 1}
              color="#8b5cf6"
              flashKey={flashKey.rec}
              onInc={() => handleIncrementRecorded(item.id)}
              onDec={() => onDecrementRecorded(item.id)}
              disableDec={(item.recordedPart ?? 1) <= 1}
            />
            <div style={s.divider} />
            <PartControl
              label="📤 Upl"
              value={item.uploadedPart ?? 1}
              color={backlog > 0 ? "#f59e0b" : "#16a34a"}
              flashKey={flashKey.upl}
              onInc={() => handleIncrementUploaded(item.id)}
              onDec={() => onDecrementUploaded(item.id)}
              disableDec={(item.uploadedPart ?? 1) <= 1}
            />
          </div>
        )}

        {/* Backlog indicator */}
        {backlog > 0 && !archived && (
          <div style={s.backlogBadge}>
            📦 {backlog} part{backlog > 1 ? "s" : ""} ready to upload
          </div>
        )}

        {/* Inline todo */}
        {!archived && (
          <div style={s.todoArea}>
            {editingTodo ? (
              <div style={s.todoEditWrap}>
                <textarea
                  ref={setTodoRef}
                  style={s.todoInput}
                  rows={2}
                  value={todoValue}
                  onChange={(e) => setTodoValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") {
                      setEditingTodo(false);
                      setTodoValue(item.todo || "");
                    }
                  }}
                  placeholder="Add notes, ideas, tasks…"
                />
                <div style={s.todoActions}>
                  <button style={s.todoSave} onClick={saveTodo}>
                    Save
                  </button>
                  <button style={s.todoCancel} onClick={cancelTodoEdit}>
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div
                style={s.todoDisplay}
                onClick={openTodoEdit}
                title="Click to edit"
              >
                {item.todo ? (
                  <p style={s.todoText}>📝 {item.todo}</p>
                ) : (
                  <p style={s.todoPlaceholder}>+ Add a note…</p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Footer: last updated */}
        {item.lastUpdated && (
          <div style={s.footer}>Updated {timeAgo(item.lastUpdated)}</div>
        )}
      </div>
    </div>
  );
}

function PartControl({
  label,
  value,
  color,
  onInc,
  onDec,
  disableDec,
  flashKey,
}) {
  const [flash, setFlash] = useState(false);
  const prevKey = useRef(flashKey);

  useEffect(() => {
    if (flashKey !== prevKey.current) {
      prevKey.current = flashKey;
      setFlash(true);
      const t = setTimeout(() => setFlash(false), 400);
      return () => clearTimeout(t);
    }
  }, [flashKey]);

  return (
    <div style={s.partBlock}>
      <p style={s.partLabel}>{label}</p>
      <p
        style={{
          ...s.partNum,
          color,
          transition: "transform 0.15s, color 0.15s",
          transform: flash ? "scale(1.35)" : "scale(1)",
        }}
      >
        {value}
      </p>
      <div style={s.partControls}>
        <button style={s.incBtn} onClick={onInc}>
          +
        </button>
        <button
          style={{
            ...s.decBtn,
            opacity: disableDec ? 0.2 : 1,
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
    border: "1px solid #ebebeb",
    borderRadius: 12,
    overflow: "hidden",
    display: "flex",
    boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
    transition: "box-shadow 0.2s, transform 0.2s, border-color 0.2s",
    cursor: "default",
  },
  staleCard: {
    borderColor: "#fde68a",
    boxShadow: "0 0 0 2px rgba(251,191,36,0.15)",
  },
  archivedCard: { opacity: 0.7, background: "#fafafa" },
  accent: { width: 4, flexShrink: 0 },
  inner: { flex: 1, display: "flex", flexDirection: "column", minWidth: 0 },

  // Thumbnail
  thumbLink: { display: "block", position: "relative", overflow: "hidden" },
  thumb: {
    width: "100%",
    height: 95,
    objectFit: "cover",
    display: "block",
    transition: "transform 0.3s",
  },
  pill: {
    position: "absolute",
    bottom: 6,
    right: 6,
    background: "rgba(0,0,0,0.75)",
    color: "#fff",
    fontSize: 10,
    fontWeight: 700,
    padding: "2px 8px",
    borderRadius: 999,
    backdropFilter: "blur(4px)",
  },

  scheduledOverlay: {
    position: "absolute",
    inset: 0,
    background: "rgba(109,40,217,0.55)",
    backdropFilter: "blur(2px)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  scheduledOverlayIcon: { fontSize: 20 },
  scheduledOverlayText: {
    fontSize: 11,
    fontWeight: 700,
    color: "#fff",
    background: "rgba(0,0,0,0.4)",
    padding: "2px 8px",
    borderRadius: 999,
  },

  // Scheduled placeholder
  scheduledThumb: {
    height: 75,
    background: "linear-gradient(135deg, #ede9fe, #f5f3ff)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderBottom: "1px solid #ede9fe",
  },
  scheduledInner: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 4,
  },
  scheduledIcon: { fontSize: 22 },
  scheduledDays: { fontSize: 11, fontWeight: 600, color: "#6d28d9" },

  // Header
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0.5rem 0.65rem 0.15rem",
    gap: 4,
  },
  nameWrap: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    flex: 1,
    minWidth: 0,
  },
  colorDot: { width: 7, height: 7, borderRadius: "50%", flexShrink: 0 },
  name: {
    fontSize: 13,
    fontWeight: 700,
    color: "#111",
    margin: 0,
    overflow: "hidden",
    whiteSpace: "nowrap",
    textOverflow: "ellipsis",
  },
  actions: { display: "flex", alignItems: "center", flexShrink: 0, gap: 1 },
  iconBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: "3px 4px",
    fontSize: 12,
    lineHeight: 1,
    borderRadius: 5,
    transition: "background 0.1s",
  },

  // Confirm inline
  confirmWrap: { display: "flex", alignItems: "center", gap: 4 },
  confirmYes: {
    padding: "2px 7px",
    borderRadius: 5,
    border: "none",
    background: "#ef4444",
    color: "#fff",
    cursor: "pointer",
    fontSize: 10,
    fontWeight: 700,
    fontFamily: "inherit",
  },
  confirmNo: {
    padding: "2px 7px",
    borderRadius: 5,
    border: "1px solid #e5e5e5",
    background: "none",
    color: "#666",
    cursor: "pointer",
    fontSize: 10,
    fontFamily: "inherit",
  },

  // Badges
  badgeRow: {
    display: "flex",
    alignItems: "center",
    gap: 5,
    padding: "0 0.65rem 0.25rem",
  },
  stalePill: {
    fontSize: 10,
    fontWeight: 600,
    color: "#92400e",
    background: "#fffbeb",
    border: "1px solid #fde68a",
    borderRadius: 999,
    padding: "1px 7px",
  },

  // CTA buttons
  markPublicBtn: {
    margin: "0 0.65rem 0.35rem",
    padding: "5px 10px",
    borderRadius: 7,
    background: "#fff7ed",
    color: "#c2410c",
    border: "1px solid #fdba74",
    fontSize: 11,
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "inherit",
    textAlign: "left",
  },
  uploadBanner: {
    margin: "0 0.65rem 0.35rem",
    padding: "5px 10px",
    borderRadius: 7,
    background: "#f0fdf4",
    color: "#15803d",
    border: "1px solid #bbf7d0",
    fontSize: 11,
    fontWeight: 600,
  },

  // Views
  viewsBlock: {
    padding: "0 0.65rem 0.1rem",
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },
  viewsRow: { display: "flex", alignItems: "baseline", gap: 5 },
  viewsNum: {
    fontSize: 18,
    fontWeight: 700,
    lineHeight: 1,
    transition: "color 0.3s",
  },
  viewsGoal: { fontSize: 11, color: "#ccc" },
  pct: { fontSize: 11, fontWeight: 700, color: "#aaa", marginLeft: "auto" },
  barTrack: {
    height: 3,
    background: "#f3f4f6",
    borderRadius: 999,
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    borderRadius: 999,
    transition: "width 0.7s cubic-bezier(0.4,0,0.2,1)",
  },
  metaRow: { display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" },
  meta: { fontSize: 10, color: "#bbb" },
  videoLink: {
    fontSize: 10,
    color: "#3b82f6",
    textDecoration: "none",
    marginLeft: "auto",
  },

  // Parts
  partsRow: {
    display: "flex",
    alignItems: "center",
    padding: "0.35rem 0.65rem 0.15rem",
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
    color: "#bbb",
    textTransform: "uppercase",
    letterSpacing: "0.04em",
    margin: 0,
    whiteSpace: "nowrap",
  },
  partNum: { fontSize: 20, fontWeight: 800, margin: 0, lineHeight: 1 },
  partControls: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 2,
  },
  divider: {
    width: 1,
    background: "#f3f4f6",
    alignSelf: "stretch",
    margin: "2px 0",
  },
  incBtn: {
    width: 22,
    height: 22,
    borderRadius: "50%",
    border: "1px solid #e8e8e8",
    background: "#f8f8f8",
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 700,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#444",
    transition: "background 0.1s, border-color 0.1s",
  },
  decBtn: {
    width: 16,
    height: 16,
    borderRadius: "50%",
    border: "1px solid #f0f0f0",
    background: "none",
    fontSize: 12,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#bbb",
  },

  // Backlog
  backlogBadge: {
    margin: "0 0.65rem 0.25rem",
    fontSize: 10,
    fontWeight: 600,
    color: "#92400e",
    background: "#fffbeb",
    border: "1px solid #fde68a",
    borderRadius: 6,
    padding: "3px 8px",
  },

  // Todo
  todoArea: { padding: "0 0.65rem", marginBottom: "0.35rem" },
  todoDisplay: {
    cursor: "pointer",
    borderRadius: 6,
    padding: "4px 6px",
    transition: "background 0.12s",
  },
  todoText: {
    fontSize: 11,
    color: "#555",
    margin: 0,
    lineHeight: 1.5,
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
  },
  todoPlaceholder: {
    fontSize: 11,
    color: "#ccc",
    margin: 0,
    fontStyle: "italic",
  },
  todoEditWrap: { display: "flex", flexDirection: "column", gap: 5 },
  todoInput: {
    width: "100%",
    padding: "6px 8px",
    border: "1.5px solid #6366f1",
    borderRadius: 6,
    fontSize: 11,
    fontFamily: "inherit",
    color: "#111",
    background: "#fff",
    resize: "none",
    outline: "none",
    lineHeight: 1.5,
    boxSizing: "border-box",
  },
  todoActions: { display: "flex", gap: 5 },
  todoSave: {
    padding: "3px 10px",
    borderRadius: 5,
    border: "none",
    background: "#6366f1",
    color: "#fff",
    cursor: "pointer",
    fontSize: 11,
    fontWeight: 600,
    fontFamily: "inherit",
  },
  todoCancel: {
    padding: "3px 10px",
    borderRadius: 5,
    border: "1px solid #e5e5e5",
    background: "none",
    color: "#666",
    cursor: "pointer",
    fontSize: 11,
    fontFamily: "inherit",
  },

  // Footer
  footer: {
    fontSize: 10,
    color: "#ddd",
    padding: "0.2rem 0.65rem 0.45rem",
    borderTop: "1px solid #f9f9f9",
    marginTop: "auto",
  },
};
