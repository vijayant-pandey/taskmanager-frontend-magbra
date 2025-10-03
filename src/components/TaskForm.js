// frontend/src/components/TaskForm.js
import React, { useState, useEffect } from "react";
import api from "../api";

export default function TaskForm({ token, onTaskCreated }) {
  const role = localStorage.getItem("role") || "user";

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("low");
  const [dueDate, setDueDate] = useState("");
  const [status, setstatus] = useState("");
  const [assignedTo, setAssignedTo] = useState(""); // '' means "assign to creator"
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [error, setError] = useState("");

  // If the logged-in user is admin, fetch user list so admin can assign tasks
  useEffect(() => {
    let mounted = true;
    async function loadUsers() {
      if (role !== "admin") return;
      setLoadingUsers(true);
      try {
        const res = await api.get("/users", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!mounted) return;
        setUsers(res.data || []);
      } catch (err) {
        console.error("Error fetching users:", err);
        // If fetch fails (e.g., token not admin), keep users empty
        setUsers([]);
      } finally {
        if (mounted) setLoadingUsers(false);
      }
    }
    loadUsers();
    return () => (mounted = false);
  }, [role, token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!title || !dueDate) {
      setError("Title and Due date are required.");
      return;
    }

    const payload = { title, description, priority, status, dueDate };
    // Only include assignedTo if admin chose someone
    if (role === "admin" && assignedTo) {
      payload.assignedTo = assignedTo;
    }

    try {
      await api.post("/tasks", payload, {
        headers: { Authorization: `Bearer ${token}` },
        
      });

      // reset form
      setTitle("");
      setDescription("");
      setPriority("low");
      setstatus("")
      setDueDate("");
      setAssignedTo("");
      // notify parent to refresh
      if (typeof onTaskCreated === "function") onTaskCreated();
    } catch (err) {
      console.error("Error creating task:", err);
      setError(err.response?.data?.message || "Error creating task");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-4 card card-body shadow-sm">
      <h5 className="mb-3">Create New Task</h5>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="mb-2">
        <label className="form-label">Title*</label>
        <input
          type="text"
          className="form-control"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>

      <div className="mb-2">
        <label className="form-label">Description</label>
        <textarea
          className="form-control"
          rows="2"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        ></textarea>
      </div>

      <div className="row">
        <div className="col-md-4 mb-2">
          <label className="form-label">Priority</label>
          <select
            className="form-select"
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        <div className="col-md-4 mb-2">
          <label className="form-label">Status</label>
          <select
            className="form-select"
            value={status}
            onChange={(e) => setstatus(e.target.value)}
          >
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
          </select>
        </div>

        <div className="col-md-4 mb-2">
          <label className="form-label">Due Date*</label>
          <input
            type="date"
            className="form-control"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            required
          />
        </div>

        <div className="col-md-4 mb-2">
          {/* Assigned To: shown only for admins */}
          <label className="form-label">Assign To</label>
          {role === "admin" ? (
            <>
              {loadingUsers ? (
                <select className="form-select" disabled>
                  <option>Loading users...</option>
                </select>
              ) : (
                <select
                  className="form-select"
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                >
                  <option value="">Assign to creator (default)</option>
                  {users.map((u) => (
                    <option value={u._id} key={u._id}>
                      {u.name} ({u.email})
                    </option>
                  ))}
                </select>
              )}
              <div className="form-text">
                Leave empty to assign to the task creator.
              </div>
            </>
          ) : (
            <input
              type="text"
              className="form-control"
              value="Assigned to: You"
              disabled
            />
          )}
        </div>
      </div>

      <div className="mt-3">
        <button type="submit" className="btn btn-success">
          Add Task
        </button>
      </div>
    </form>
  );
}
