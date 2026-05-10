import { useState } from "react";
import { SERIES_COLORS } from "../constants";

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
  const [uploadDate, setUploadDate] = useState(
    initial?.uploadDate ? initial.uploadDate.slice(0, 10) : "",
  );
  const [todo, setTodo] = useState(initial?.todo || "");
  const [color, setColor] = useState(initial?.color || SERIES_COLORS[0].value);

  const handleSave = () => {
    if (!name.trim()) return;
    const videoId = videoInput.trim() ? extractVideoId(videoInput) : null;
    const videoChanged = videoId !== initial?.latestVideoId;
    onSave({
      name: name.trim(),
      uploadedPart,
      recordedPart,
      latestVideoId: videoId,
      uploadDate: uploadDate ? new Date(uploadDate).toISOString() : null,
      todo,
      color,
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
                  outline: color === c.value ? `3px solid ${c.value}` : "none",
                  outlineOffset: 2,
                  transform: color === c.value ? "scale(1.2)" : "scale(1)",
                }}
              />
            ))}
          </div>
        </div>

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

        <div style={s.threeCol}>
          <div style={s.field}>
            <label style={s.label}>Recorded</label>
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
            <label style={s.label}>Uploaded</label>
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

        <div style={s.field}>
          <label style={s.label}>Latest video ID or URL</label>
          <input
            style={s.input}
            value={videoInput}
            onChange={(e) => setVideoInput(e.target.value)}
            placeholder="dQw4w9WgXcQ  or  https://youtube.com/watch?v=…"
          />
          <span style={s.hint}>
            Paste after each new upload — resets the 7-day snapshot.
          </span>
        </div>

        <div style={s.field}>
          <label style={s.label}>Upload date</label>
          <input
            style={s.input}
            type="date"
            value={uploadDate}
            onChange={(e) => setUploadDate(e.target.value)}
          />
          <span style={s.hint}>
            Used to calculate the 7-day evaluation window.
          </span>
        </div>

        <div style={s.field}>
          <label style={s.label}>Todo / notes</label>
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
            style={{ ...s.save, opacity: name.trim() ? 1 : 0.4 }}
            disabled={!name.trim()}
            onClick={handleSave}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

const s = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.45)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 999,
    padding: "1rem",
  },
  modal: {
    background: "#fff",
    borderRadius: 14,
    padding: "1.5rem",
    width: "100%",
    maxWidth: 420,
    boxShadow: "0 12px 40px rgba(0,0,0,0.15)",
    maxHeight: "92vh",
    overflowY: "auto",
  },
  title: { fontSize: 16, fontWeight: 700, color: "#111", margin: "0 0 1.1rem" },
  threeCol: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 },
  field: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
    marginBottom: "0.8rem",
  },
  label: {
    fontSize: 11,
    fontWeight: 700,
    color: "#666",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  },
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
  },
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
  hint: { fontSize: 11, color: "#bbb" },
  actions: {
    display: "flex",
    gap: 8,
    justifyContent: "flex-end",
    marginTop: "1rem",
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
  colorGrid: { display: "flex", gap: 8, flexWrap: "wrap" },
  colorSwatch: {
    width: 24,
    height: 24,
    borderRadius: "50%",
    border: "none",
    cursor: "pointer",
    transition: "transform 0.12s",
  },
};
