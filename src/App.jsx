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
    markAsPublic,
    incrementUploaded,
    decrementUploaded,
    incrementRecorded,
    decrementRecorded,
    updateTodo,
  } = useSeries();

  const [modal, setModal] = useState(null);
  const [activeFilter, setActiveFilter] = useState("all");
  const [search, setSearch] = useState("");

  const openAdd = () => setModal({ type: "add" });
  const openEdit = (item) => setModal({ type: "edit", item });
  const closeModal = () => setModal(null);

  const handleSave = (data) => {
    if (modal.type === "add") addSeries(data);
    else updateSeries(modal.item.id, data);
    closeModal();
    setTimeout(refreshStats, 300);
  };

  const activeSeries = useMemo(
    () =>
      series
        .filter((s) => !s.archived)
        .map((s) => ({ ...s, status: analyzeStatus(s) })),
    [series],
  );

  const archivedSeries = useMemo(
    () => series.filter((s) => s.archived),
    [series],
  );

  const displaySeries = useMemo(() => {
    const pool = activeFilter === "archived" ? archivedSeries : activeSeries;

    const filtered =
      activeFilter === "all" || activeFilter === "archived"
        ? pool
        : pool.filter((s) => s.status === activeFilter);

    const searched = search.trim()
      ? filtered.filter((s) =>
          s.name.toLowerCase().includes(search.toLowerCase()),
        )
      : filtered;

    return [...searched].sort((a, b) => {
      const orderDiff =
        (STATUS_ORDER[a.status] ?? 99) - (STATUS_ORDER[b.status] ?? 99);
      if (orderDiff !== 0) return orderDiff;
      return (b.currentViews ?? 0) - (a.currentViews ?? 0);
    });
  }, [activeSeries, archivedSeries, activeFilter, search]);

  return (
    <div style={s.page}>
      <Header
        count={activeSeries.length}
        loading={loading}
        apiError={apiError}
        lastRefreshed={lastRefreshed}
        onAdd={openAdd}
        onRefresh={refreshStats}
        search={search}
        onSearch={setSearch}
      />

      <SummaryBar
        series={activeSeries}
        archivedCount={archivedSeries.length}
        activeFilter={activeFilter}
        onFilter={(key) => {
          setActiveFilter(key);
          setSearch("");
        }}
      />

      <SeriesGrid
        series={displaySeries}
        activeFilter={activeFilter}
        onEdit={openEdit}
        onDelete={removeSeries}
        onArchive={archiveSeries}
        onUnarchive={unarchiveSeries}
        onMarkAsPublic={markAsPublic}
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
    maxWidth: "1400px",
    margin: "0 auto",
    padding: "1.5rem 1.25rem",
    fontFamily: "system-ui, -apple-system, sans-serif",
    minHeight: "100vh",
    background: "#f4f4f5",
  },
};
