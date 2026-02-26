import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";

const pageTitles = {
  "/dashboard": "Dashboard",
  "/projects": "Projects",
  "/issues": "Issues",
};

const Navbar = () => {
  const { user } = useSelector((state) => state.auth);
  const location = useLocation();

  const title =
    pageTitles[location.pathname] ||
    (location.pathname.startsWith("/projects/") ? "Project Details" : "") ||
    (location.pathname.startsWith("/analytics/") ? "Analytics" : "");

  return (
    <header className="h-14 shrink-0 flex items-center justify-between px-6 bg-zinc-950/80 backdrop-blur-sm border-b border-zinc-800/60 sticky top-0 z-10">
      <h1 className="text-sm font-semibold text-zinc-200">{title}</h1>
      <div className="flex items-center gap-3">
        <span className="text-xs text-zinc-500 hidden sm:block capitalize">
          {user?.role}
        </span>
        <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-bold text-white uppercase">
          {user?.name?.[0] || "U"}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
