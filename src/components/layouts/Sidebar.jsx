import { NavLink, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../features/auth/authSlice";
import { useSelector as useProjects } from "react-redux";

const Sidebar = () => {
  const dispatch   = useDispatch();
  const navigate   = useNavigate();
  const { user }   = useSelector((state) => state.auth);
  const { projects } = useSelector((state) => state.projects);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const isAdminOrManager = ["admin", "manager"].includes(user?.role);

  const roleColors = {
    admin:     "from-red-500 to-orange-500",
    manager:   "from-amber-500 to-yellow-400",
    developer: "from-indigo-500 to-violet-500",
    tester:    "from-emerald-500 to-teal-400",
  };
  const avatarGradient = roleColors[user?.role] || "from-zinc-600 to-zinc-700";

  const isAdmin = user?.role === "admin";

  const mainNav = [
    {
      label: "Dashboard",
      path: "/dashboard",
      end: true,
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      label: "Projects",
      path: "/projects",
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
    },
    // Issues hidden for admin — they manage via projects/analytics
    ...(!isAdmin ? [{
      label: "Issues",
      path: "/issues",
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
        </svg>
      ),
    }] : []),
  ];

  return (
    <aside className="w-60 shrink-0 h-screen flex flex-col bg-zinc-950 border-r border-zinc-800/50">

      {/* ── Logo ── */}
      <div className="px-5 py-5 border-b border-zinc-800/50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <span className="text-sm font-black text-zinc-100 tracking-wide">IssueFlow</span>
            <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-zinc-600 mt-0.5">Workspace</p>
          </div>
        </div>
      </div>

      {/* ── Nav ── */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <p className="px-2 pb-2 text-[9px] font-black text-zinc-700 uppercase tracking-[0.2em]">Main</p>

        {mainNav.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-semibold transition-all duration-150 ${
                isActive
                  ? "bg-indigo-600/15 text-indigo-300 border border-indigo-500/20"
                  : "text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800/50 border border-transparent"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span className={isActive ? "text-indigo-400" : "text-zinc-600"}>{item.icon}</span>
                {item.label}
              </>
            )}
          </NavLink>
        ))}

        {/* ── Analytics section (admin + manager only) ── */}
        {isAdminOrManager && projects.length > 0 && (
          <div className="pt-4">
            <p className="px-2 pb-2 text-[9px] font-black text-zinc-700 uppercase tracking-[0.2em]">Analytics</p>
            <div className="space-y-0.5">
              {projects.slice(0, 5).map((project) => (
                <NavLink
                  key={project._id}
                  to={`/analytics/${project._id}`}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-xl text-[12px] font-medium transition-all duration-150 group ${
                      isActive
                        ? "bg-violet-600/15 text-violet-300 border border-violet-500/20"
                        : "text-zinc-600 hover:text-zinc-300 hover:bg-zinc-800/50 border border-transparent"
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <span className={`shrink-0 ${isActive ? "text-violet-400" : "text-zinc-700 group-hover:text-zinc-500"}`}>
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                      </span>
                      <span className="truncate">{project.name}</span>
                    </>
                  )}
                </NavLink>
              ))}
              {projects.length > 5 && (
                <div className="px-3 py-1.5">
                  <span className="text-[10px] text-zinc-700 font-medium">+{projects.length - 5} more in Projects</span>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* ── User footer ── */}
      <div className="px-3 py-3 border-t border-zinc-800/50">
        <div className="flex items-center gap-3 px-2 py-2.5 mb-1 rounded-xl hover:bg-zinc-800/30 transition-colors">
          <div className={`w-7 h-7 rounded-full bg-gradient-to-br ${avatarGradient} flex items-center justify-center text-[11px] font-black text-white uppercase shadow-sm shrink-0`}>
            {user?.name?.[0] || "U"}
          </div>
          <div className="overflow-hidden flex-1 min-w-0">
            <p className="text-[12px] font-bold text-zinc-200 truncate">{user?.name || "User"}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className={`w-1.5 h-1.5 rounded-full bg-gradient-to-br ${avatarGradient}`} />
              <p className="text-[9px] font-black uppercase tracking-widest text-zinc-600 capitalize">{user?.role}</p>
            </div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[12px] font-semibold text-zinc-600 hover:text-red-400 hover:bg-red-500/8 transition-all group"
        >
          <svg className="w-3.5 h-3.5 group-hover:text-red-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Sign out
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;