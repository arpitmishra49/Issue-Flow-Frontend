import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchProjectsThunk, createProjectThunk, deleteProjectThunk } from "../projectThunk";
import { Link } from "react-router-dom";
import Button from "../../../components/ui/Button";
import Modal from "../../../components/ui/Modal";
import Input from "../../../components/ui/Input";
import Loader from "../../../components/ui/Loader";

const ProjectList = () => {
  const dispatch = useDispatch();
  const { projects, loading } = useSelector((s) => s.projects);
  const { user } = useSelector((s) => s.auth);

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: "", description: "" });
  const [creating, setCreating] = useState(false);

  const canCreate = ["admin", "manager"].includes(user?.role);

  // ✅ FIXED DELETE LOGIC
  const canDelete = (project) =>
    user?.role === "manager" ||
    project.owner?._id === user?._id;

  useEffect(() => {
    dispatch(fetchProjectsThunk());
  }, [dispatch]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    const res = await dispatch(createProjectThunk(form));
    setCreating(false);
    if (!res.error) {
      setShowModal(false);
      setForm({ name: "", description: "" });
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete project "${name}"? This cannot be undone.`)) return;
    dispatch(deleteProjectThunk(id));
  };

  if (loading) return <Loader />;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-zinc-100">Projects</h2>
          <p className="text-sm text-zinc-500 mt-0.5">{projects.length} projects</p>
        </div>
        {canCreate && (
          <Button onClick={() => setShowModal(true)}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Project
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {projects.map((project) => (
          <div
            key={project._id}
            className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 hover:border-zinc-700 transition-all group"
          >
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="w-9 h-9 rounded-lg bg-indigo-600/20 flex items-center justify-center shrink-0">
                <svg className="w-4 h-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>

              {/* ✅ FIXED CONDITION */}
              {canDelete(project) && (
                <button
                  onClick={() => handleDelete(project._id, project.name)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-zinc-500 hover:text-red-400 p-1 rounded"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              )}
            </div>

            <h3 className="text-sm font-semibold text-zinc-100 mb-1">{project.name}</h3>
            <p className="text-xs text-zinc-500 line-clamp-2 leading-relaxed mb-4">
              {project.description || "No description provided."}
            </p>

            <div className="flex items-center justify-between">
              <span className="text-xs text-zinc-500">
                {project.members?.length || 0} members
              </span>
              <div className="flex gap-2">
                <Link
                  to={`/analytics/${project._id}`}
                  className="text-xs text-zinc-400 hover:text-indigo-400 transition-colors"
                >
                  Analytics
                </Link>
                <Link
                  to={`/projects/${project._id}`}
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
                >
                  View →
                </Link>
              </div>
            </div>
          </div>
        ))}

        {projects.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
            <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center mb-3">
              <svg className="w-6 h-6 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <p className="text-sm font-medium text-zinc-400">No projects yet</p>
            <p className="text-xs text-zinc-600 mt-1">
              {canCreate
                ? "Create your first project to get started."
                : "You haven't been added to any projects yet."}
            </p>
          </div>
        )}
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Create Project">
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            id="name"
            name="name"
            label="Project Name"
            placeholder="e.g. E-commerce Platform"
            value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            required
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-zinc-300">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              rows={3}
              placeholder="What is this project about?"
              className="w-full px-3 py-2 rounded-lg text-sm bg-zinc-900 border border-zinc-700 text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>
          <Button type="submit" loading={creating} className="w-full">
            Create Project
          </Button>
        </form>
      </Modal>
    </div>
  );
};

export default ProjectList;