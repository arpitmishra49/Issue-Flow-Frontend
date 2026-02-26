import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchIssuesThunk } from "./issueThunk";
import { fetchProjectsThunk } from "../projects/projectThunk";

import CreateIssueForm from "./components/CreateIssueForm";
import Modal from "../../components/ui/Modal";
import Button from "../../components/ui/Button";
import Loader from "../../components/ui/Loader";
import IssueCard from "./components/issueCard";

const statusColumns = [
  {
    key: "unassigned",  label: "Unassigned",  virtual: true,
    accent: "bg-orange-500", text: "text-orange-300", ring: "ring-orange-500/20",
    glow: "#f97316", headerBg: "bg-orange-500/5", borderAccent: "border-l-orange-500/50",
    emptyIcon: "🔓",
  },
  {
    key: "open",        label: "Open",        virtual: false,
    accent: "bg-red-500",    text: "text-red-300",    ring: "ring-red-500/20",
    glow: "#ef4444", headerBg: "bg-red-500/5", borderAccent: "border-l-red-500/50",
    emptyIcon: "📋",
  },
  {
    key: "in-progress", label: "In Progress", virtual: false,
    accent: "bg-amber-500",  text: "text-amber-300",  ring: "ring-amber-500/20",
    glow: "#f59e0b", headerBg: "bg-amber-500/5", borderAccent: "border-l-amber-500/50",
    emptyIcon: "⚡",
  },
  {
    key: "resolved",    label: "Resolved",    virtual: false,
    accent: "bg-emerald-500",text: "text-emerald-300",ring: "ring-emerald-500/20",
    glow: "#10b981", headerBg: "bg-emerald-500/5", borderAccent: "border-l-emerald-500/50",
    emptyIcon: "✓",
  },
  {
    key: "closed",      label: "Closed",      virtual: false,
    accent: "bg-zinc-500",   text: "text-zinc-400",   ring: "ring-zinc-500/20",
    glow: "#71717a", headerBg: "bg-zinc-500/5", borderAccent: "border-l-zinc-500/40",
    emptyIcon: "🔒",
  },
];

const IssueBoard = () => {
  const dispatch = useDispatch();
  const { issues, loading } = useSelector((s) => s.issues);
  const { projects }        = useSelector((s) => s.projects);
  const { user }            = useSelector((s) => s.auth);

  const [showModal,      setShowModal]      = useState(false);
  const [filterProject,  setFilterProject]  = useState("");
  const [filterPriority, setFilterPriority] = useState("");

  useEffect(() => {
    dispatch(fetchIssuesThunk());
    dispatch(fetchProjectsThunk());
  }, [dispatch]);

  const isDeveloper = user?.role === "developer";
  const isTester    = user?.role === "tester";

  const visibleIssues = isDeveloper
    ? issues.filter((i) => {
        const assignedId = i.assignedTo?._id || i.assignedTo;
        return String(assignedId) === String(user._id || user.id);
      })
    : issues;

  const filtered = visibleIssues.filter((i) => {
    if (filterProject  && i.project?._id !== filterProject && i.project !== filterProject) return false;
    if (filterPriority && i.severity !== filterPriority) return false;
    return true;
  });

  const getColumnIssues = (key, virtual) => {
    if (virtual) return filtered.filter((i) => !i.assignedTo);
    return filtered.filter((i) => i.status === key && !!i.assignedTo);
  };

  const visibleColumns = statusColumns.filter(({ virtual }) => !(virtual && isDeveloper));

  if (loading) return <Loader />;

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] gap-4">

      {/* ── Header ── */}
      <div className="flex items-center justify-between gap-4 flex-wrap shrink-0">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <div className="w-1.5 h-5 rounded-full bg-gradient-to-b from-indigo-400 via-violet-400 to-indigo-600" />
            <h2 className="text-lg font-black text-zinc-100 tracking-tight">Issue Board</h2>
          </div>
          <p className="text-[11px] text-zinc-600 font-medium pl-3.5">
            {filtered.length} issues · {visibleColumns.length} columns
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={filterProject}
            onChange={(e) => setFilterProject(e.target.value)}
            className="h-8 px-3 rounded-xl text-[11px] font-semibold bg-zinc-900 border border-zinc-700/60 text-zinc-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 cursor-pointer hover:border-zinc-600 transition-colors"
          >
            <option value="">All Projects</option>
            {projects.map((p) => (
              <option key={p._id} value={p._id}>{p.name}</option>
            ))}
          </select>

          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="h-8 px-3 rounded-xl text-[11px] font-semibold bg-zinc-900 border border-zinc-700/60 text-zinc-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 cursor-pointer hover:border-zinc-600 transition-colors capitalize"
          >
            <option value="">All Priorities</option>
            {["low", "medium", "high", "critical"].map((p) => (
              <option key={p} value={p} className="capitalize">{p}</option>
            ))}
          </select>

          {(filterProject || filterPriority) && (
            <button
              onClick={() => { setFilterProject(""); setFilterPriority(""); }}
              className="h-8 px-3 rounded-xl text-[11px] font-semibold text-zinc-500 hover:text-zinc-200 border border-zinc-700/60 hover:border-zinc-500 transition-all"
            >
              ✕ Clear
            </button>
          )}

          {isTester && (
            <Button onClick={() => setShowModal(true)}>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
              New Issue
            </Button>
          )}
        </div>
      </div>

      {/* ── Kanban columns ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-3 flex-1 min-h-0">
        {visibleColumns.map(({ key, label, virtual, accent, text, ring, headerBg, emptyIcon }) => {
          const colIssues = getColumnIssues(key, virtual);
          return (
            <div
              key={key}
              className="flex flex-col min-h-0 rounded-2xl border border-zinc-800/50 overflow-hidden bg-zinc-900/40"
            >
              {/* ── Column header ── */}
              <div className={`shrink-0 ${headerBg}`}>
                {/* Top accent bar */}
                <div className={`h-[3px] w-full ${accent} opacity-70`} />

                <div className="flex items-center justify-between px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className={`absolute inline-flex h-full w-full rounded-full ${accent} opacity-60 ${colIssues.length > 0 ? "animate-ping" : ""}`} />
                      <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${accent}`} />
                    </span>
                    <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${text}`}>{label}</span>
                  </div>

                  <span className={`text-[10px] font-black tabular-nums px-2 py-0.5 rounded-full ${text} bg-zinc-900/60 border border-zinc-700/40 ring-1 ${ring}`}>
                    {colIssues.length}
                  </span>
                </div>

                {/* Divider */}
                <div className="mx-4 h-px bg-zinc-800/80" />
              </div>

              {/* ── Scrollable card list ── */}
              <div className="flex-1 overflow-y-auto px-2.5 py-3 space-y-2 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-zinc-800">
                {colIssues.map((issue) => (
                  <IssueCard key={issue._id} issue={issue} />
                ))}

                {colIssues.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-32 rounded-xl border border-dashed border-zinc-800/50 gap-2.5">
                    <span className="text-xl opacity-10">{emptyIcon}</span>
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-700">Empty</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Report New Issue">
        <CreateIssueForm
          projects={projects}
          onSuccess={() => {
            setShowModal(false);
            dispatch(fetchIssuesThunk());
          }}
        />
      </Modal>
    </div>
  );
};

export default IssueBoard;