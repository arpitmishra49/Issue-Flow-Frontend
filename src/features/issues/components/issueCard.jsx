import { useDispatch, useSelector } from "react-redux";
import {
  updateIssueStatusThunk,
  assignIssueThunk,
  deleteIssueThunk,
} from "../issueThunk";

// ── Configs ───────────────────────────────────────────────────────────────────

const priorityConfig = {
  low:      { label: "Low",      dot: "bg-sky-400",    text: "text-sky-400",    bar: "bg-sky-400",    glow: "shadow-sky-500/20",    width: "w-1/4"  },
  medium:   { label: "Medium",   dot: "bg-amber-400",  text: "text-amber-400",  bar: "bg-amber-400",  glow: "shadow-amber-500/20",  width: "w-2/4"  },
  high:     { label: "High",     dot: "bg-orange-400", text: "text-orange-400", bar: "bg-orange-400", glow: "shadow-orange-500/20", width: "w-3/4"  },
  critical: { label: "Critical", dot: "bg-red-500",    text: "text-red-400",    bar: "bg-red-500",    glow: "shadow-red-500/30",    width: "w-full" },
};

const statusConfig = {
  "open":        { color: "bg-red-500/10 text-red-400 border-red-500/20",              dot: "bg-red-400"     },
  "in-progress": { color: "bg-amber-500/10 text-amber-400 border-amber-500/20",        dot: "bg-amber-400"   },
  "resolved":    { color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",  dot: "bg-emerald-400" },
  "closed":      { color: "bg-zinc-800/60 text-zinc-500 border-zinc-700/30",           dot: "bg-zinc-600"    },
};

// ── RBAC ──────────────────────────────────────────────────────────────────────
const getStatusOptionsForRole = (role) => {
  switch (role) {
    case "admin":
    case "manager":   return ["open", "in-progress", "resolved", "closed"];
    case "developer": return ["in-progress", "resolved"];
    case "tester":    return ["closed"];
    default:          return [];
  }
};

// ── Component ─────────────────────────────────────────────────────────────────

const IssueCard = ({ issue }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);

  const role             = user?.role;
  const isAdmin          = role === "admin";
  const isAdminOrManager = ["admin", "manager"].includes(role);
  const isDeveloper      = role === "developer";

  const canAssign       = isAdminOrManager;
  const canDelete       = isAdmin;
  const statusOptions   = getStatusOptionsForRole(role);
  const canChangeStatus = statusOptions.length > 0;

  const priority = priorityConfig[issue.severity] || priorityConfig.low;
  const status   = statusConfig[issue.status]     || statusConfig.open;

  const handleStatusChange = (e) =>
    dispatch(updateIssueStatusThunk({ id: issue._id, data: { status: e.target.value } }));

  const handleAssign = (e) =>
    dispatch(assignIssueThunk({ id: issue._id, data: { developerId: e.target.value || null } }));

  const handleDelete = () => {
    if (window.confirm(`Delete "${issue.title}"? This cannot be undone.`))
      dispatch(deleteIssueThunk(issue._id));
  };

  const developers = issue.project?.members?.filter((m) => m.role === "developer") || [];

  return (
    <div className={`
      group relative overflow-hidden
      bg-zinc-900/80 backdrop-blur-sm
      border border-zinc-800/60 hover:border-zinc-600/80
      rounded-xl p-3.5
      transition-all duration-200
      hover:shadow-lg hover:shadow-black/30
      hover:-translate-y-px
    `}>

      {/* Left priority accent line */}
      <div className={`absolute left-0 top-3 bottom-3 w-[2.5px] rounded-full ${priority.bar}`} />

      {/* Critical shimmer bg */}
      {issue.severity === "critical" && (
        <div className="absolute inset-0 bg-gradient-to-br from-red-500/[0.03] to-transparent pointer-events-none" />
      )}

      <div className="pl-3 space-y-2.5">

        {/* ── Row 1: title ── */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="text-[12.5px] font-bold text-zinc-200 leading-snug group-hover:text-white transition-colors line-clamp-2 tracking-tight">
              {issue.title}
            </p>
            {issue.description && (
              <p className="text-[10.5px] text-zinc-600 mt-1 line-clamp-1 leading-relaxed group-hover:text-zinc-500 transition-colors">
                {issue.description}
              </p>
            )}
          </div>

          {/* Priority badge — top right */}
          <span className={`shrink-0 text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-md border ${priority.text} border-current/20 bg-current/5 opacity-80 group-hover:opacity-100 transition-opacity`}>
            {priority.label}
          </span>
        </div>

        {/* ── Row 2: status + project ── */}
        <div className="flex items-center gap-2 flex-wrap">
          {canChangeStatus && !!issue.assignedTo && !(isDeveloper && issue.status === "closed") ? (
            <select
              value={issue.status}
              onChange={handleStatusChange}
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border capitalize cursor-pointer bg-transparent focus:outline-none focus:ring-1 focus:ring-current/40 transition-all ${status.color}`}
            >
              {!statusOptions.includes(issue.status) && (
                <option value={issue.status} disabled className="bg-zinc-900 capitalize">
                  {issue.status}
                </option>
              )}
              {statusOptions.map((s) => (
                <option key={s} value={s} className="bg-zinc-900 text-zinc-200 capitalize">{s}</option>
              ))}
            </select>
          ) : (
            <span className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border capitalize ${status.color}`}>
              <span className={`w-1 h-1 rounded-full ${status.dot}`} />
              {issue.status}
            </span>
          )}

          {issue.project?.name && (
            <span className="text-[9.5px] text-zinc-700 truncate ml-auto font-medium group-hover:text-zinc-600 transition-colors">
              {issue.project.name}
            </span>
          )}
        </div>

        {/* ── Row 3: assignee + date + delete ── */}
        <div className="flex items-center justify-between gap-2 pt-2 border-t border-zinc-800/50">

          {/* Assignee */}
          <div className="flex-1 min-w-0">
            {canAssign ? (
              <select
                value={issue.assignedTo?._id || ""}
                onChange={handleAssign}
                className="w-full bg-zinc-800/60 hover:bg-zinc-800 text-zinc-300 text-[10.5px] font-medium px-2 py-1 rounded-lg border border-zinc-700/40 hover:border-zinc-600/60 focus:outline-none focus:ring-1 focus:ring-indigo-500/40 cursor-pointer transition-all"
              >
                <option value="">Unassigned</option>
                {developers.map((dev) => (
                  <option key={dev._id} value={dev._id}>{dev.name}</option>
                ))}
              </select>
            ) : issue.assignedTo ? (
              <div className="flex items-center gap-1.5">
                <span className="w-4.5 h-4.5 min-w-[18px] min-h-[18px] rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-[8px] font-black text-white uppercase shadow-sm">
                  {issue.assignedTo?.name?.[0] || "?"}
                </span>
                <span className="text-[10.5px] text-zinc-400 font-medium truncate">{issue.assignedTo?.name}</span>
                {isDeveloper && (
                  <span className="text-[9px] text-indigo-400/80 font-bold shrink-0">you</span>
                )}
              </div>
            ) : (
              <span className="text-[10px] text-zinc-700 italic">Unassigned</span>
            )}
          </div>

          {/* Date + delete */}
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-[9.5px] text-zinc-700 font-medium tabular-nums group-hover:text-zinc-600 transition-colors">
              {new Date(issue.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
            </span>

            {canDelete && (
              <button
                onClick={handleDelete}
                title="Delete issue"
                className="opacity-0 group-hover:opacity-100 text-zinc-700 hover:text-red-400 hover:bg-red-500/10 rounded-md p-0.5 transition-all"
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default IssueCard;