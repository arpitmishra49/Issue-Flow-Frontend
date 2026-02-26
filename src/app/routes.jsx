import { createBrowserRouter, RouterProvider } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import DashboardLayout from "../components/layouts/DashBoardLayout";

import Login from "../features/auth/pages/Login";
import Register from "../features/auth/pages/Register";

import Dashboard from "../features/dashboard/dashboard";
import AdminDashboard from "../features/dashboard/AdminDashboard";
import DeveloperDashboard from "../features/dashboard/DeveloperDashboard";
import TesterDashboard from "../features/dashboard/TesterDashboard";

import IssueBoard from "../features/issues/issueBoard";

import ProjectList from "../features/projects/pages/ProjectList";
import ProjectDetails from "../features/projects/pages/ProjectDetails";

import AnalyticsDashboard from "../features/analytics/pages/AnalyticsDashborad";

const router = createBrowserRouter([
  { path: "/login", element: <Login /> },
  { path: "/register", element: <Register /> },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          { path: "/dashboard", element: <Dashboard /> },
          {
            path: "/dashboard/admin",
            element: (
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminDashboard />
              </ProtectedRoute>
            ),
          },
          {
            path: "/dashboard/developer",
            element: (
              <ProtectedRoute allowedRoles={["developer"]}>
                <DeveloperDashboard />
              </ProtectedRoute>
            ),
          },
          {
            path: "/dashboard/tester",
            element: (
              <ProtectedRoute allowedRoles={["tester"]}>
                <TesterDashboard />
              </ProtectedRoute>
            ),
          },
          { path: "/issues", element: <IssueBoard /> },
          { path: "/projects", element: <ProjectList /> },
          { path: "/projects/:id", element: <ProjectDetails /> },
          { path: "/analytics/:projectId", element: <AnalyticsDashboard /> },
        ],
      },
    ],
  },
  { path: "*", element: <Login /> },
]);

const AppRoutes = () => <RouterProvider router={router} />;
export default AppRoutes;
