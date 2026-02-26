import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchIssuesThunk } from "../issues/issueThunk";
import { fetchProjectsThunk } from "../projects/projectThunk";
import { Link } from "react-router-dom";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import CreateIssueForm from "../issues/components/CreateIssueForm";
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

const priorityConfig = {
  low:      { bar: "bg-sky-400",    text: "text-sky-400",    width: "w-1/4"  },
  medium:   { bar: "bg-amber-400",  text: "text-amber-400",  width: "w-2/4"  },
  high:     { bar: "bg-orange-400", text: "text-orange-400", width: "w-3/4"  },
  critical: { bar: "bg-red-500",    text: "text-red-400",    width: "w-full" },
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

const TesterDashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);
  const { issues, loading: iLoading } = useSelector((s) => s.issues);
  const { projects } = useSelector((s) => s.projects);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    dispatch(fetchIssuesThunk());
    dispatch(fetchProjectsThunk());
  }, [dispatch]);

  const userId = user?.id || user?._id;

  // Issues reported by this tester
  const myIssues = issues.filter(
    (i) => String(i.createdBy?._id || i.createdBy) === String(userId)
  );

  const openCount     = myIssues.filter((i) => i.status === "open").length;
  const resolvedCount = myIssues.filter((i) => i.status === "resolved").length;
  const closedCount   = myIssues.filter((i) => i.status === "closed").length;
  const criticalCount = myIssues.filter((i) => i.severity === "critical").length;
  const resolutionRate = myIssues.length > 0
    ? Math.round(((resolvedCount + closedCount) / myIssues.length) * 100)
    : 0;

  if (iLoading) return <Loader />;

  return (
    <div className="space-y-5 pb-6">

      {/* ── Hero ── */}
      <div className="relative overflow-hidden rounded-2xl border border-zinc-800/60 bg-zinc-900 p-6">
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: "radial-gradient(circle at 20% 50%, #10b981 0%, transparent 50%), radial-gradient(circle at 80% 20%, #06b6d4 0%, transparent 40%)" }} />
        <div className="absolute top-0 right-0 w-72 h-72 opacity-[0.025]"
          style={{ backgroundImage: "radial-gradient(circle, #34d399 1px, transparent 1px)", backgroundSize: "20px 20px" }} />
        <div className="relative flex items-center justify-between gap-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-zinc-600 mb-1">{getGreeting()}, Tester</p>
            <h1 className="text-2xl font-black text-zinc-100 tracking-tight">{user?.name || "Tester"}</h1>
            <p className="text-sm text-zinc-500 mt-1">
              {criticalCount > 0
                ? <span className="text-red-400 font-semibold">{criticalCount} critical bug{criticalCount > 1 ? "s" : ""} you reported</span>
                : myIssues.length === 0
                  ? "No issues reported yet — start testing!"
                  : `${openCount} open · ${resolvedCount + closedCount} resolved out of ${myIssues.length} reported`}
            </p>
          </div>
          {/* Resolution ring */}
          <div className="shrink-0 relative w-16 h-16">
            <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
              <circle cx="32" cy="32" r="26" fill="none" stroke="#27272a" strokeWidth="6" />
              <circle cx="32" cy="32" r="26" fill="none" stroke="#10b981" strokeWidth="6" strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 26}`}
                strokeDashoffset={`${2 * Math.PI * 26 * (1 - resolutionRate / 100)}`} />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-[13px] font-black text-zinc-100 leading-none">{resolutionRate}%</span>
              <span className="text-[8px] text-zinc-600 font-bold uppercase tracking-wide mt-0.5">fixed</span>
            </div>
          </div>
        </div>
        {myIssues.length > 0 && (
          <div className="relative mt-5">
            <div className="flex justify-between mb-1.5">
              <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">Fix Rate</span>
              <span className="text-[10px] font-bold text-zinc-400">{resolvedCount + closedCount} / {myIssues.length}</span>
            </div>
            <div className="h-1 w-full rounded-full bg-zinc-800 overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-700" style={{ width: `${resolutionRate}%` }} />
            </div>
          </div>
        )}
      </div>

      {/* ── Stat cards + CTA ── */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard label="Reported" value={myIssues.length} color="text-indigo-400" glow="#6366f1" sub="by you"
          icon={<svg className="w-4 h-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>}
        />
        <StatCard label="Open" value={openCount} color="text-red-400" glow="#ef4444" sub="unresolved"
          icon={<svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /></svg>}
        />
        <StatCard label="Resolved" value={resolvedCount + closedCount} color="text-emerald-400" glow="#10b981" sub="fixed"
          icon={<svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
      </div>

      {/* ── Report new issue CTA ── */}
      <div className="relative overflow-hidden rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5 flex items-center justify-between gap-4">
        <div className="absolute right-0 top-0 bottom-0 w-32 opacity-[0.04]"
          style={{ backgroundImage: "radial-gradient(circle, #10b981 1px, transparent 1px)", backgroundSize: "16px 16px" }} />
        <div className="relative">
          <p className="text-sm font-bold text-zinc-200">Found a bug?</p>
          <p className="text-xs text-zinc-500 mt-0.5">Report a new issue and track it through to resolution.</p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
          New Issue
        </Button>
      </div>

      {/* ── Issues I reported ── */}
      <div className="bg-zinc-900 border border-zinc-800/80 rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-zinc-800/60">
          <div className="flex items-center gap-2.5">
            <div className="w-1.5 h-4 rounded-full bg-gradient-to-b from-emerald-400 to-teal-500" />
            <h3 className="text-[13px] font-bold text-zinc-200 tracking-tight">Issues I Reported</h3>
            {myIssues.length > 0 && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-zinc-800 text-zinc-400 border border-zinc-700/50">{myIssues.length}</span>
            )}
          </div>
          <Link to="/issues" className="group flex items-center gap-1 text-[11px] font-bold text-indigo-400 hover:text-indigo-300 transition-colors">
            View all <svg className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
          </Link>
        </div>

        {/* Column headers */}
        {myIssues.length > 0 && (
          <div className="grid grid-cols-[1fr_100px_80px] gap-4 px-5 py-2 border-b border-zinc-800/40 bg-zinc-950/20">
            <span className="text-[9px] font-black uppercase tracking-[0.18em] text-zinc-700">Issue</span>
            <span className="text-[9px] font-black uppercase tracking-[0.18em] text-zinc-700">Priority</span>
            <span className="text-[9px] font-black uppercase tracking-[0.18em] text-zinc-700 text-right">Status</span>
          </div>
        )}

        <div className="divide-y divide-zinc-800/40">
          {myIssues.slice(0, 7).map((issue) => {
            const st  = statusConfig[issue.status] || statusConfig.open;
            const pri = priorityConfig[issue.severity] || priorityConfig.low;
            return (
              <div key={issue._id} className="grid grid-cols-[1fr_100px_80px] gap-4 items-center px-5 py-3.5 hover:bg-white/[0.02] transition-colors group">
                <div className="min-w-0">
                  <p className="text-[13px] font-semibold text-zinc-200 truncate group-hover:text-white transition-colors">{issue.title}</p>
                  <p className="text-[10px] text-zinc-600 mt-0.5 truncate">{issue.project?.name || "—"}</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-[3px] rounded-full bg-zinc-800 overflow-hidden">
                    <div className={`h-full rounded-full ${pri.bar} ${pri.width}`} />
                  </div>
                  <span className={`text-[10px] font-bold capitalize shrink-0 ${pri.text}`}>{issue.severity}</span>
                </div>
                <div className="flex justify-end">
                  <span className={`flex items-center gap-1.5 text-[10px] font-bold px-2 py-1 rounded-lg border capitalize whitespace-nowrap ${st.badge}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                    {issue.status}
                  </span>
                </div>
              </div>
            );
          })}
          {myIssues.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <div className="w-12 h-12 rounded-2xl bg-zinc-800/60 border border-zinc-700/40 flex items-center justify-center">
                <svg className="w-5 h-5 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <p className="text-sm font-semibold text-zinc-500">No issues reported yet</p>
              <p className="text-xs text-zinc-700">Start by reporting a bug above</p>
            </div>
          )}
        </div>

        {/* Footer breakdown */}
        {myIssues.length > 0 && (
          <div className="flex items-center gap-2 px-5 py-3 border-t border-zinc-800/60 bg-zinc-950/20 flex-wrap">
            {[
              { label: "Open",     count: openCount,     dot: "bg-red-400"     },
              { label: "Resolved", count: resolvedCount, dot: "bg-emerald-400" },
              { label: "Closed",   count: closedCount,   dot: "bg-zinc-500"    },
            ].map(({ label, count, dot }) => (
              <div key={label} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800/60">
                <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
                <span className="text-[10px] font-semibold text-zinc-500">{count} {label}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Report New Issue">
        <CreateIssueForm projects={projects} onSuccess={() => { setShowModal(false); dispatch(fetchIssuesThunk()); }} />
      </Modal>
    </div>
  );
};

export default TesterDashboard;