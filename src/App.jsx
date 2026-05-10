import { useState } from "react";
import { useSeries } from "./hooks/useSeries";
import Header from "./components/Header";
import SeriesGrid from "./components/SeriesGrid";
import Modal from "./components/Modal";

export default function App() {
  const {
    series,
    loading,
    apiError,
    lastRefreshed,
    refreshStats,
    addSeries,
    updateSeries,
    removeSeries,
    incrementPart,
    decrementPart,
    incrementUploaded,
    decrementUploaded,
    updateTodo,
  } = useSeries();

  const [modal, setModal] = useState(null); // null | { type: "add" | "edit", item? }

  const openAdd = () => setModal({ type: "add" });
  const openEdit = (item) => setModal({ type: "edit", item });
  const closeModal = () => setModal(null);

  const handleSave = (data) => {
    if (modal.type === "add") addSeries(data);
    else updateSeries(modal.item.id, data);
    closeModal();
    // Refresh so the new/updated video ID gets stats immediately
    setTimeout(refreshStats, 300);
  };

  return (
    <div style={s.page}>
      <Header
        count={series.length}
        loading={loading}
        apiError={apiError}
        lastRefreshed={lastRefreshed}
        onAdd={openAdd}
        onRefresh={refreshStats}
      />

      <SeriesGrid
        series={series}
        onEdit={openEdit}
        onDelete={removeSeries}
        onIncrement={incrementPart}
        onDecrement={decrementPart}
        onIncrementUploaded={incrementUploaded}
        onDecrementUploaded={decrementUploaded}
        onUpdateTodo={updateTodo}
      />

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

const s = {
  page: {
    maxWidth: "1080px",
    margin: "0 auto",
    padding: "2rem 1.25rem",
    fontFamily: "system-ui, -apple-system, sans-serif",
    minHeight: "100vh",
    background: "#f7f7f7",
  },
};
