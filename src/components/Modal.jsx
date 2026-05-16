import { useState } from "react";
import { SERIES_COLORS, VIEW_THRESHOLD } from "../constants";

function extractVideoId(raw) {
  try {
    const url = new URL(raw.trim());
    return (
      url.searchParams.get("v") ?? url.pathname.split("/").pop() ?? raw.trim()
    );
  } catch {
    return raw.trim();
  }
}

export default function Modal({ title, initial, onSave, onClose }) {
  const [name, setName] = useState(initial?.name || "");
  const [uploadedPart, setUploadedPart] = useState(initial?.uploadedPart ?? 1);
  const [recordedPart, setRecordedPart] = useState(initial?.recordedPart ?? 1);
  const [videoInput, setVideoInput] = useState(initial?.latestVideoId || "");
  const [todo, setTodo] = useState(initial?.todo || "");
  const [color, setColor] = useState(initial?.color || SERIES_COLORS[6].value);
  const [isScheduled, setIsScheduled] = useState(initial?.isScheduled || false);
  const [viewThreshold, setViewThreshold] = useState(
    initial?.viewThreshold || "",
  );

  // Upload date + time (non-scheduled)
  const [uploadDate, setUploadDate] = useState(
    initial?.uploadDate ? initial.uploadDate.slice(0, 10) : "",
  );
  const [uploadTime, setUploadTime] = useState(
    initial?.uploadDate
      ? new Date(initial.uploadDate).toTimeString().slice(0, 5)
      : "00:00",
  );

  // Scheduled date + time
  const [scheduledDate, setScheduledDate] = useState(
    initial?.scheduledDate ? initial.scheduledDate.slice(0, 10) : "",
  );
  const [scheduledTime, setScheduledTime] = useState(
    initial?.scheduledDate
      ? new Date(initial.scheduledDate).toTimeString().slice(0, 5)
      : "00:00",
  );

  const buildISOString = (date, time) => {
    if (!date) return null;
    const t = time || "00:00";
    return new Date(`${date}T${t}:00`).toISOString();
  };

  const handleSave = () => {
    if (!name.trim()) return;
    if (isScheduled && (!scheduledDate || !scheduledTime)) return; // required

    const videoId = videoInput.trim() ? extractVideoId(videoInput) : null;
    const videoChanged = videoId !== initial?.latestVideoId;

    const resolvedUploadDate = isScheduled
      ? buildISOString(scheduledDate, scheduledTime)
      : buildISOString(uploadDate, null); // no time for regular uploads

    onSave({
      name: name.trim(),
      uploadedPart,
      recordedPart,
      latestVideoId: videoId,
      uploadDate: resolvedUploadDate,
      scheduledDate: isScheduled
        ? buildISOString(scheduledDate, scheduledTime)
        : null,
      todo,
      color,
      isScheduled,
      viewThreshold: viewThreshold ? parseInt(viewThreshold) : null,
      ...(videoChanged && {
        viewsAt7Days: null,
        currentViews: null,
        thumbnail: null,
        videoTitle: null,
      }),
    });
  };

  return (
    <div
      style={s.overlay}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div style={s.modal}>
        {/* Color strip */}
        <div style={{ ...s.colorStrip, background: color }} />

        <div style={s.body}>
          <p style={s.title}>{title}</p>

          {/* Color picker */}
          <div style={s.field}>
            <label style={s.label}>Series color</label>
            <div style={s.colorGrid}>
              {SERIES_COLORS.map((c) => (
                <button
                  key={c.value}
                  title={c.name}
                  onClick={() => setColor(c.value)}
                  style={{
                    ...s.colorSwatch,
                    background: c.value,
                    outline:
                      color === c.value ? `3px solid ${c.value}` : "none",
                    outlineOffset: 2,
                    transform: color === c.value ? "scale(1.25)" : "scale(1)",
                  }}
                />
              ))}
            </div>
          </div>

          {/* Name */}
          <div style={s.field}>
            <label style={s.label}>Series / game name</label>
            <input
              autoFocus
              style={s.input}
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSave()}
              placeholder="e.g. Minecraft Hardcore"
            />
          </div>

          {/* Part counters */}
          <div style={s.twoCol}>
            <div style={s.field}>
              <label style={s.label}>🎬 Recorded</label>
              <input
                style={s.input}
                type="number"
                min="1"
                value={recordedPart}
                onChange={(e) =>
                  setRecordedPart(Math.max(1, parseInt(e.target.value) || 1))
                }
              />
            </div>
            <div style={s.field}>
              <label style={s.label}>📤 Uploaded</label>
              <input
                style={s.input}
                type="number"
                min="1"
                value={uploadedPart}
                onChange={(e) =>
                  setUploadedPart(Math.max(1, parseInt(e.target.value) || 1))
                }
              />
            </div>
          </div>

          {/* Custom view threshold */}
          <div style={s.field}>
            <label style={s.label}>
              Custom view goal (default: {VIEW_THRESHOLD})
            </label>
            <input
              style={s.input}
              type="number"
              min="1"
              value={viewThreshold}
              onChange={(e) => setViewThreshold(e.target.value)}
              placeholder={`Leave empty to use default (${VIEW_THRESHOLD} views)`}
            />
            <span style={s.hint}>
              Override the view threshold for this series only.
            </span>
          </div>

          <div style={s.divider} />

          {/* Video ID */}
          <div style={s.field}>
            <label style={s.label}>Latest video ID or URL</label>
            <input
              style={s.input}
              value={videoInput}
              onChange={(e) => setVideoInput(e.target.value)}
              placeholder="Paste YouTube URL or video ID"
            />
            <span style={s.hint}>
              Paste after each new upload — resets the 7-day snapshot.
            </span>
          </div>

          {/* Scheduled toggle */}
          <div style={s.toggleRow}>
            <div
              style={{
                ...s.toggle,
                background: isScheduled ? "#8b5cf6" : "#e5e7eb",
              }}
              onClick={() => setIsScheduled((v) => !v)}
            >
              <div
                style={{
                  ...s.toggleKnob,
                  transform: isScheduled ? "translateX(16px)" : "translateX(0)",
                }}
              />
            </div>
            <span style={s.toggleText}>
              Video is scheduled (not yet public)
            </span>
          </div>

          {/* Upload date — only when NOT scheduled, no time */}
          {!isScheduled && (
            <div style={s.field}>
              <label style={s.label}>Upload date</label>
              <input
                style={s.dateInput}
                type="date"
                value={uploadDate}
                onChange={(e) => setUploadDate(e.target.value)}
              />
              <span style={s.hint}>
                Used to calculate the 7-day evaluation window.
              </span>
            </div>
          )}

          {/* Scheduled date + time — only when scheduled is ON, time is required */}
          {isScheduled && (
            <div style={s.field}>
              <label style={s.label}>Goes public on</label>
              <div style={s.dateTimeRow}>
                <input
                  style={{ ...s.dateInput, flex: 2 }}
                  type="date"
                  value={scheduledDate}
                  required
                  onChange={(e) => setScheduledDate(e.target.value)}
                />
                <input
                  style={{ ...s.dateInput, flex: 1 }}
                  type="time"
                  value={scheduledTime}
                  required
                  onChange={(e) => setScheduledTime(e.target.value)}
                />
              </div>
              <span style={s.hint}>
                Auto-tracked once this exact date & time passes on next refresh.
              </span>
            </div>
          )}

          {/* Todo */}
          <div style={s.field}>
            <label style={s.label}>Notes / todo</label>
            <textarea
              style={s.textarea}
              rows={3}
              value={todo}
              onChange={(e) => setTodo(e.target.value)}
              placeholder="e.g. Record part 5, add intro music…"
            />
          </div>

          <div style={s.actions}>
            <button style={s.cancel} onClick={onClose}>
              Cancel
            </button>
            <button
              style={{
                ...s.save,
                opacity:
                  name.trim() &&
                  (!isScheduled || (scheduledDate && scheduledTime))
                    ? 1
                    : 0.4,
              }}
              disabled={
                !name.trim() ||
                (isScheduled && (!scheduledDate || !scheduledTime))
              }
              onClick={handleSave}
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const s = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 999,
    padding: "1rem",
  },
  modal: {
    background: "#fff",
    borderRadius: 14,
    overflow: "hidden",
    width: "100%",
    maxWidth: 420,
    boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
    maxHeight: "92vh",
    display: "flex",
    flexDirection: "column",
  },
  colorStrip: { height: 5, flexShrink: 0, transition: "background 0.2s" },
  body: {
    padding: "1.25rem 1.5rem 1.5rem",
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    gap: 0,
  },
  title: { fontSize: 16, fontWeight: 700, color: "#111", margin: "0 0 1rem" },
  twoCol: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 },
  field: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
    marginBottom: "0.85rem",
  },
  label: {
    fontSize: 11,
    fontWeight: 700,
    color: "#888",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  },
  divider: { height: 1, background: "#f3f4f6", margin: "0.25rem 0 1rem" },

  input: {
    padding: "8px 11px",
    border: "1.5px solid #e8e8e8",
    borderRadius: 8,
    fontSize: 13,
    color: "#111",
    outline: "none",
    fontFamily: "inherit",
    background: "#fafafa",
    width: "100%",
    boxSizing: "border-box",
    transition: "border-color 0.15s",
  },
  dateInput: {
    padding: "8px 11px",
    border: "1.5px solid #e8e8e8",
    borderRadius: 8,
    fontSize: 13,
    color: "#111",
    outline: "none",
    fontFamily: "inherit",
    background: "#fafafa",
    boxSizing: "border-box",
    cursor: "pointer",
    colorScheme: "light",
  },
  dateTimeRow: { display: "flex", gap: 8 },
  textarea: {
    padding: "8px 11px",
    border: "1.5px solid #e8e8e8",
    borderRadius: 8,
    fontSize: 13,
    color: "#111",
    outline: "none",
    fontFamily: "inherit",
    background: "#fafafa",
    resize: "none",
    lineHeight: 1.5,
    width: "100%",
    boxSizing: "border-box",
  },
  hint: { fontSize: 11, color: "#bbb", marginTop: 2 },

  colorGrid: { display: "flex", gap: 8, flexWrap: "wrap" },
  colorSwatch: {
    width: 22,
    height: 22,
    borderRadius: "50%",
    border: "none",
    cursor: "pointer",
    transition: "transform 0.12s",
  },

  toggleRow: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    marginBottom: "0.85rem",
  },
  toggle: {
    width: 36,
    height: 20,
    borderRadius: 999,
    position: "relative",
    cursor: "pointer",
    transition: "background 0.2s",
    flexShrink: 0,
  },
  toggleKnob: {
    position: "absolute",
    top: 2,
    left: 2,
    width: 16,
    height: 16,
    borderRadius: "50%",
    background: "#fff",
    boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
    transition: "transform 0.2s",
  },
  toggleText: { fontSize: 13, color: "#444", fontWeight: 500 },

  actions: {
    display: "flex",
    gap: 8,
    justifyContent: "flex-end",
    marginTop: "0.5rem",
  },
  cancel: {
    padding: "8px 18px",
    borderRadius: 8,
    border: "1.5px solid #e8e8e8",
    background: "none",
    color: "#666",
    cursor: "pointer",
    fontSize: 13,
    fontFamily: "inherit",
  },
  save: {
    padding: "8px 22px",
    borderRadius: 8,
    border: "none",
    background: "#FF0000",
    color: "#fff",
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 700,
    fontFamily: "inherit",
  },
};
