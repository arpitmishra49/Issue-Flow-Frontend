import { createBrowserRouter, RouterProvider } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";


import Login from "../pages/Login";
import Register from "../pages/Register";

import Dashboard from "../features/dashboard/dashboard";
import AdminDashboard from "../features/dashboard/AdminDashboard";
import DeveloperDashboard from "../features/dashboard/DeveloperDashboard";
import TesterDashboard from "../features/dashboard/TesterDashboard";

import IssueBoard from "../features/issues/issueBoard";

import ProjectList from "../pages/ProjectList";
import ProjectDetails from "../pages/ProjectDetails";


import DashboardLayout from "../components/layouts/DashboardLayout";
import AnalyticsDashboard from "../pages/AnalyticsDashboard";

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
