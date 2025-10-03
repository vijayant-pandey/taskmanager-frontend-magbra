// frontend/src/services/taskService.js
import axios from "axios";

const API_URL = "http://localhost:5000/api/tasks"; // adjust if needed

export const getTasks = async (page = 1, token) => {
  const res = await axios.get(`${API_URL}?page=${page}&limit=6`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

export const getTaskById = async (id, token) => {
  const res = await axios.get(`${API_URL}/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const updateTask = async (id, payload, token) => {
  const res = await axios.put(`${API_URL}/${id}`, payload, {
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
  });
  return res.data;
};

export const updateTaskStatus = async (id, status, token) => {
  const res = await axios.patch(`${API_URL}/${id}/status`, { status }, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

export const deleteTask = async (id, token) => {
  const res = await axios.delete(`${API_URL}/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

export const changePriority = async (id, token) => {
  const res = await axios.patch(`${API_URL}/${id}/priority`, {}, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};
