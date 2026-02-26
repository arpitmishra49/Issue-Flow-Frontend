import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchIssuesThunk } from "../issues/issueThunk";
import { Link } from "react-router-dom";
import Loader from "../../components/ui/Loader";

// ── Configs ───────────────────────────────────────────────────────────────────

const statusConfig = {
  open:          { label: "Open",        dot: "bg-red-400",     badge: "bg-red-500/10 text-red-400 border-red-500/20"             },
  "in-progress": { label: "In Progress", dot: "bg-amber-400",   badge: "bg-amber-500/10 text-amber-400 border-amber-500/20"       },
  resolved:      { label: "Resolved",    dot: "bg-emerald-400", badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
  closed:        { label: "Closed",      dot: "bg-zinc-500",    badge: "bg-zinc-500/10 text-zinc-400 border-zinc-700/40"          },
};

const priorityConfig = {
  low:      { label: "Low",      bar: "bg-sky-400",    text: "text-sky-400",    width: "w-1/4"  },
  medium:   { label: "Medium",   bar: "bg-amber-400",  text: "text-amber-400",  width: "w-2/4"  },
  high:     { label: "High",     bar: "bg-orange-400", text: "text-orange-400", width: "w-3/4"  },
  critical: { label: "Critical", bar: "bg-red-500",    text: "text-red-400",    width: "w-full" },
};

// ── Greeting ──────────────────────────────────────────────────────────────────

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
};

// ── Sub-components ────────────────────────────────────────────────────────────

