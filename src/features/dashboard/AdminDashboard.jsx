import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchProjectsThunk } from "../projects/projectThunk";
import { fetchIssuesThunk, deleteIssueThunk } from "../issues/issueThunk";
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
    <div className="absolute bottom-0 left-0 right-0 h-[2px] opacity-0 group-hover:opacity-30 transition-opacity"
      style={{ background: `linear-gradient(90deg, transparent, ${glow}, transparent)` }} />
  </div>
);

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);
  const { projects, loading: pLoading } = useSelector((s) => s.projects);
  const { issues,   loading: iLoading } = useSelector((s) => s.issues);

  useEffect(() => {
    dispatch(fetchProjectsThunk());
    dispatch(fetchIssuesThunk());
  }, [dispatch]);

  const openIssues     = issues.filter((i) => i.status === "open").length;
  const inProgress     = issues.filter((i) => i.status === "in-progress").length;
  const resolved       = issues.filter((i) => i.status === "resolved").length;
  const closed         = issues.filter((i) => i.status === "closed").length;
  const critical       = issues.filter((i) => i.severity === "critical" && i.status !== "closed").length;
  const total          = issues.length;
  const resolutionRate = total > 0 ? Math.round(((resolved + closed) / total) * 100) : 0;

  if (pLoading || iLoading) return <Loader />;

  return (
    <div className="space-y-5 pb-6">

      {/* ── Hero ── */}
      <div className="relative overflow-hidden rounded-2xl border border-zinc-800/60 bg-zinc-900 p-6">
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: "radial-gradient(circle at 15% 50%, #6366f1 0%, transparent 50%), radial-gradient(circle at 85% 20%, #8b5cf6 0%, transparent 40%)" }} />
        <div className="absolute top-0 right-0 w-72 h-72 opacity-[0.03]"
          style={{ backgroundImage: "radial-gradient(circle, #a78bfa 1px, transparent 1px)", backgroundSize: "22px 22px" }} />

        <div className="relative flex items-center justify-between gap-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-zinc-600 mb-1">{getGreeting()}, Admin</p>
            <h1 className="text-2xl font-black text-zinc-100 tracking-tight">{user?.name || "Administrator"}</h1>
            <p className="text-sm text-zinc-500 mt-1">
              {critical > 0
                ? <span className="text-red-400 font-semibold">{critical} critical issue{critical > 1 ? "s" : ""} need immediate attention</span>
                : `${projects.length} project${projects.length !== 1 ? "s" : ""} · ${total} total issues across the organisation`}
            </p>
          </div>
          <div className="shrink-0 relative w-16 h-16">
            <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
              <circle cx="32" cy="32" r="26" fill="none" stroke="#27272a" strokeWidth="6" />
              <circle cx="32" cy="32" r="26" fill="none" stroke="#6366f1" strokeWidth="6" strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 26}`}
                strokeDashoffset={`${2 * Math.PI * 26 * (1 - resolutionRate / 100)}`} />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-[13px] font-black text-zinc-100 leading-none">{resolutionRate}%</span>
              <span className="text-[8px] text-zinc-600 font-bold uppercase tracking-wide mt-0.5">resolved</span>
            </div>
          </div>
        </div>

        {total > 0 && (
          <div className="relative mt-5">
            <div className="flex justify-between mb-1.5">
              <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">Organisation Resolution</span>
              <span className="text-[10px] font-bold text-zinc-400">{resolved + closed} / {total}</span>
            </div>
            <div className="h-1 w-full rounded-full bg-zinc-800 overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-700"
                style={{ width: `${resolutionRate}%` }} />
            </div>
          </div>
        )}
      </div>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Projects" value={projects.length} color="text-indigo-400" glow="#6366f1" sub="total active"
          icon={<svg className="w-4 h-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>}
        />
        <StatCard label="Open Issues" value={openIssues} color="text-red-400" glow="#ef4444" sub="need attention"
          icon={<svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /></svg>}
        />
        <StatCard label="In Progress" value={inProgress} color="text-amber-400" glow="#f59e0b" sub="active work"
          icon={<svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
        <StatCard label="Resolved" value={resolved} color="text-emerald-400" glow="#10b981" sub="completed"
          icon={<svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
      </div>

      {/* ── Bottom: Projects + Analytics ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Projects list */}
        <div className="bg-zinc-900 border border-zinc-800/80 rounded-2xl overflow-hidden">
          <div className="h-[3px] bg-indigo-500/40" />
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-zinc-800/60">
            <div className="flex items-center gap-2.5">
              <div className="w-1.5 h-4 rounded-full bg-gradient-to-b from-indigo-400 to-violet-500" />
              <h3 className="text-[13px] font-bold text-zinc-200 tracking-tight">Projects</h3>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-zinc-800 text-zinc-400 border border-zinc-700/50">{projects.length}</span>
            </div>
            <Link to="/projects" className="group flex items-center gap-1 text-[11px] font-bold text-indigo-400 hover:text-indigo-300 transition-colors">
              View all <svg className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
            </Link>
          </div>
          <div className="divide-y divide-zinc-800/50">
            {projects.slice(0, 5).map((p) => (
              <Link key={p._id} to={`/projects/${p._id}`}
                className="flex items-center justify-between px-5 py-3 hover:bg-zinc-800/20 transition-colors group">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-6 h-6 rounded-lg bg-indigo-600/20 border border-indigo-500/20 flex items-center justify-center shrink-0">
                    <span className="text-[9px] font-black text-indigo-400 uppercase">{p.name?.[0]}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[13px] font-semibold text-zinc-200 group-hover:text-white transition-colors truncate">{p.name}</p>
                    <p className="text-[10px] text-zinc-600 truncate">{p.description || "No description"}</p>
                  </div>
                </div>
                <span className="text-[10px] font-semibold text-zinc-600 shrink-0 ml-3">{p.members?.length || 0} members</span>
              </Link>
            ))}
            {projects.length === 0 && <p className="px-5 py-8 text-sm text-zinc-600 text-center">No projects yet.</p>}
          </div>
        </div>

        {/* Analytics quick-access */}
        <div className="bg-zinc-900 border border-zinc-800/80 rounded-2xl overflow-hidden">
          <div className="h-[3px] bg-violet-500/40" />
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-zinc-800/60">
            <div className="flex items-center gap-2.5">
              <div className="w-1.5 h-4 rounded-full bg-gradient-to-b from-violet-400 to-purple-500" />
              <h3 className="text-[13px] font-bold text-zinc-200 tracking-tight">Analytics</h3>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-zinc-800 text-zinc-400 border border-zinc-700/50">{projects.length}</span>
            </div>
          </div>

          <div className="divide-y divide-zinc-800/50">
            {projects.slice(0, 5).map((p) => {
              const projectIssues = issues.filter((i) => i.project?._id === p._id || i.project === p._id);
              const done = projectIssues.filter((i) => ["resolved", "closed"].includes(i.status)).length;
              const rate = projectIssues.length > 0 ? Math.round((done / projectIssues.length) * 100) : 0;

              return (
                <Link key={p._id} to={`/analytics/${p._id}`}
                  className="flex items-center gap-4 px-5 py-3.5 hover:bg-zinc-800/20 transition-colors group">
                  <div className="w-7 h-7 rounded-xl bg-violet-600/15 border border-violet-500/20 flex items-center justify-center shrink-0">
                    <svg className="w-3.5 h-3.5 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-zinc-200 group-hover:text-white transition-colors truncate">{p.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 h-1 bg-zinc-800 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-violet-500 to-purple-400 rounded-full transition-all duration-500"
                          style={{ width: `${rate}%` }} />
                      </div>
                      <span className="text-[9px] font-bold text-zinc-600 shrink-0">{rate}%</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[11px] font-bold text-zinc-300">{projectIssues.length}</p>
                    <p className="text-[9px] text-zinc-600">issues</p>
                  </div>
                </Link>
              );
            })}
            {projects.length === 0 && (
              <div className="flex flex-col items-center justify-center py-10 gap-2">
                <p className="text-sm text-zinc-600">No projects to analyse yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── All Issues (admin can delete) ── */}
      <div className="bg-zinc-900 border border-zinc-800/80 rounded-2xl overflow-hidden">
        <div className="h-[3px] bg-red-500/30" />
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-zinc-800/60">
          <div className="flex items-center gap-2.5">
            <div className="w-1.5 h-4 rounded-full bg-gradient-to-b from-red-400 to-orange-500" />
            <h3 className="text-[13px] font-bold text-zinc-200 tracking-tight">All Issues</h3>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-zinc-800 text-zinc-400 border border-zinc-700/50">{issues.length}</span>
            <span className="text-[9px] font-black uppercase tracking-widest text-red-400/60 ml-1">Admin · can delete</span>
          </div>
        </div>

        {/* Column headers */}
        {issues.length > 0 && (
          <div className="grid grid-cols-[auto_1fr_120px_80px_32px] gap-3 px-5 py-2 border-b border-zinc-800/40 bg-zinc-950/20">
            <span className="text-[9px] font-black uppercase tracking-[0.18em] text-zinc-700">Pri</span>
            <span className="text-[9px] font-black uppercase tracking-[0.18em] text-zinc-700">Issue</span>
            <span className="text-[9px] font-black uppercase tracking-[0.18em] text-zinc-700">Project</span>
            <span className="text-[9px] font-black uppercase tracking-[0.18em] text-zinc-700">Status</span>
            <span />
          </div>
        )}

        <div className="divide-y divide-zinc-800/40">
          {issues.slice(0, 8).map((issue) => {
            const st = statusConfig[issue.status] || statusConfig.open;
            return (
              <div key={issue._id} className="grid grid-cols-[auto_1fr_120px_80px_32px] gap-3 items-center px-5 py-3 hover:bg-zinc-800/20 transition-colors group">
                <span className={`w-2 h-2 rounded-full shrink-0 ${priorityDot[issue.severity] || "bg-zinc-500"}`} />
                <p className="text-[13px] font-medium text-zinc-200 truncate group-hover:text-white transition-colors">{issue.title}</p>
                <p className="text-[11px] text-zinc-600 truncate">{issue.project?.name || "—"}</p>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border capitalize flex items-center gap-1 whitespace-nowrap ${st.badge}`}>
                  <span className={`w-1 h-1 rounded-full ${st.dot}`} />{issue.status}
                </span>
                <button
                  onClick={() => {
                    if (window.confirm(`Delete "${issue.title}"? This cannot be undone.`))
                      dispatch(deleteIssueThunk(issue._id));
                  }}
                  title="Delete issue"
                  className="opacity-0 group-hover:opacity-100 text-zinc-700 hover:text-red-400 hover:bg-red-500/10 rounded-md p-1 transition-all"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            );
          })}
          {issues.length === 0 && (
            <div className="flex flex-col items-center justify-center py-10 gap-2">
              <p className="text-sm text-zinc-600">No issues across any project.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;