import { useState, useRef } from "react";

const STORAGE_KEY = "yt-tracker-todos";

function loadTodos() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function saveTodos(todos) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  } catch {
    return;
  }
}

const FILTERS = ["All", "Active", "Completed"];

export default function Todo() {
  const [todos, setTodos] = useState(loadTodos);
  const [input, setInput] = useState("");
  const [filter, setFilter] = useState("All");
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");
  const inputRef = useRef(null);

  const persist = (next) => {
    setTodos(next);
    saveTodos(next);
  };

  const addTodo = () => {
    const text = input.trim();
    if (!text) return;
    persist([
      ...todos,
      { id: Date.now(), text, done: false, createdAt: Date.now() },
    ]);
    setInput("");
    inputRef.current?.focus();
  };

  const toggleTodo = (id) =>
    persist(todos.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));

  const deleteTodo = (id) => persist(todos.filter((t) => t.id !== id));

  const clearCompleted = () => persist(todos.filter((t) => !t.done));

  const startEdit = (todo) => {
    setEditingId(todo.id);
    setEditText(todo.text);
  };

  const saveEdit = (id) => {
    const text = editText.trim();
    if (!text) {
      deleteTodo(id);
    } else {
      persist(todos.map((t) => (t.id === id ? { ...t, text } : t)));
    }
    setEditingId(null);
    setEditText("");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditText("");
  };

  const filtered = todos.filter((t) => {
    if (filter === "Active") return !t.done;
    if (filter === "Completed") return t.done;
    return true;
  });

  const activeCount = todos.filter((t) => !t.done).length;
  const completedCount = todos.filter((t) => t.done).length;

  return (
    <div style={s.page}>
      {/* Header */}
      <div style={s.header}>
        <div>
          <p style={s.title}>Todo</p>
          <p style={s.sub}>
            {activeCount} remaining
            {completedCount > 0 && ` · ${completedCount} completed`}
          </p>
        </div>
        {completedCount > 0 && (
          <button style={s.clearBtn} onClick={clearCompleted}>
            Clear completed
          </button>
        )}
      </div>

      {/* Input */}
      <div style={s.inputWrap}>
        <input
          ref={inputRef}
          style={s.input}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addTodo()}
          placeholder="Add a new task and press Enter…"
        />
        <button
          style={{ ...s.addBtn, opacity: input.trim() ? 1 : 0.4 }}
          disabled={!input.trim()}
          onClick={addTodo}
        >
          Add
        </button>
      </div>

      {/* Filter tabs */}
      <div style={s.filters}>
        {FILTERS.map((f) => (
          <button
            key={f}
            style={{
              ...s.filterBtn,
              background: filter === f ? "#111" : "#fff",
              color: filter === f ? "#fff" : "#666",
              borderColor: filter === f ? "#111" : "#e5e7eb",
            }}
            onClick={() => setFilter(f)}
          >
            {f}
            <span
              style={{
                ...s.filterCount,
                background: filter === f ? "rgba(255,255,255,0.2)" : "#f3f4f6",
                color: filter === f ? "#fff" : "#888",
              }}
            >
              {f === "All"
                ? todos.length
                : f === "Active"
                  ? activeCount
                  : completedCount}
            </span>
          </button>
        ))}
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div style={s.empty}>
          <div style={s.emptyIcon}>
            {filter === "Completed" ? "✅" : filter === "Active" ? "🎯" : "📝"}
          </div>
          <p style={s.emptyText}>
            {filter === "Completed"
              ? "No completed tasks yet."
              : filter === "Active"
                ? "No active tasks. Add one!"
                : "No tasks yet. Add your first one above!"}
          </p>
        </div>
      )}

      {/* Todo list */}
      {filtered.length > 0 && (
        <div style={s.list}>
          {filtered.map((todo) => (
            <div
              key={todo.id}
              style={{
                ...s.row,
                opacity: todo.done ? 0.55 : 1,
                background: todo.done ? "#fafafa" : "#fff",
              }}
            >
              {/* Checkbox */}
              <button
                style={{
                  ...s.checkbox,
                  background: todo.done ? "#16a34a" : "#fff",
                  borderColor: todo.done ? "#16a34a" : "#d1d5db",
                }}
                onClick={() => toggleTodo(todo.id)}
              >
                {todo.done && (
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                    <path
                      d="M1 4L3.5 6.5L9 1"
                      stroke="#fff"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </button>

              {/* Text or edit input */}
              {editingId === todo.id ? (
                <input
                  autoFocus
                  style={s.editInput}
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") saveEdit(todo.id);
                    if (e.key === "Escape") cancelEdit();
                  }}
                  onBlur={() => saveEdit(todo.id)}
                />
              ) : (
                <span
                  style={{
                    ...s.text,
                    textDecoration: todo.done ? "line-through" : "none",
                    color: todo.done ? "#aaa" : "#111",
                  }}
                  onDoubleClick={() => !todo.done && startEdit(todo)}
                  title={todo.done ? "" : "Double-click to edit"}
                >
                  {todo.text}
                </span>
              )}

              {/* Actions */}
              <div style={s.rowActions}>
                {!todo.done && editingId !== todo.id && (
                  <button
                    style={s.rowBtn}
                    title="Edit"
                    onClick={() => startEdit(todo)}
                  >
                    ✏️
                  </button>
                )}
                <button
                  style={s.rowBtn}
                  title="Delete"
                  onClick={() => deleteTodo(todo.id)}
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Progress bar at bottom */}
      {todos.length > 0 && (
        <div style={s.progressWrap}>
          <div style={s.progressTrack}>
            <div
              style={{
                ...s.progressFill,
                width: `${Math.round((completedCount / todos.length) * 100)}%`,
              }}
            />
          </div>
          <span style={s.progressText}>
            {Math.round((completedCount / todos.length) * 100)}% complete
          </span>
        </div>
      )}
    </div>
  );
}

const s = {
  page: { paddingTop: "0.25rem", maxWidth: 640, margin: "0 auto" },

  header: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: "1.25rem",
  },
  title: { fontSize: 20, fontWeight: 800, color: "#111", margin: 0 },
  sub: { fontSize: 13, color: "#aaa", margin: "3px 0 0" },
  clearBtn: {
    padding: "6px 14px",
    borderRadius: 8,
    border: "1px solid #fca5a5",
    background: "#fef2f2",
    color: "#dc2626",
    cursor: "pointer",
    fontSize: 12,
    fontWeight: 600,
    fontFamily: "inherit",
  },

  inputWrap: {
    display: "flex",
    gap: 8,
    marginBottom: "1rem",
  },
  input: {
    flex: 1,
    padding: "10px 14px",
    border: "1.5px solid #e5e7eb",
    borderRadius: 10,
    fontSize: 14,
    color: "#111",
    outline: "none",
    fontFamily: "inherit",
    background: "#fff",
    transition: "border-color 0.15s",
    boxSizing: "border-box",
  },
  addBtn: {
    padding: "10px 20px",
    borderRadius: 10,
    border: "none",
    background: "#FF0000",
    color: "#fff",
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 700,
    fontFamily: "inherit",
    transition: "opacity 0.15s",
    whiteSpace: "nowrap",
  },

  filters: { display: "flex", gap: 6, marginBottom: "1rem" },
  filterBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "5px 12px",
    borderRadius: 999,
    border: "1.5px solid",
    fontSize: 12,
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "inherit",
    transition: "all 0.15s",
  },
  filterCount: {
    fontSize: 11,
    fontWeight: 700,
    borderRadius: 999,
    padding: "1px 6px",
  },

  empty: { textAlign: "center", padding: "3rem 1rem" },
  emptyIcon: { fontSize: 32, marginBottom: "0.75rem" },
  emptyText: { fontSize: 14, color: "#bbb", margin: 0 },

  list: {
    display: "flex",
    flexDirection: "column",
    gap: 0,
    border: "1px solid #ebebeb",
    borderRadius: 12,
    overflow: "hidden",
  },
  row: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "0.75rem 1rem",
    borderBottom: "1px solid #f5f5f5",
    transition: "background 0.15s",
  },

  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    border: "1.5px solid",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    transition: "all 0.15s",
  },

  text: {
    flex: 1,
    fontSize: 14,
    lineHeight: 1.5,
    cursor: "default",
    transition: "color 0.2s",
  },

  editInput: {
    flex: 1,
    padding: "4px 8px",
    border: "1.5px solid #6366f1",
    borderRadius: 6,
    fontSize: 14,
    color: "#111",
    outline: "none",
    fontFamily: "inherit",
    background: "#fff",
  },

  rowActions: { display: "flex", gap: 2, flexShrink: 0, opacity: 0 },
  rowBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: "3px 4px",
    fontSize: 13,
    borderRadius: 5,
    lineHeight: 1,
  },

  progressWrap: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    marginTop: "1rem",
  },
  progressTrack: {
    flex: 1,
    height: 4,
    background: "#f3f4f6",
    borderRadius: 999,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    background: "#16a34a",
    borderRadius: 999,
    transition: "width 0.5s ease",
  },
  progressText: { fontSize: 11, color: "#aaa", whiteSpace: "nowrap" },
};
