import { useState, useMemo } from "react";
import { useSeries } from "./hooks/useSeries";
import { analyzeStatus } from "./utils/analyzePerformance";
import { STATUS_ORDER } from "./constants";
import Header from "./components/Header";
import SummaryBar from "./components/SummaryBar";
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
    archiveSeries,
    unarchiveSeries,
    incrementUploaded,
    decrementUploaded,
    incrementRecorded,
    decrementRecorded,
    updateTodo,
  } = useSeries();

  const [modal, setModal] = useState(null);
  const [activeFilter, setActiveFilter] = useState("all");

  const openAdd = () => setModal({ type: "add" });
  const openEdit = (item) => setModal({ type: "edit", item });
  const closeModal = () => setModal(null);

  const handleSave = (data) => {
    if (modal.type === "add") addSeries(data);
    else updateSeries(modal.item.id, data);
    closeModal();
    setTimeout(refreshStats, 300);
  };

  // Active (non-archived) series with computed status
  const activeSeries = useMemo(
    () =>
      series
        .filter((s) => !s.archived)
        .map((s) => ({ ...s, status: analyzeStatus(s) })),
    [series],
  );

  // Archived series
  const archivedSeries = useMemo(
    () => series.filter((s) => s.archived),
    [series],
  );

  const handleFilter = (key) => setActiveFilter(key);

  const displaySeries = useMemo(() => {
    if (activeFilter === "archived") {
      return archivedSeries;
    }

    const filtered =
      activeFilter === "all"
        ? activeSeries
        : activeSeries.filter((s) => s.status === activeFilter);

    return [...filtered].sort((a, b) => {
      const orderDiff =
        (STATUS_ORDER[a.status] ?? 99) - (STATUS_ORDER[b.status] ?? 99);
      if (orderDiff !== 0) return orderDiff;
      return (b.currentViews ?? 0) - (a.currentViews ?? 0);
    });
  }, [activeSeries, archivedSeries, activeFilter]);

  return (
    <div style={s.page}>
      <Header
        count={activeSeries.length}
        loading={loading}
        apiError={apiError}
        lastRefreshed={lastRefreshed}
        onAdd={openAdd}
        onRefresh={refreshStats}
      />

      <SummaryBar
        series={activeSeries}
        archivedCount={archivedSeries.length}
        activeFilter={activeFilter}
        onFilter={handleFilter}
      />

      <SeriesGrid
        series={displaySeries}
        onEdit={openEdit}
        onDelete={removeSeries}
        onArchive={archiveSeries}
        onUnarchive={unarchiveSeries}
        onIncrementUploaded={incrementUploaded}
        onDecrementUploaded={decrementUploaded}
        onIncrementRecorded={incrementRecorded}
        onDecrementRecorded={decrementRecorded}
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
    width: "100%",
    margin: "0 auto",
    padding: "1.75rem 1.25rem",
    fontFamily: "system-ui, -apple-system, sans-serif",
    minHeight: "100vh",
    background: "#f7f7f7",
  },
};
