import SeriesCard from "./SeriesCard";

export default function SeriesGrid({
  series,
  onEdit,
  onDelete,
  onIncrement,
  onDecrement,
  onIncrementUploaded,
  onDecrementUploaded,
  onUpdateTodo,
}) {
  if (series.length === 0) {
    return (
      <div style={s.empty}>
        <div style={s.icon}>▶</div>
        <p>
          No series yet — hit <strong>+ Add series</strong> to get started!
        </p>
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
          onIncrement={onIncrement}
          onDecrement={onDecrement}
          onIncrementUploaded={onIncrementUploaded}
          onDecrementUploaded={onDecrementUploaded}
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
    color: "#aaa",
    fontSize: 14,
  },
  icon: { fontSize: 38, marginBottom: "0.75rem", opacity: 0.3 },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
    gap: "12px",
    alignItems: "start",
  },
};
