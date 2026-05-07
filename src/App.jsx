import { useState, useEffect } from "react";

const STORAGE_KEY = "yt-parts-tracker-v1";

function load() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function save(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    return;
  }
}

function Modal({ title, initial, onSave, onClose }) {
  const [name, setName] = useState(initial?.name || "");
  const [part, setPart] = useState(initial?.part ?? 1);

  return (
    <div
      style={styles.overlay}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div style={styles.modal}>
        <p style={styles.modalTitle}>{title}</p>

        <div style={styles.field}>
          <label style={styles.label}>Series / game name</label>
          <input
            autoFocus
            style={styles.input}
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) =>
              e.key === "Enter" &&
              name.trim() &&
              onSave({ name: name.trim(), part })
            }
            placeholder="e.g. Minecraft Hardcore"
          />
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Starting part</label>
          <input
            style={styles.input}
            type="number"
            min="1"
            value={part}
            onChange={(e) =>
              setPart(Math.max(1, parseInt(e.target.value) || 1))
            }
          />
        </div>

        <div style={styles.modalActions}>
          <button style={styles.btnCancel} onClick={onClose}>
            Cancel
          </button>
          <button
            style={{ ...styles.btnSave, opacity: name.trim() ? 1 : 0.4 }}
            disabled={!name.trim()}
            onClick={() => onSave({ name: name.trim(), part })}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [series, setSeries] = useState(load);
  const [modal, setModal] = useState(null);

  useEffect(() => save(series), [series]);

  const openAdd = () => setModal({ type: "add" });
  const openEdit = (item) => setModal({ type: "edit", item });
  const closeModal = () => setModal(null);

  const handleSave = ({ name, part }) => {
    if (modal.type === "add") {
      setSeries((s) => [...s, { id: Date.now(), name, part }]);
    } else {
      setSeries((s) =>
        s.map((x) => (x.id === modal.item.id ? { ...x, name, part } : x)),
      );
    }
    closeModal();
  };

  const increment = (id) =>
    setSeries((s) =>
      s.map((x) => (x.id === id ? { ...x, part: x.part + 1 } : x)),
    );

  const decrement = (id) =>
    setSeries((s) =>
      s.map((x) =>
        x.id === id && x.part > 1 ? { ...x, part: x.part - 1 } : x,
      ),
    );

  const remove = (id) => setSeries((s) => s.filter((x) => x.id !== id));

  return (
    <div style={styles.app}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <span style={styles.ytDot} />
          <div>
            <p style={styles.title}>YouTube Parts Tracker</p>
            <p style={styles.subtitle}>
              Track which part you're on for each series
            </p>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {series.length > 0 && (
            <span style={styles.countBadge}>{series.length} series</span>
          )}
          <button style={styles.addBtn} onClick={openAdd}>
            + Add series
          </button>
        </div>
      </div>

      {/* Empty state */}
      {series.length === 0 ? (
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>▶</div>
          <p>No series yet. Add one to get started!</p>
        </div>
      ) : (
        // Cards grid
        <div style={styles.grid}>
          {series.map((item) => (
            <div key={item.id} style={styles.card}>
              {/* Card top row: name + edit/delete */}
              <div style={styles.cardTop}>
                <p style={styles.cardName}>{item.name}</p>
                <div style={styles.cardActions}>
                  <button
                    style={styles.iconBtn}
                    title="Edit"
                    onClick={() => openEdit(item)}
                  >
                    ✏️
                  </button>
                  <button
                    style={styles.iconBtn}
                    title="Delete"
                    onClick={() => remove(item.id)}
                  >
                    🗑️
                  </button>
                </div>
              </div>

              {/* Part row: number + increment/decrement */}
              <div style={styles.partRow}>
                <div>
                  <p style={styles.partLabel}>Current part</p>
                  <p style={styles.partNum}>{item.part}</p>
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <button
                    style={styles.incBtn}
                    title="Next part"
                    onClick={() => increment(item.id)}
                  >
                    +
                  </button>
                  <button
                    style={{
                      ...styles.decBtn,
                      opacity: item.part <= 1 ? 0.3 : 1,
                      cursor: item.part <= 1 ? "not-allowed" : "pointer",
                    }}
                    disabled={item.part <= 1}
                    title="Previous part"
                    onClick={() => decrement(item.id)}
                  >
                    −
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modal && (
        <Modal
          title={modal.type === "add" ? "Add new series" : "Edit series"}
          initial={modal.item}
          onSave={handleSave}
          onClose={closeModal}
        />
      )}
    </div>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = {
  app: {
    maxWidth: 800,
    margin: "0 auto",
    padding: "2rem 1rem",
    fontFamily: "system-ui, sans-serif",
  },

  // Header
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "1.5rem",
    gap: 12,
    flexWrap: "wrap",
  },
  headerLeft: { display: "flex", alignItems: "center", gap: 10 },
  ytDot: {
    width: 10,
    height: 10,
    borderRadius: "50%",
    background: "#FF0000",
    flexShrink: 0,
  },
  title: { fontSize: 18, fontWeight: 600, color: "#111", margin: 0 },
  subtitle: { fontSize: 13, color: "#666", margin: 0, marginTop: 2 },

  addBtn: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    background: "#FF0000",
    color: "#fff",
    border: "none",
    padding: "8px 16px",
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 500,
    cursor: "pointer",
  },

  countBadge: {
    display: "inline-flex",
    alignItems: "center",
    background: "#f3f3f3",
    border: "1px solid #e5e5e5",
    borderRadius: 999,
    padding: "2px 10px",
    fontSize: 12,
    color: "#666",
  },

  // Empty state
  emptyState: {
    textAlign: "center",
    padding: "3rem 1rem",
    color: "#999",
    fontSize: 14,
  },
  emptyIcon: { fontSize: 32, marginBottom: "0.75rem", opacity: 0.4 },

  // Grid + Card
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
    gap: 12,
  },
  card: {
    background: "#fff",
    border: "1px solid #e5e5e5",
    borderRadius: 12,
    padding: "1rem 1.25rem",
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  cardTop: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 8,
  },
  cardName: {
    fontSize: 15,
    fontWeight: 500,
    color: "#111",
    wordBreak: "break-word",
    lineHeight: 1.4,
    margin: 0,
  },
  cardActions: { display: "flex", gap: 4, flexShrink: 0 },
  iconBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: 4,
    borderRadius: 6,
    fontSize: 15,
    lineHeight: 1,
  },

  // Part display
  partRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  partLabel: { fontSize: 12, color: "#888", margin: 0 },
  partNum: {
    fontSize: 28,
    fontWeight: 600,
    color: "#111",
    margin: 0,
    lineHeight: 1,
  },

  incBtn: {
    width: 34,
    height: 34,
    borderRadius: "50%",
    border: "1px solid #ddd",
    background: "#f5f5f5",
    cursor: "pointer",
    fontSize: 20,
    fontWeight: 600,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#111",
    lineHeight: 1,
  },
  decBtn: {
    width: 26,
    height: 26,
    borderRadius: "50%",
    border: "1px solid #e5e5e5",
    background: "none",
    fontSize: 16,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#666",
    lineHeight: 1,
  },

  // Modal
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.4)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 100,
    padding: "1rem",
  },
  modal: {
    background: "#fff",
    border: "1px solid #e5e5e5",
    borderRadius: 12,
    padding: "1.5rem",
    width: "100%",
    maxWidth: 360,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: 600,
    color: "#111",
    marginBottom: "1rem",
  },
  field: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
    marginBottom: "1rem",
  },
  label: { fontSize: 13, color: "#555" },
  input: {
    padding: "8px 12px",
    border: "1px solid #ddd",
    borderRadius: 8,
    fontSize: 14,
    color: "#111",
    outline: "none",
    fontFamily: "inherit",
    background: "#fafafa",
  },
  modalActions: {
    display: "flex",
    gap: 8,
    justifyContent: "flex-end",
    marginTop: "1.25rem",
  },
  btnCancel: {
    padding: "8px 16px",
    borderRadius: 8,
    border: "1px solid #ddd",
    background: "none",
    color: "#555",
    cursor: "pointer",
    fontSize: 14,
    fontFamily: "inherit",
  },
  btnSave: {
    padding: "8px 16px",
    borderRadius: 8,
    border: "none",
    background: "#FF0000",
    color: "#fff",
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 500,
    fontFamily: "inherit",
  },
};
