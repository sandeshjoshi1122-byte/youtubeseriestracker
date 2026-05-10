import { useState } from "react";

/** Accepts a full YouTube URL or a bare video ID */
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
  const [part, setPart] = useState(initial?.part ?? 1);
  const [uploadedPart, setUploadedPart] = useState(initial?.uploadedPart ?? 1);
  const [videoInput, setVideoInput] = useState(initial?.latestVideoId || "");
  const [uploadDate, setUploadDate] = useState(
    initial?.uploadDate ? initial.uploadDate.slice(0, 10) : "",
  );
  const [todo, setTodo] = useState(initial?.todo || "");

  const handleSave = () => {
    if (!name.trim()) return;
    const videoId = extractVideoId(videoInput);
    const videoChanged = videoId !== initial?.latestVideoId;

    onSave({
      name: name.trim(),
      part,
      uploadedPart,
      latestVideoId: videoId || null,
      uploadDate: uploadDate ? new Date(uploadDate).toISOString() : null,
      todo,
      // Reset the 7-day snapshot when the user links a new video
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

        <Field label="Series / game name">
          <input
            autoFocus
            style={s.input}
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSave()}
            placeholder="e.g. Minecraft Hardcore"
          />
        </Field>

        <div style={s.twoCol}>
          <Field label="Current part">
            <input
              style={s.input}
              type="number"
              min="1"
              value={part}
              onChange={(e) =>
                setPart(Math.max(1, parseInt(e.target.value) || 1))
              }
            />
          </Field>
          <Field label="Uploaded part">
            <input
              style={s.input}
              type="number"
              min="1"
              value={uploadedPart}
              onChange={(e) =>
                setUploadedPart(Math.max(1, parseInt(e.target.value) || 1))
              }
            />
          </Field>
        </div>

        <Field label="Latest video ID or URL">
          <input
            style={s.input}
            value={videoInput}
            onChange={(e) => setVideoInput(e.target.value)}
            placeholder="dQw4w9WgXcQ  or  https://youtube.com/watch?v=…"
          />
          <span style={s.hint}>
            Paste after each new upload — clears the 7-day snapshot
            automatically.
          </span>
        </Field>

        <Field label="Upload date of that video">
          <input
            style={s.input}
            type="date"
            value={uploadDate}
            onChange={(e) => setUploadDate(e.target.value)}
          />
          <span style={s.hint}>
            Used to calculate the 7-day evaluation window.
          </span>
        </Field>

        <Field label="Todo / notes">
          <textarea
            style={s.textarea}
            rows={3}
            value={todo}
            onChange={(e) => setTodo(e.target.value)}
            placeholder="e.g. Record part 5, add intro music…"
          />
        </Field>

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

function Field({ label, children }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 4,
        marginBottom: "0.85rem",
      }}
    >
      <label
        style={{
          fontSize: 11,
          fontWeight: 700,
          color: "#555",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
        }}
      >
        {label}
      </label>
      {children}
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
    borderRadius: 16,
    padding: "1.75rem",
    width: "100%",
    maxWidth: 430,
    boxShadow: "0 12px 40px rgba(0,0,0,0.18)",
    maxHeight: "92vh",
    overflowY: "auto",
  },
  title: {
    fontSize: 17,
    fontWeight: 700,
    color: "#111",
    margin: "0 0 1.25rem",
  },
  twoCol: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 },
  input: {
    padding: "9px 12px",
    border: "1.5px solid #e0e0e0",
    borderRadius: 8,
    fontSize: 14,
    color: "#111",
    outline: "none",
    fontFamily: "inherit",
    background: "#fafafa",
    width: "100%",
    boxSizing: "border-box",
  },
  textarea: {
    padding: "9px 12px",
    border: "1.5px solid #e0e0e0",
    borderRadius: 8,
    fontSize: 14,
    color: "#111",
    outline: "none",
    fontFamily: "inherit",
    background: "#fafafa",
    resize: "none",
    lineHeight: 1.5,
    width: "100%",
    boxSizing: "border-box",
  },
  hint: { fontSize: 11, color: "#aaa", marginTop: 2 },
  actions: {
    display: "flex",
    gap: 8,
    justifyContent: "flex-end",
    marginTop: "1.25rem",
  },
  cancel: {
    padding: "8px 18px",
    borderRadius: 8,
    border: "1.5px solid #ddd",
    background: "none",
    color: "#555",
    cursor: "pointer",
    fontSize: 14,
    fontFamily: "inherit",
  },
  save: {
    padding: "8px 22px",
    borderRadius: 8,
    border: "none",
    background: "#FF0000",
    color: "#fff",
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 700,
    fontFamily: "inherit",
  },
};
