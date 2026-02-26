import { useSelector } from "react-redux";
import AdminDashboard from "./AdminDashboard";
import DeveloperDashboard from "./DeveloperDashboard";
import TesterDashboard from "./TesterDashboard";
import ManagerDashboard from "./ManagerDashboard"; // ✅ added

const Dashboard = () => {
  const { user } = useSelector((state) => state.auth);

  if (user?.role === "admin") return <AdminDashboard />;
  if (user?.role === "manager") return <ManagerDashboard />; // ✅ added
  if (user?.role === "developer") return <DeveloperDashboard />;
  if (user?.role === "tester") return <TesterDashboard />;

  return (
    <div className="flex items-center justify-center h-64">
      <p className="text-zinc-500">
        Unknown role. Please contact your administrator.
      </p>
    </div>
  );
};

export default Dashboard;