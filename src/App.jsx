import { useState, useMemo } from "react";
import { useSeries } from "./hooks/useSeries";
import { analyzeStatus } from "./utils/analyzePerformance";
import { STATUS_ORDER } from "./constants";
import Header from "./components/Header";
import SummaryBar from "./components/SummaryBar";
import SeriesGrid from "./components/SeriesGrid";
import Modal from "./components/Modal";
import Analytics from "./components/Analytics";
import Todo from "./components/Todo";

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
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("tracker"); // "tracker" | "analytics"

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

  // replace the return JSX with:
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

      {/* Main tab switcher */}
      <div style={s.mainTabs}>
        <button
          style={{
            ...s.mainTab,
            borderBottom:
              activeTab === "tracker"
                ? "2px solid #111"
                : "2px solid transparent",
            color: activeTab === "tracker" ? "#111" : "#aaa",
            fontWeight: activeTab === "tracker" ? 700 : 500,
          }}
          onClick={() => setActiveTab("tracker")}
        >
          📋 Tracker
        </button>
        <button
          style={{
            ...s.mainTab,
            borderBottom:
              activeTab === "analytics"
                ? "2px solid #111"
                : "2px solid transparent",
            color: activeTab === "analytics" ? "#111" : "#aaa",
            fontWeight: activeTab === "analytics" ? 700 : 500,
          }}
          onClick={() => setActiveTab("analytics")}
        >
          📊 Analytics
        </button>
        <button
          style={{
            ...s.mainTab,
            borderBottom:
              activeTab === "todo" ? "2px solid #111" : "2px solid transparent",
            color: activeTab === "todo" ? "#111" : "#aaa",
            fontWeight: activeTab === "todo" ? 700 : 500,
          }}
          onClick={() => setActiveTab("todo")}
        >
          ✅ Todo
        </button>
      </div>

      {activeTab === "tracker" && (
        <>
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
            onIncrementUploaded={incrementUploaded}
            onDecrementUploaded={decrementUploaded}
            onIncrementRecorded={incrementRecorded}
            onDecrementRecorded={decrementRecorded}
            onUpdateTodo={updateTodo}
          />
        </>
      )}

      {activeTab === "analytics" && (
        <Analytics
          series={series.map((s) => ({ ...s, status: analyzeStatus(s) }))}
        />
      )}

      {activeTab === "todo" && <Todo />}

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
    padding: "1.5rem 1.25rem",
    fontFamily: "system-ui, -apple-system, sans-serif",
    minHeight: "100vh",
    background: "#f4f4f5",
  },
  mainTabs: {
    display: "flex",
    gap: 0,
    marginBottom: "1.25rem",
    borderBottom: "1px solid #ebebeb",
  },
  mainTab: {
    padding: "0.6rem 1.25rem",
    background: "none",
    border: "none",
    borderBottom: "2px solid transparent",
    cursor: "pointer",
    fontSize: 14,
    fontFamily: "inherit",
    transition: "all 0.15s",
    marginBottom: "-1px",
  },
};
