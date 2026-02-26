import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, Link } from "react-router-dom";
import { fetchProjectThunk, addMemberThunk } from "../features/projects/projectThunk";
import { fetchIssuesThunk } from "../features/issues/issueThunk";
import Button from "../components/ui/Button";
import Modal from "../components/ui/Modal";
import Input from "../components/ui/Input";
import Loader from "../components/ui/Loader";
import IssueCard from "../features/issues/components/issueCard";

const ProjectDetails = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { currentProject, loading } = useSelector((s) => s.projects);
  const { issues } = useSelector((s) => s.issues);
  const { user } = useSelector((s) => s.auth);

  const [showAddMember, setShowAddMember] = useState(false);
  const [memberEmail, setMemberEmail] = useState("");
  const [adding, setAdding] = useState(false);

  const canManage = ["admin", "manager"].includes(user?.role);

  useEffect(() => {
    dispatch(fetchProjectThunk(id));
    dispatch(fetchIssuesThunk({ project: id }));
  }, [id, dispatch]);

  const projectIssues = issues.filter(
    (i) => i.project?._id === id || i.project === id
  );

  const handleAddMember = async (e) => {
    e.preventDefault();
    setAdding(true);
    const res = await dispatch(addMemberThunk({ id, data: { email: memberEmail } }));
    setAdding(false);
    if (!res.error) {
      setShowAddMember(false);
      setMemberEmail("");
    }
  };

  if (loading || !currentProject) return <Loader />;

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-zinc-500">
        <Link to="/projects" className="hover:text-zinc-300 transition-colors">Projects</Link>
        <span>/</span>
        <span className="text-zinc-300">{currentProject.name}</span>
      </div>

      {/* Project Header */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-11 h-11 rounded-xl bg-indigo-600/20 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-zinc-100">{currentProject.name}</h2>
              <p className="text-sm text-zinc-500 mt-1">{currentProject.description || "No description."}</p>
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            <Link to={`/analytics/${id}`}>
              <Button variant="ghost" size="sm">Analytics</Button>
            </Link>
            {canManage && (
              <Button size="sm" onClick={() => setShowAddMember(true)}>
                Add Member
              </Button>
            )}
          </div>
        </div>

        {/* Members */}
        {currentProject.members?.length > 0 && (
          <div className="mt-5 pt-5 border-t border-zinc-800">
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">Members</p>
            <div className="flex flex-wrap gap-2">
              {currentProject.members.map((m) => (
                <div key={m._id || m} className="flex items-center gap-2 bg-zinc-800 rounded-full px-3 py-1">
                  <div className="w-5 h-5 rounded-full bg-indigo-600 flex items-center justify-center text-[10px] font-bold text-white uppercase">
                    {m.name?.[0] || "?"}
                  </div>
                  <span className="text-xs text-zinc-300">{m.name || m.email || m}</span>
                  <span className="text-[10px] text-zinc-500 capitalize">{m.role}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Issues */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-zinc-200">
            Issues <span className="text-zinc-500 font-normal">({projectIssues.length})</span>
          </h3>
          <Link to="/issues" className="text-xs text-indigo-400 hover:text-indigo-300">View all issues →</Link>
        </div>

        {projectIssues.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {projectIssues.map((issue) => (
              <IssueCard key={issue._id} issue={issue} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 bg-zinc-900 border border-dashed border-zinc-800 rounded-xl">
            <p className="text-sm text-zinc-500">No issues for this project yet.</p>
          </div>
        )}
      </div>

      <Modal isOpen={showAddMember} onClose={() => setShowAddMember(false)} title="Add Member">
        <form onSubmit={handleAddMember} className="space-y-4">
          <Input
            id="email"
            label="Member Email"
            type="email"
            placeholder="user@example.com"
            value={memberEmail}
            onChange={(e) => setMemberEmail(e.target.value)}
            required
          />
          <Button type="submit" loading={adding} className="w-full">
            Add Member
          </Button>
        </form>
      </Modal>
    </div>
  );
};

export default ProjectDetails;
