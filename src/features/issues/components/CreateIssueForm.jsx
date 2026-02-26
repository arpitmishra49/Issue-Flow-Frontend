import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createIssueThunk } from "../issueThunk";
import Input from "../../../components/ui/Input";
import Button from "../../../components/ui/Button";

const CreateIssueForm = ({ projects = [], onSuccess }) => {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((s) => s.issues);

  const [form, setForm] = useState({
    title: "",
    description: "",
    severity: "medium", // ✅ CHANGED
    project: "",
  });

  const [localError, setLocalError] = useState(null);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setLocalError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.project) {
      setLocalError("Please select a project");
      return;
    }

    const result = await dispatch(createIssueThunk(form));

    if (!result.error) {
      onSuccess?.();
      setForm({
        title: "",
        description: "",
        severity: "medium", // ✅ CHANGED
        project: "",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {(error || localError) && (
        <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
          {localError || error}
        </p>
      )}

      <Input
        id="title"
        name="title"
        label="Issue Title"
        placeholder="Describe the bug briefly..."
        value={form.title}
        onChange={handleChange}
        required
      />

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-zinc-300">Description</label>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          rows={3}
          placeholder="Steps to reproduce..."
          className="w-full px-3 py-2 rounded-lg text-sm bg-zinc-900 border border-zinc-700 text-zinc-100"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-zinc-300">Priority</label>
          <select
            name="severity"            // ✅ CHANGED
            value={form.severity}      // ✅ CHANGED
            onChange={handleChange}
            className="w-full px-3 py-2 rounded-lg text-sm bg-zinc-900 border border-zinc-700 text-zinc-100"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-zinc-300">Project</label>
          <select
            name="project"
            value={form.project}
            onChange={handleChange}
            className="w-full px-3 py-2 rounded-lg text-sm bg-zinc-900 border border-zinc-700 text-zinc-100"
          >
            <option value="">Select project</option>
            {projects.map((p) => (
              <option key={p._id} value={p._id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex gap-3 pt-1">
        <Button
          type="submit"
          loading={loading}
          disabled={!form.project}
          className="flex-1"
        >
          Submit Issue
        </Button>
      </div>
    </form>
  );
};

export default CreateIssueForm;