const StatCard = ({ label, value, color, sublabel, accent, icon }) => (
  <div className={`relative overflow-hidden rounded-2xl border bg-zinc-900 border-zinc-800/80 p-5 group hover:border-zinc-700/80 transition-all duration-300`}>
    {/* corner glow */}
    <div className={`absolute -top-6 -right-6 w-20 h-20 rounded-full blur-2xl opacity-20 group-hover:opacity-30 transition-opacity ${accent}`} />
    <div className="relative">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-600">{label}</span>
        <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${accent} bg-opacity-10`}>
          {icon}
        </div>
      </div>
      <p className={`text-[2.5rem] font-black leading-none tracking-tight ${color}`}>{value}</p>
      {sublabel && <p className="text-[10px] text-zinc-600 mt-2 font-medium">{sublabel}</p>}
    </div>
  </div>
);

// ── Main Component ────────────────────────────────────────────────────────────

const DeveloperDashboard = () => {
  const dispatch = useDispatch();
  const { user }            = useSelector((s) => s.auth);
  const { issues, loading } = useSelector((s) => s.issues);

  const userId = user?.id || user?._id;

  useEffect(() => {
    if (userId) dispatch(fetchIssuesThunk());
  }, [dispatch, userId]);

  const myIssues      = issues.filter((issue) => {
    if (!issue.assignedTo || !userId) return false;
    return String(issue.assignedTo?._id || issue.assignedTo) === String(userId);
  });

  const openCount       = myIssues.filter((i) => i.status === "open").length;
  const inProgressCount = myIssues.filter((i) => i.status === "in-progress").length;
  const resolvedCount   = myIssues.filter((i) => i.status === "resolved").length;
  const closedCount     = myIssues.filter((i) => i.status === "closed").length;

  // Completion rate — resolved + closed out of total
  const completionRate = myIssues.length
    ? Math.round(((resolvedCount + closedCount) / myIssues.length) * 100)
    : 0;

  // Critical issues — need attention first
  const criticalIssues = myIssues.filter(
    (i) => i.severity === "critical" && i.status !== "closed"
  );

  if (loading) return <Loader />;

  return (
    <div className="space-y-6 pb-6">

      {/* ── Hero greeting ── */}
      <div className="relative overflow-hidden rounded-2xl border border-zinc-800/60 bg-zinc-900 p-6">
        {/* Background mesh */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: "radial-gradient(circle at 20% 50%, #6366f1 0%, transparent 50%), radial-gradient(circle at 80% 20%, #8b5cf6 0%, transparent 40%)" }} />
        <div className="absolute top-0 right-0 w-64 h-64 opacity-[0.04]"
          style={{ backgroundImage: "radial-gradient(circle, #6366f1 1px, transparent 1px)", backgroundSize: "20px 20px" }} />

        <div className="relative flex items-center justify-between gap-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-600 mb-1">{getGreeting()}</p>
            <h1 className="text-2xl font-black text-zinc-100 tracking-tight leading-tight">
              {user?.name || "Developer"}
            </h1>
            <p className="text-sm text-zinc-500 mt-1">
              {myIssues.length === 0
                ? "No issues assigned — you're all clear."
                : `You have ${openCount + inProgressCount} active issue${openCount + inProgressCount !== 1 ? "s" : ""} to work on.`}
            </p>
          </div>

          {/* Completion ring */}
          <div className="shrink-0 relative w-16 h-16">
            <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
              <circle cx="32" cy="32" r="26" fill="none" stroke="#27272a" strokeWidth="6" />
              <circle
                cx="32" cy="32" r="26" fill="none"
                stroke="#6366f1" strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 26}`}
                strokeDashoffset={`${2 * Math.PI * 26 * (1 - completionRate / 100)}`}
                style={{ transition: "stroke-dashoffset 1s ease" }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-[13px] font-black text-zinc-100 leading-none">{completionRate}%</span>
              <span className="text-[8px] text-zinc-600 font-bold uppercase tracking-wide mt-0.5">done</span>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        {myIssues.length > 0 && (
          <div className="relative mt-5">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">Completion</span>
              <span className="text-[10px] font-bold text-zinc-400">{resolvedCount + closedCount} / {myIssues.length} resolved</span>
            </div>
            <div className="h-1 w-full rounded-full bg-zinc-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-700"
                style={{ width: `${completionRate}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard
          label="Total"
          value={myIssues.length}
          color="text-indigo-400"
          sublabel="assigned to you"
          accent="bg-indigo-500"
          icon={<svg className="w-3 h-3 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>}
        />
        <StatCard
          label="Open"
          value={openCount}
          color="text-red-400"
          sublabel="needs attention"
          accent="bg-red-500"
          icon={<svg className="w-3 h-3 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /></svg>}
        />
        <StatCard
          label="In Progress"
          value={inProgressCount}
          color="text-amber-400"
          sublabel="being worked on"
          accent="bg-amber-500"
          icon={<svg className="w-3 h-3 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
      </div>

      {/* ── Critical issues alert ── */}
      {criticalIssues.length > 0 && (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/5 px-5 py-4 flex items-center gap-4">
          <div className="w-8 h-8 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
            <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-bold text-red-400">
              {criticalIssues.length} critical issue{criticalIssues.length > 1 ? "s" : ""} need immediate attention
            </p>
            <p className="text-[11px] text-zinc-500 mt-0.5 truncate">
              {criticalIssues.map((i) => i.title).join(" · ")}
            </p>
          </div>
          <Link to="/issues" className="shrink-0 text-[11px] font-bold text-red-400 hover:text-red-300 transition-colors whitespace-nowrap">
            View →
          </Link>
        </div>
      )}

      {/* ── Issues table ── */}
      <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900 overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-zinc-800/80">
          <div className="flex items-center gap-2.5">
            <div className="w-1.5 h-4 rounded-full bg-gradient-to-b from-indigo-400 to-violet-500" />
            <h3 className="text-[13px] font-bold text-zinc-100 tracking-tight">Assigned Issues</h3>
            {myIssues.length > 0 && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-zinc-800 text-zinc-400 border border-zinc-700/50">
                {myIssues.length}
              </span>
            )}
          </div>
          <Link to="/issues" className="group flex items-center gap-1 text-[11px] font-bold text-indigo-400 hover:text-indigo-300 transition-colors">
            View all
            <svg className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {/* Column headers */}
        {myIssues.length > 0 && (
          <div className="grid grid-cols-[1fr_100px_80px] gap-4 px-5 py-2 border-b border-zinc-800/40 bg-zinc-950/30">
            <span className="text-[9px] font-black uppercase tracking-[0.18em] text-zinc-700">Issue</span>
            <span className="text-[9px] font-black uppercase tracking-[0.18em] text-zinc-700">Priority</span>
            <span className="text-[9px] font-black uppercase tracking-[0.18em] text-zinc-700 text-right">Status</span>
          </div>
        )}

        {/* Rows */}
        <div className="divide-y divide-zinc-800/40">
          {myIssues.slice(0, 7).map((issue) => {
            const st  = statusConfig[issue.status]   || statusConfig.open;
            const pri = priorityConfig[issue.severity] || priorityConfig.low;

            return (
              <div key={issue._id} className="grid grid-cols-[1fr_100px_80px] gap-4 items-center px-5 py-3.5 hover:bg-white/[0.02] transition-colors group">

                {/* Title */}
                <div className="min-w-0">
                  <p className="text-[13px] font-semibold text-zinc-200 truncate group-hover:text-white transition-colors">
                    {issue.title}
                  </p>
                  {issue.project?.name && (
                    <p className="text-[10px] text-zinc-600 mt-0.5 truncate">{issue.project.name}</p>
                  )}
                </div>

                {/* Priority bar */}
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-[3px] rounded-full bg-zinc-800 overflow-hidden">
                    <div className={`h-full rounded-full ${pri.bar} ${pri.width}`} />
                  </div>
                  <span className={`text-[10px] font-bold capitalize shrink-0 ${pri.text}`}>{pri.label}</span>
                </div>

                {/* Status */}
                <div className="flex justify-end">
                  <span className={`flex items-center gap-1.5 text-[10px] font-bold px-2 py-1 rounded-lg border capitalize whitespace-nowrap ${st.badge}`}>
                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${st.dot}`} />
                    {st.label}
                  </span>
                </div>
              </div>
            );
          })}

          {myIssues.length === 0 && (
            <div className="flex flex-col items-center justify-center py-14 gap-3">
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl bg-zinc-800/60 border border-zinc-700/40 flex items-center justify-center">
                  <svg className="w-6 h-6 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                  <svg className="w-2.5 h-2.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-zinc-400">You're all clear</p>
                <p className="text-xs text-zinc-600 mt-0.5">No issues assigned to you yet</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer strip — status breakdown */}
        {myIssues.length > 0 && (
          <div className="flex items-center gap-1 px-5 py-3 border-t border-zinc-800/60 bg-zinc-950/20">
            {[
              { label: "Open",        count: openCount,       dot: "bg-red-400"     },
              { label: "In Progress", count: inProgressCount, dot: "bg-amber-400"   },
              { label: "Resolved",    count: resolvedCount,   dot: "bg-emerald-400" },
              { label: "Closed",      count: closedCount,     dot: "bg-zinc-500"    },
            ].map(({ label, count, dot }) => (
              <div key={label} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800/60 mr-1">
                <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
                <span className="text-[10px] font-semibold text-zinc-500">{count} {label}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DeveloperDashboard;