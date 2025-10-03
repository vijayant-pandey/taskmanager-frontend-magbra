// frontend/src/pages/TaskDetails.js
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api";

export default function TaskDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch single task
  useEffect(() => {
    const fetchTask = async () => {
      try {
        const res = await api.get(`/tasks/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTask(res.data);
      } catch (err) {
        console.error("Error fetching task:", err);
        setError("Unable to load task.");
      } finally {
        setLoading(false);
      }
    };
    fetchTask();
  }, [id, token]);

  // Delete task
  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    try {
      await api.delete(`/tasks/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      navigate("/dashboard");
    } catch (err) {
      console.error("Error deleting task:", err);
      alert("Failed to delete task.");
    }
  };

  // Toggle status
  const handleToggleStatus = async () => {
    const newStatus = task.status === "pending" ? "completed" : "pending";
    try {
      await api.put(
        `/tasks/${id}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTask({ ...task, status: newStatus });
    } catch (err) {
      console.error("Error toggling status:", err);
      alert("Failed to update status.");
    }
  };

  // Change priority
  const handleChangePriority = async () => {
    const priorities = ["low", "medium", "high"];
    const currentIndex = priorities.indexOf(task.priority);
    const newPriority = priorities[(currentIndex + 1) % priorities.length];
    try {
      await api.put(
        `/tasks/${id}`,
        { priority: newPriority },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTask({ ...task, priority: newPriority });
    } catch (err) {
      console.error("Error changing priority:", err);
      alert("Failed to change priority.");
    }
  };

  const getPriorityClass = (priority) => {
    switch (priority) {
      case "low":
        return "bg-info text-white";
      case "medium":
        return "bg-warning text-dark";
      case "high":
        return "bg-danger text-white";
      default:
        return "bg-secondary text-white";
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div className="container my-4">
      <div className="card shadow-sm">
        <div className={`card-header ${getPriorityClass(task.priority)}`}>
          <h4>{task.title}</h4>
        </div>
        <div className="card-body">
          <p className="card-text">{task.description || "No description"}</p>
          <p><strong>Status:</strong> {task.status}</p>
          <p><strong>Priority:</strong> {task.priority}</p>
          <p><strong>Due Date:</strong> {new Date(task.dueDate).toDateString()}</p>
          <p><strong>Created By:</strong> {task.createdBy?.name || "Unknown"}</p>
          <p><strong>Assigned To:</strong> {task.assignedTo?.name || "Unassigned"}</p>
        </div>
        <div className="card-footer d-flex gap-2 flex-wrap">
          <button
            className="btn btn-primary btn-sm"
            onClick={() => navigate(`/edit-task/${task._id}`)}
          >
            Edit
          </button>
          <button className="btn btn-danger btn-sm" onClick={handleDelete}>
            Delete
          </button>
          <button
            className={`btn btn-sm ${
              task.status === "completed" ? "btn-warning" : "btn-success"
            }`}
            onClick={handleToggleStatus}
          >
            {task.status === "completed" ? "Mark Pending" : "Mark Completed"}
          </button>
          <button
            className={`btn btn-sm ${getPriorityClass(task.priority)}`}
            onClick={handleChangePriority}
          >
            Change Priority
          </button>
          <button className="btn btn-secondary btn-sm" onClick={() => navigate("/dashboard")}>
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
