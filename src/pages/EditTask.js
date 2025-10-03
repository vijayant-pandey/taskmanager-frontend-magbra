// frontend/src/pages/EditTask.js
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api";
import { getTaskById, updateTask } from "../services/taskService";
import "bootstrap/dist/css/bootstrap.min.css";

export default function EditTask() {
  const { id } = useParams(); // task id
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role") || "user";

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [status, setStatus] = useState("pending");
  const [priority, setPriority] = useState("medium");
  const [assignedTo, setAssignedTo] = useState(""); // userId or ""
  const [users, setUsers] = useState([]); // for admin assign dropdown

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        // fetch task
        const task = await getTaskById(id, token);
        if (!mounted) return;

        setTitle(task.title || "");
        setDescription(task.description || "");
        if (task.dueDate) {
          const d = new Date(task.dueDate);
          const yyyy = d.getFullYear();
          const mm = String(d.getMonth() + 1).padStart(2, "0");
          const dd = String(d.getDate()).padStart(2, "0");
          setDueDate(`${yyyy}-${mm}-${dd}`);
        } else {
          setDueDate("");
        }
        setStatus(task.status || "pending");
        setPriority(task.priority || "medium");
        setAssignedTo(task.assignedTo?._id || task.assignedTo || ""); // handle populated object or plain id

        // If admin, fetch user list
        if (role === "admin") {
          try {
            const res = await api.get("/users", { headers: { Authorization: `Bearer ${token}` } });
            if (mounted) setUsers(res.data || []);
          } catch (err) {
            // non-critical: admin route might fail if token expired
            console.warn("Could not fetch users:", err);
            if (mounted) setUsers([]);
          }
        }
      } catch (err) {
        console.error("Error loading task:", err);
        setError(err.response?.data?.message || "Could not load task");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => (mounted = false);
  }, [id, navigate, role, token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!title || !dueDate) {
      setError("Title and Due date are required.");
      return;
    }

    const payload = {
      title,
      description,
      dueDate,
      status,
      priority,
    };

    // include assignedTo only if admin selected a value (empty => kept by backend)
    if (role === "admin" && assignedTo) payload.assignedTo = assignedTo;

    setSaving(true);
    try {
      await updateTask(id, payload, token);
      // success
      navigate("/dashboard");
    } catch (err) {
      console.error("Update failed:", err);
      setError(err.response?.data?.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="container mt-4"><div className="alert alert-info">Loading task...</div></div>;
  }

  return (
    <div className="container my-4">
      <h2>Edit Task</h2>

      {error && <div className="alert alert-danger">{error}</div>}

      <form onSubmit={handleSubmit} className="card card-body shadow-sm">
        <div className="mb-3">
          <label className="form-label">Title*</label>
          <input className="form-control" value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>

        <div className="mb-3">
          <label className="form-label">Description</label>
          <textarea className="form-control" rows="4" value={description} onChange={(e) => setDescription(e.target.value)}></textarea>
        </div>

        <div className="row">
          <div className="col-md-4 mb-3">
            <label className="form-label">Due Date*</label>
            <input type="date" className="form-control" value={dueDate} onChange={(e) => setDueDate(e.target.value)} required />
          </div>

          <div className="col-md-4 mb-3">
            <label className="form-label">Status</label>
            <select className="form-select" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div className="col-md-4 mb-3">
            <label className="form-label">Priority</label>
            <select className="form-select" value={priority} onChange={(e) => setPriority(e.target.value)}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
        </div>

        <div className="mb-3">
          <label className="form-label">Assign To</label>
          {role === "admin" ? (
            <>
              <select className="form-select" value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)}>
                <option value="">(leave empty = assign to creator)</option>
                {users.map(u => <option key={u._id} value={u._id}>{u.name} ({u.email})</option>)}
              </select>
              <div className="form-text">Admins can assign tasks to any user.</div>
            </>
          ) : (
            <input className="form-control" value={assignedTo ? assignedTo : "Assigned to you"} disabled />
          )}
        </div>

        <div className="d-flex gap-2">
          <button className="btn btn-primary" type="submit" disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => navigate("/dashboard")}>Cancel</button>
        </div>
      </form>
    </div>
  );
}
