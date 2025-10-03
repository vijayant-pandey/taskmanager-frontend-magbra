import React from "react";

const TaskCard = ({ task, userRole, onDelete, onToggleStatus, onChangePriority }) => {
  let priorityClass = "";
  if (task.priority === "low") priorityClass = "bg-info";
  if (task.priority === "medium") priorityClass = "bg-warning";
  if (task.priority === "high") priorityClass = "bg-danger text-white";

  return (
    <div className={`card ${priorityClass} shadow-sm m-2`}>
      <div className="card-body">
        <h5 className="card-title">{task.title}</h5>
        <p><strong>Desc:</strong> {task.description}</p>
        <p><strong>Due:</strong> {new Date(task.dueDate).toDateString()}</p>
        <p><strong>Status:</strong> {task.status}</p>
        <p><strong>Priority:</strong> {task.priority}</p>
        <div className="d-flex gap-2">
          <button className="btn btn-sm btn-outline-info">View</button>
          <button className="btn btn-sm btn-outline-primary">Edit</button>
          <button className="btn btn-sm btn-outline-danger" onClick={() => onDelete(task._id)}>Delete</button>
          <button className="btn btn-sm" onClick={() => onToggleStatus(task)}>
            {task.status === "completed" ? "Mark Pending" : "Mark Completed"}
          </button>
          <button className="btn btn-sm btn-outline-secondary" onClick={() => onChangePriority(task)}>
            Change Priority
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
