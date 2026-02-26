import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchIssuesThunk, assignIssueThunk } from "../issues/issueThunk";
import { fetchProjectsThunk } from "../projects/projectThunk";
import { Link } from "react-router-dom";
import Loader from "../../components/ui/Loader";

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
};

const statusConfig = {
  open:          { dot: "bg-red-400",     badge: "bg-red-500/10 text-red-400 border-red-500/20"             },
  "in-progress": { dot: "bg-amber-400",   badge: "bg-amber-500/10 text-amber-400 border-amber-500/20"       },
  resolved:      { dot: "bg-emerald-400", badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
  closed:        { dot: "bg-zinc-500",    badge: "bg-zinc-800/60 text-zinc-500 border-zinc-700/30"          },
};

const priorityDot = {
  low: "bg-sky-400", medium: "bg-amber-400", high: "bg-orange-400", critical: "bg-red-500",
};

const StatCard = ({ label, value, color, glow, icon, sub }) => (
  <div className="relative overflow-hidden bg-zinc-900 border border-zinc-800/80 rounded-2xl p-5 group hover:border-zinc-700 transition-all duration-300">
    <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full blur-2xl opacity-10 group-hover:opacity-20 transition-opacity" style={{ background: glow }} />
    <div className="relative flex items-start justify-between gap-2">
      <div>
        <span className="text-[10px] font-black uppercase tracking-[0.18em] text-zinc-600 block mb-3">{label}</span>
        <p className={`text-[2.6rem] font-black leading-none tracking-tight ${color}`}>{value}</p>
        {sub && <p className="text-[10px] text-zinc-600 font-medium mt-2">{sub}</p>}
      </div>
      <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-1" style={{ background: glow + "20" }}>
        {icon}
      </div>
    </div>
    <div className="absolute bottom-0 left-0 right-0 h-[2px] opacity-0 group-hover:opacity-30 transition-opacity" style={{ background: `linear-gradient(90deg, transparent, ${glow}, transparent)` }} />
  </div>
);

const ManagerDashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);
  const { issues, loading: iLoading } = useSelector((s) => s.issues);
  const { projects } = useSelector((s) => s.projects);

  useEffect(() => {
    dispatch(fetchIssuesThunk());
    dispatch(fetchProjectsThunk());
  }, [dispatch]);

  const projectIds     = projects.map((p) => p._id);
  const managedIssues  = issues.filter((i) => projectIds.includes(i.project?._id) || projectIds.includes(i.project));
  const unassigned     = managedIssues.filter((i) => !i.assignedTo);
  const openCount      = managedIssues.filter((i) => i.status === "open").length;
  const inProgressCount = managedIssues.filter((i) => i.status === "in-progress").length;
  const resolvedCount  = managedIssues.filter((i) => i.status === "resolved").length;
  const closedCount    = managedIssues.filter((i) => i.status === "closed").length;
  const total          = managedIssues.length;
  const resolutionRate = total > 0 ? Math.round(((resolvedCount + closedCount) / total) * 100) : 0;

  const allDevelopers = projects.flatMap((p) => p.members || [])
    .filter((m) => m.role === "developer")
    .filter((m, i, arr) => arr.findIndex((x) => x._id === m._id) === i);

  const handleAssign = (issueId, developerId) => {
    dispatch(assignIssueThunk({ id: issueId, data: { developerId: developerId || null } }));
  };

  if (iLoading) return <Loader />;

  return (
    <div className="space-y-5 pb-6">

      {/* ── Hero ── */}
      <div className="relative overflow-hidden rounded-2xl border border-zinc-800/60 bg-zinc-900 p-6">
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: "radial-gradient(circle at 20% 50%, #f59e0b 0%, transparent 50%), radial-gradient(circle at 80% 20%, #6366f1 0%, transparent 40%)" }} />
        <div className="absolute top-0 right-0 w-72 h-72 opacity-[0.025]"
          style={{ backgroundImage: "radial-gradient(circle, #fbbf24 1px, transparent 1px)", backgroundSize: "20px 20px" }} />
        <div className="relative flex items-center justify-between gap-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-zinc-600 mb-1">{getGreeting()}, Manager</p>
            <h1 className="text-2xl font-black text-zinc-100 tracking-tight">{user?.name || "Manager"}</h1>
            <p className="text-sm text-zinc-500 mt-1">
              {unassigned.length > 0
                ? <span className="text-orange-400 font-semibold">{unassigned.length} issue{unassigned.length > 1 ? "s" : ""} awaiting assignment</span>
                : `${openCount + inProgressCount} active issues across ${projects.length} project${projects.length !== 1 ? "s" : ""}`}
            </p>
          </div>
          <div className="shrink-0 relative w-16 h-16">
            <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
              <circle cx="32" cy="32" r="26" fill="none" stroke="#27272a" strokeWidth="6" />
              <circle cx="32" cy="32" r="26" fill="none" stroke="#f59e0b" strokeWidth="6" strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 26}`}
                strokeDashoffset={`${2 * Math.PI * 26 * (1 - resolutionRate / 100)}`} />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-[13px] font-black text-zinc-100 leading-none">{resolutionRate}%</span>
              <span className="text-[8px] text-zinc-600 font-bold uppercase tracking-wide mt-0.5">done</span>
            </div>
          </div>
        </div>
        {total > 0 && (
          <div className="relative mt-5">
            <div className="flex justify-between mb-1.5">
              <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">Team Progress</span>
              <span className="text-[10px] font-bold text-zinc-400">{resolvedCount + closedCount} / {total} resolved</span>
            </div>
            <div className="h-1 w-full rounded-full bg-zinc-800 overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-400 transition-all duration-700" style={{ width: `${resolutionRate}%` }} />
            </div>
          </div>
        )}
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard label="Total Issues" value={total} color="text-indigo-400" glow="#6366f1" sub="in your projects"
          icon={<svg className="w-4 h-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>}
        />
        <StatCard label="Open" value={openCount} color="text-red-400" glow="#ef4444" sub="needs attention"
          icon={<svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /></svg>}
        />
        <StatCard label="In Progress" value={inProgressCount} color="text-amber-400" glow="#f59e0b" sub="active work"
          icon={<svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
      </div>

      {/* ── Unassigned Issues ── */}
      <div className="bg-zinc-900 border border-orange-500/20 rounded-2xl overflow-hidden">
        <div className="h-[3px] bg-orange-500/50" />
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-zinc-800/60 bg-orange-500/[0.03]">
          <div className="flex items-center gap-2.5">
            <div className="w-1.5 h-4 rounded-full bg-gradient-to-b from-orange-400 to-amber-500" />
            <h3 className="text-[13px] font-bold text-zinc-200 tracking-tight">Unassigned Issues</h3>
            <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-md border ${unassigned.length > 0 ? "bg-orange-500/10 text-orange-400 border-orange-500/20" : "bg-zinc-800 text-zinc-400 border-zinc-700/50"}`}>
              {unassigned.length}
            </span>
            {unassigned.length > 0 && (
              <span className="flex items-center gap-1 text-[9px] font-bold text-orange-400 uppercase tracking-widest">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" /> Action needed
              </span>
            )}
          </div>
          <Link to="/issues" className="group flex items-center gap-1 text-[11px] font-bold text-indigo-400 hover:text-indigo-300 transition-colors">
            Board <svg className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
          </Link>
        </div>

        {unassigned.length > 0 && (
          <div className="grid grid-cols-[auto_1fr_auto_auto] gap-4 px-5 py-2 border-b border-zinc-800/40 bg-zinc-950/20">
            <span className="text-[9px] font-black uppercase tracking-[0.18em] text-zinc-700">Pri</span>
            <span className="text-[9px] font-black uppercase tracking-[0.18em] text-zinc-700">Issue</span>
            <span className="text-[9px] font-black uppercase tracking-[0.18em] text-zinc-700">Status</span>
            <span className="text-[9px] font-black uppercase tracking-[0.18em] text-zinc-700">Assign to</span>
          </div>
        )}

        <div className="divide-y divide-zinc-800/50">
          {unassigned.map((issue) => {
            const st = statusConfig[issue.status] || statusConfig.open;
            return (
              <div key={issue._id} className="grid grid-cols-[auto_1fr_auto_auto] gap-4 items-center px-5 py-3 hover:bg-zinc-800/20 transition-colors">
                <span className={`w-2 h-2 rounded-full shrink-0 ${priorityDot[issue.severity] || "bg-zinc-500"}`} />
                <div className="min-w-0">
                  <p className="text-[13px] font-medium text-zinc-200 truncate">{issue.title}</p>
                  {issue.project?.name && <p className="text-[10px] text-zinc-600 mt-0.5">{issue.project.name}</p>}
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border capitalize flex items-center gap-1 whitespace-nowrap ${st.badge}`}>
                  <span className={`w-1 h-1 rounded-full ${st.dot}`} />{issue.status}
                </span>
                <select
                  value={issue.assignedTo?._id || ""}
                  onChange={(e) => handleAssign(issue._id, e.target.value)}
                  className="bg-zinc-800/80 hover:bg-zinc-800 text-zinc-200 text-[11px] font-medium px-2 py-1 rounded-lg border border-zinc-700/50 hover:border-zinc-600 focus:outline-none focus:ring-1 focus:ring-indigo-500/40 cursor-pointer min-w-[110px] transition-all"
                >
                  <option value="">Unassigned</option>
                  {(issue.project?.members?.filter((m) => m.role === "developer") || allDevelopers).map((dev) => (
                    <option key={dev._id} value={dev._id}>{dev.name}</option>
                  ))}
                </select>
              </div>
            );
          })}
          {unassigned.length === 0 && (
            <div className="flex flex-col items-center justify-center py-10 gap-2">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
              </div>
              <p className="text-sm font-semibold text-zinc-500">All issues are assigned</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Recent issues ── */}
      <div className="bg-zinc-900 border border-zinc-800/80 rounded-2xl overflow-hidden">
        <div className="h-[3px] bg-indigo-500/40" />
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-zinc-800/60">
          <div className="flex items-center gap-2.5">
            <div className="w-1.5 h-4 rounded-full bg-gradient-to-b from-indigo-400 to-violet-500" />
            <h3 className="text-[13px] font-bold text-zinc-200 tracking-tight">Recent Issues</h3>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-zinc-800 text-zinc-400 border border-zinc-700/50">{managedIssues.length}</span>
          </div>
          <Link to="/issues" className="group flex items-center gap-1 text-[11px] font-bold text-indigo-400 hover:text-indigo-300 transition-colors">
            View all <svg className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
          </Link>
        </div>
        <div className="divide-y divide-zinc-800/40">
          {managedIssues.slice(0, 6).map((issue) => {
            const st = statusConfig[issue.status] || statusConfig.open;
            return (
              <div key={issue._id} className="flex items-center justify-between px-5 py-3 hover:bg-zinc-800/20 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${priorityDot[issue.severity] || "bg-zinc-500"}`} />
                  <div className="min-w-0">
                    <p className="text-[13px] font-medium text-zinc-200 truncate">{issue.title}</p>
                    <p className="text-[10px] text-zinc-600">{issue.project?.name || "—"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 ml-4 shrink-0">
                  {issue.assignedTo ? (
                    <span className="flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-[8px] font-black text-white uppercase">{issue.assignedTo?.name?.[0] || "?"}</span>
                      <span className="text-[11px] text-zinc-400 hidden sm:block">{issue.assignedTo?.name}</span>
                    </span>
                  ) : (
                    <span className="text-[10px] text-orange-400 font-bold">Unassigned</span>
                  )}
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border capitalize flex items-center gap-1 ${st.badge}`}>
                    <span className={`w-1 h-1 rounded-full ${st.dot}`} />{issue.status}
                  </span>
                </div>
              </div>
            );
          })}
          {managedIssues.length === 0 && <p className="px-5 py-8 text-sm text-zinc-600 text-center">No issues in your projects.</p>}
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboard;