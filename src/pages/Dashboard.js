import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import "bootstrap/dist/css/bootstrap.min.css";
import TaskForm from "../components/TaskForm"; // 👈 import here

export default function Dashboard() {
  const [tasksData, setTasksData] = useState({
    tasks: [],
    total: 0,
    page: 1,
    pages: 1,
  });
  const [page, setPage] = useState(1);
  const limit = 9;
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  // Fetch tasks
  const fetchTasks = async (pageNumber) => {
    try {
      const res = await api.get(`/tasks?page=${pageNumber}&limit=${limit}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTasksData(res.data);
    } catch (err) {
      console.error("Error fetching tasks:", err);
    }
  };

  useEffect(() => {
    fetchTasks(page);
  }, [page]);

  // Delete task
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    try {
      await api.delete(`/tasks/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchTasks(page);
    } catch (err) {
      console.error("Error deleting task:", err);
    }
  };

  // Toggle status
  const handleToggleStatus = async (task) => {
    const newStatus = task.status === "pending" ? "completed" : "pending";
    try {
      await api.put(
        `/tasks/${task._id}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchTasks(page);
    } catch (err) {
      console.error("Error toggling status:", err);
    }
  };

  // Change priority
  const handleChangePriority = async (task) => {
    const priorities = ["low", "medium", "high"];
    const currentIndex = priorities.indexOf(task.priority);
    const newPriority = priorities[(currentIndex + 1) % priorities.length];
    try {
      await api.put(
        `/tasks/${task._id}`,
        { priority: newPriority },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchTasks(page);
    } catch (err) {
      console.error("Error changing priority:", err);
    }
  };

  // Map priority to Bootstrap colors
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

  return (
    <div className="container my-4">
      <h2 className="mb-4">Task Dashboard</h2>

              <button
          className="btn btn-danger"
          onClick={() => {
            localStorage.removeItem("token");
            navigate("/login");
          }}
        >
          Logout
        </button>

      {/* ✅ Add Task Form here */}
    <TaskForm token={token} onTaskCreated={() => fetchTasks(page)} />

      <div className="row">
        {tasksData.tasks.length === 0 ? (
          <p>No tasks found.</p>
        ) : (
          tasksData.tasks.map((task) => (
            <div className="col-md-4 mb-3" key={task._id}>
              <div
                className={`card shadow-sm h-100 border-0`}
              >
                <div
                  className={`card-header ${getPriorityClass(task.priority)}`}
                >
                  {task.title}
                </div>

                <div className="card-body">
                  <p className="card-text">{task.description || "No description"}</p>
                  
                  <p className="card-text">
                    <strong>Status:</strong>{" "}
                    <span
                      className={`badge ${
                        task.status === "completed"
                          ? "text-success"
                          : "text-secondary"
                      }`}
                    >
                      {task.status}
                    </span>
                  </p>

                  <p className="card-text">
                    <strong>Priority:</strong>{" "}
                    <span className={`badge ${getPriorityClass(task.priority)}`}>
                      {task.priority}
                    </span>
                  </p>

                  
                  <p className="card-text">
                    <strong>Created By:</strong>{" "}
                    {task.createdBy?.name || "Unknown"}
                  </p>

                  <p className="card-text">
                    <strong>Assigned To:</strong>{" "}
                    {task.assignedTo?.name || "Unassigned"}
                  </p>

                  <p className="card-text">
                    <strong>Due Date:</strong>{" "}
                    {task.dueDate
                        ? new Date(task.dueDate).toLocaleDateString()
                        : "No due date"}
                </p>  

                </div>

                <div className="card-footer d-flex gap-2 flex-wrap">
                  <button
                    className="btn btn-sm btn-info"
                    onClick={() => navigate(`/tasks/${task._id}`)}
                    >
                    View
                  </button>

                  
                  <button
                    className="btn btn-sm btn-primary"
                    onClick={() => navigate(`/edit-task/${task._id}`)}
                  >
                    Edit
                  </button>

                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => handleDelete(task._id)}
                  >
                    Delete
                  </button>

                  <button
                    className={`btn btn-sm ${
                      task.status === "completed" ? "btn-warning" : "btn-success"
                    }`}
                    onClick={() => handleToggleStatus(task)}
                  >
                    {task.status === "completed" ? "Mark Pending" : "Mark Completed"}
                  </button>

                  <button
                    className={`btn btn-sm ${getPriorityClass(task.priority)}`}
                    onClick={() => handleChangePriority(task)}
                  >
                    Change Priority
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      <nav className="mt-4">
        <ul className="pagination justify-content-center">
          {Array.from({ length: tasksData.pages }, (_, i) => i + 1).map((num) => (
            <li
              key={num}
              className={`page-item ${tasksData.page === num ? "active" : ""}`}
            >
              <button className="page-link" onClick={() => setPage(num)}>
                {num}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
