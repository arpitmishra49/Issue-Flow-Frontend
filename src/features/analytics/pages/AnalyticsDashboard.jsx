import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, Link } from "react-router-dom";
import { fetchAnalyticsThunk } from "../analyticsThunks";
import Loader from "../../../components/ui/Loader";

// ── Helpers ───────────────────────────────────────────────────────────────────

// Backend returns issuesByStatus as [{_id: "open", count: 3}, ...]
// This normalises it to a plain {open: 3, "in-progress": 2, ...} map
const toMap = (arr = []) =>
  arr.reduce((acc, { _id, count }) => ({ ...acc, [_id]: count }), {});

const fmtDuration = (ms) => {
  if (!ms) return "—";
  const h = ms / 3600000;
  if (h < 24) return `${Math.round(h)}h`;
  return `${Math.round(h / 24)}d`;
};

// ── Mini bar chart component ──────────────────────────────────────────────────

const BarRow = ({ label, value, max, color, textColor }) => {
  const pct = max ? Math.round((value / max) * 100) : 0;
  return (
    <div className="group">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[11px] font-semibold text-zinc-400 group-hover:text-zinc-200 transition-colors">{label}</span>
        <div className="flex items-center gap-2">
          <span className={`text-[10px] font-bold ${textColor}`}>{pct}%</span>
          <span className="text-[11px] font-bold text-zinc-200 w-5 text-right">{value}</span>
        </div>
      </div>
      <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
};

// ── Donut segment (pure SVG) ──────────────────────────────────────────────────

const DonutChart = ({ segments }) => {
  const r = 40;
  const circ = 2 * Math.PI * r;
  const total = segments.reduce((s, d) => s + d.value, 0);
  let offset = 0;

  return (
    <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
      <circle cx="50" cy="50" r={r} fill="none" stroke="#27272a" strokeWidth="14" />
      {total === 0 ? (
        <circle cx="50" cy="50" r={r} fill="none" stroke="#3f3f46" strokeWidth="14" strokeDasharray={circ} strokeDashoffset="0" />
      ) : (
        segments.map(({ value, color }, i) => {
          const pct   = value / total;
          const dash  = circ * pct;
          const gap   = circ - dash;
          const seg   = (
            <circle
              key={i}
              cx="50" cy="50" r={r}
              fill="none"
              stroke={color}
              strokeWidth="14"
              strokeDasharray={`${dash} ${gap}`}
              strokeDashoffset={-offset}
              strokeLinecap="butt"
            />
          );
          offset += dash;
          return seg;
        })
      )}
    </svg>
  );
};

// ── Main component ────────────────────────────────────────────────────────────

const AnalyticsDashboard = () => {
  const { projectId } = useParams();
  const dispatch = useDispatch();
  const { data, loading, error } = useSelector((s) => s.analytics);

  useEffect(() => {
    if (projectId) dispatch(fetchAnalyticsThunk(projectId));
  }, [projectId, dispatch]);

  if (loading) return <Loader />;

  if (error) return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <div className="w-10 h-10 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
        <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
        </svg>
      </div>
      <p className="text-sm text-red-400 font-medium">{error}</p>
      <Link to="/projects" className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">← Back to projects</Link>
    </div>
  );

  if (!data) return null;

  // ── Parse backend shape ───────────────────────────────────────────────────
  const statusMap   = toMap(data.issuesByStatus);
  const severityMap = toMap(data.issuesBySeverity);

  const openCount       = statusMap["open"]        || 0;
  const inProgressCount = statusMap["in-progress"] || 0;
  const resolvedCount   = statusMap["resolved"]    || 0;
  const closedCount     = statusMap["closed"]      || 0;
  const total           = data.totalIssues         || 0;

  const criticalCount = severityMap["critical"] || 0;
  const highCount     = severityMap["high"]     || 0;
  const mediumCount   = severityMap["medium"]   || 0;
  const lowCount      = severityMap["low"]      || 0;

  const resolutionRate = total > 0
    ? Math.round(((resolvedCount + closedCount) / total) * 100)
    : 0;

  const statusSegments = [
    { value: openCount,       color: "#ef4444" },
    { value: inProgressCount, color: "#f59e0b" },
    { value: resolvedCount,   color: "#10b981" },
    { value: closedCount,     color: "#52525b" },
  ];

  const statusRows = [
    { label: "Open",        value: openCount,       color: "bg-red-500",     textColor: "text-red-400"     },
    { label: "In Progress", value: inProgressCount, color: "bg-amber-500",   textColor: "text-amber-400"   },
    { label: "Resolved",    value: resolvedCount,   color: "bg-emerald-500", textColor: "text-emerald-400" },
    { label: "Closed",      value: closedCount,     color: "bg-zinc-500",    textColor: "text-zinc-400"    },
  ];
  //checking 

  const priorityRows = [
    { label: "Critical", value: criticalCount, color: "bg-red-500",    textColor: "text-red-400"    },
    { label: "High",     value: highCount,     color: "bg-orange-500", textColor: "text-orange-400" },
    { label: "Medium",   value: mediumCount,   color: "bg-amber-500",  textColor: "text-amber-400"  },
    { label: "Low",      value: lowCount,      color: "bg-sky-500",    textColor: "text-sky-400"    },
  ];

  const statCards = [
    { label: "Total Issues",  value: total,           color: "text-indigo-400", accent: "bg-indigo-500",  glow: "#6366f1" },
    { label: "Open",          value: openCount,       color: "text-red-400",    accent: "bg-red-500",     glow: "#ef4444" },
    { label: "In Progress",   value: inProgressCount, color: "text-amber-400",  accent: "bg-amber-500",   glow: "#f59e0b" },
    { label: "Resolved",      value: resolvedCount,   color: "text-emerald-400",accent: "bg-emerald-500", glow: "#10b981" },
  ];

  return (
    <div className="space-y-5 pb-6">

      {/* ── Breadcrumb + header ── */}
      <div className="flex items-end justify-between">
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <Link to="/projects" className="text-[11px] font-semibold text-zinc-600 hover:text-zinc-400 transition-colors">Projects</Link>
            <svg className="w-3 h-3 text-zinc-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
            <span className="text-[11px] font-semibold text-zinc-400">Analytics</span>
          </div>
          <h2 className="text-xl font-black text-zinc-100 tracking-tight">Project Analytics</h2>
          <p className="text-xs text-zinc-500 mt-0.5 font-medium">Performance overview and issue breakdown</p>
        </div>

        {/* Resolution badge */}
        <div className="flex flex-col items-end gap-1">
          <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">Resolution Rate</span>
          <span className={`text-3xl font-black tracking-tight ${resolutionRate >= 75 ? "text-emerald-400" : resolutionRate >= 40 ? "text-amber-400" : "text-red-400"}`}>
            {resolutionRate}%
          </span>
        </div>
      </div>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {statCards.map(({ label, value, color, accent, glow }) => (
          <div key={label} className="relative overflow-hidden bg-zinc-900 border border-zinc-800/80 rounded-2xl p-5 group hover:border-zinc-700 transition-all duration-300">
            <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full blur-2xl opacity-10 group-hover:opacity-20 transition-opacity" style={{ background: glow }} />
            <div className="relative">
              <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-600 block mb-3">{label}</span>
              <p className={`text-[2.8rem] font-black leading-none tracking-tight ${color}`}>{value}</p>
              <div className={`mt-3 h-0.5 w-8 rounded-full ${accent} opacity-40 group-hover:w-full group-hover:opacity-70 transition-all duration-500`} />
            </div>
          </div>
        ))}
      </div>

      {/* ── Middle row: donut + status + priority ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Donut chart */}
        <div className="bg-zinc-900 border border-zinc-800/80 rounded-2xl p-5 flex flex-col items-center justify-center gap-4">
          <div className="w-36 h-36 relative">
            <DonutChart segments={statusSegments} />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-black text-zinc-100">{total}</span>
              <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-600">Total</span>
            </div>
          </div>
          {/* Legend */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 w-full">
            {[
              { label: "Open",        color: "bg-red-500",     count: openCount       },
              { label: "In Progress", color: "bg-amber-500",   count: inProgressCount },
              { label: "Resolved",    color: "bg-emerald-500", count: resolvedCount   },
              { label: "Closed",      color: "bg-zinc-500",    count: closedCount     },
            ].map(({ label, color, count }) => (
              <div key={label} className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${color} shrink-0`} />
                <span className="text-[10px] text-zinc-500 font-medium truncate">{label}</span>
                <span className="text-[10px] font-bold text-zinc-300 ml-auto">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Status breakdown */}
        <div className="bg-zinc-900 border border-zinc-800/80 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-4 rounded-full bg-gradient-to-b from-indigo-400 to-violet-500" />
            <h3 className="text-[12px] font-bold text-zinc-200 tracking-tight uppercase">By Status</h3>
          </div>
          <div className="space-y-4">
            {statusRows.map((row) => (
              <BarRow key={row.label} {...row} max={total || 1} />
            ))}
          </div>
        </div>

        {/* Priority breakdown */}
        <div className="bg-zinc-900 border border-zinc-800/80 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-4 rounded-full bg-gradient-to-b from-orange-400 to-red-500" />
            <h3 className="text-[12px] font-bold text-zinc-200 tracking-tight uppercase">By Priority</h3>
          </div>
          <div className="space-y-4">
            {priorityRows.map((row) => (
              <BarRow key={row.label} {...row} max={total || 1} />
            ))}
          </div>
        </div>
      </div>

      {/* ── Bottom row: resolution bar + avg time + workload ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Resolution rate bar */}
        <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800/80 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <div className="w-1 h-4 rounded-full bg-gradient-to-b from-emerald-400 to-teal-500" />
              <h3 className="text-[12px] font-bold text-zinc-200 uppercase tracking-tight">Resolution Progress</h3>
            </div>
            <span className={`text-2xl font-black ${resolutionRate >= 75 ? "text-emerald-400" : resolutionRate >= 40 ? "text-amber-400" : "text-red-400"}`}>
              {resolutionRate}%
            </span>
          </div>

          {/* Stacked bar */}
          <div className="h-3 w-full rounded-full overflow-hidden flex gap-px bg-zinc-800">
            {statusRows.filter(r => r.value > 0).map(({ label, value, color }) => (
              <div
                key={label}
                className={`h-full ${color} transition-all duration-700`}
                style={{ width: `${(value / total) * 100}%` }}
                title={`${label}: ${value}`}
              />
            ))}
          </div>

          {/* Labels */}
          <div className="flex items-center gap-4 mt-3 flex-wrap">
            {statusRows.map(({ label, value, color }) => (
              <div key={label} className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${color}`} />
                <span className="text-[10px] text-zinc-500">{label} <span className="text-zinc-300 font-bold">{value}</span></span>
              </div>
            ))}
          </div>
        </div>

        {/* Avg resolution time */}
        <div className="bg-zinc-900 border border-zinc-800/80 rounded-2xl p-5 flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1 h-4 rounded-full bg-gradient-to-b from-sky-400 to-blue-500" />
            <h3 className="text-[12px] font-bold text-zinc-200 uppercase tracking-tight">Avg Resolution</h3>
          </div>
          <div>
            <p className="text-[2.8rem] font-black text-zinc-100 leading-none tracking-tight">
              {fmtDuration(data.averageResolutionTime)}
            </p>
            <p className="text-[10px] text-zinc-600 mt-2 font-semibold uppercase tracking-widest">Average time to close</p>
          </div>
          <div className="mt-4 pt-4 border-t border-zinc-800/60">
            <p className="text-[10px] text-zinc-600 font-semibold uppercase tracking-widest mb-1">Developer Workload</p>
            <p className="text-lg font-black text-zinc-300">
              {data.developerWorkload?.length || 0}
              <span className="text-[11px] font-semibold text-zinc-600 ml-1">developers assigned</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;