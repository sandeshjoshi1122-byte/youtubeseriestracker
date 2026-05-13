import SeriesCard from "./SeriesCard";

const EMPTY_MESSAGES = {
  all: { icon: "▶", text: "No series yet — hit + Add series to get started!" },
  upload_next: {
    icon: "🚀",
    text: "No series ready to upload yet — keep grinding!",
  },
  watching: {
    icon: "👀",
    text: "No series currently in the 7-day evaluation window.",
  },
  active: {
    icon: "✅",
    text: "No active series — link a video to start tracking.",
  },
  scheduled: { icon: "⏰", text: "No scheduled uploads." },
  needs_refresh: { icon: "🔔", text: "No series waiting to go live." },
  revived: { icon: "💡", text: "No revived series." },
  discontinued: { icon: "🔴", text: "No discontinued series — great job!" },
  no_video: { icon: "🎬", text: "No series without a linked video." },
  archived: {
    icon: "🗄️",
    text: "Archive is empty. Archive discontinued series to clean up your view.",
  },
};

export default function SeriesGrid({
  series,
  activeFilter,
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
  if (series.length === 0) {
    const msg = EMPTY_MESSAGES[activeFilter] ?? EMPTY_MESSAGES.all;
    return (
      <div style={s.empty}>
        <div style={s.icon}>{msg.icon}</div>
        <p style={s.emptyText}>{msg.text}</p>
      </div>
    );
  }

  const isArchived = activeFilter === "archived";

  return (
    <div style={s.grid}>
      {series.map((item) => (
        <SeriesCard
          key={item.id}
          item={item}
          archived={isArchived}
          onEdit={onEdit}
          onDelete={onDelete}
          onArchive={onArchive}
          onUnarchive={onUnarchive}
          onMarkAsPublic={onMarkAsPublic}
          onIncrementUploaded={onIncrementUploaded}
          onDecrementUploaded={onDecrementUploaded}
          onIncrementRecorded={onIncrementRecorded}
          onDecrementRecorded={onDecrementRecorded}
          onUpdateTodo={onUpdateTodo}
        />
      ))}
    </div>
  );
}

const s = {
  empty: { textAlign: "center", padding: "4rem 1rem", color: "#bbb" },
  icon: { fontSize: 32, marginBottom: "0.6rem" },
  emptyText: { fontSize: 14, color: "#bbb", maxWidth: 300, margin: "0 auto" },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(215px, 1fr))",
    gap: 10,
    alignItems: "start",
  },
};
