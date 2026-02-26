import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchProjectsThunk } from "../projects/projectThunk";
import { fetchIssuesThunk } from "../issues/issueThunk";
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

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);
  const { projects, loading: pLoading } = useSelector((s) => s.projects);
  const { issues, loading: iLoading } = useSelector((s) => s.issues);

  useEffect(() => {
    dispatch(fetchProjectsThunk());
    dispatch(fetchIssuesThunk());
  }, [dispatch]);

  const openIssues    = issues.filter((i) => i.status === "open").length;
  const inProgress    = issues.filter((i) => i.status === "in-progress").length;
  const resolved      = issues.filter((i) => i.status === "resolved").length;
  const unassigned    = issues.filter((i) => !i.assignedTo).length;
  const critical      = issues.filter((i) => i.severity === "critical" && i.status !== "closed").length;
  const total         = issues.length;
  const resolutionRate = total > 0 ? Math.round(((resolved + issues.filter(i => i.status === "closed").length) / total) * 100) : 0;

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
                ? <span className="text-red-400 font-semibold">{critical} critical issue{critical > 1 ? "s" : ""} need attention</span>
                : `${unassigned} unassigned · ${openIssues} open across ${projects.length} projects`}
            </p>
          </div>
          {/* Resolution ring */}
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
              <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">Overall Resolution</span>
              <span className="text-[10px] font-bold text-zinc-400">{resolutionRate}%</span>
            </div>
            <div className="h-1 w-full rounded-full bg-zinc-800 overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-700" style={{ width: `${resolutionRate}%` }} />
            </div>
          </div>
        )}
      </div>

      {/* ── Stats grid ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Projects" value={projects.length} color="text-indigo-400" glow="#6366f1" sub="total active"
          icon={<svg className="w-4 h-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>}
        />
        <StatCard label="Open Issues" value={openIssues} color="text-red-400" glow="#ef4444" sub="need attention"
          icon={<svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /></svg>}
        />
        <StatCard label="In Progress" value={inProgress} color="text-amber-400" glow="#f59e0b" sub="being worked on"
          icon={<svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
        <StatCard label="Resolved" value={resolved} color="text-emerald-400" glow="#10b981" sub="closed out"
          icon={<svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
      </div>

      {/* ── Bottom grid: projects + recent issues ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Projects */}
        <div className="bg-zinc-900 border border-zinc-800/80 rounded-2xl overflow-hidden">
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

        {/* Recent issues */}
        <div className="bg-zinc-900 border border-zinc-800/80 rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-zinc-800/60">
            <div className="flex items-center gap-2.5">
              <div className="w-1.5 h-4 rounded-full bg-gradient-to-b from-red-400 to-orange-500" />
              <h3 className="text-[13px] font-bold text-zinc-200 tracking-tight">Recent Issues</h3>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-zinc-800 text-zinc-400 border border-zinc-700/50">{issues.length}</span>
            </div>
            <Link to="/issues" className="group flex items-center gap-1 text-[11px] font-bold text-indigo-400 hover:text-indigo-300 transition-colors">
              Board <svg className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
            </Link>
          </div>
          <div className="divide-y divide-zinc-800/50">
            {issues.slice(0, 5).map((issue) => {
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
                  <span className={`shrink-0 ml-3 text-[10px] font-bold px-2 py-0.5 rounded-full border capitalize ${st.badge}`}>
                    {issue.status}
                  </span>
                </div>
              );
            })}
            {issues.length === 0 && <p className="px-5 py-8 text-sm text-zinc-600 text-center">No issues yet.</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;