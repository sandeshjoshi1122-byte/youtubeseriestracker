import SeriesCard from "./SeriesCard";

export default function SeriesGrid({
  series,
  onEdit,
  onDelete,
  onArchive,
  onUnarchive,
  onIncrementUploaded,
  onDecrementUploaded,
  onIncrementRecorded,
  onDecrementRecorded,
  onUpdateTodo,
}) {
  if (series.length === 0) {
    return (
      <div style={s.empty}>
        <div style={s.icon}>▶</div>
        <p>Nothing here — try a different filter or add a new series.</p>
      </div>
    );
  }

  return (
    <div style={s.grid}>
      {series.map((item) => (
        <SeriesCard
          key={item.id}
          item={item}
          onEdit={onEdit}
          onDelete={onDelete}
          onArchive={onArchive}
          onUnarchive={onUnarchive}
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
  empty: {
    textAlign: "center",
    padding: "4rem 1rem",
    color: "#bbb",
    fontSize: 14,
  },
  icon: { fontSize: 32, marginBottom: "0.75rem", opacity: 0.25 },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))",
    gap: 10,
    alignItems: "start",
  },
};
