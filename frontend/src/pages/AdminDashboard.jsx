import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import axios from "../axiosConfig";
import "../index.css";

function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [tasks, setTasks] = useState([]);

  // ===============================
  // Fetch All Users
  // ===============================
  const fetchUsers = async () => {
    try {
      const res = await axios.get("/users/all");
      setUsers(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // ===============================
  // Fetch All Tasks
  // ===============================
  const fetchTasks = async () => {
    try {
      const res = await axios.get("/tasks/all");
      setTasks(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchTasks();
  }, []);

  const totalManagers = users.filter(u => u.role === "manager").length;
  const totalEmployees = users.filter(u => u.role === "employee").length;
  const completedTasks = tasks.filter(t => t.status === "Completed").length;
  const overdueTasks = tasks.filter(
    t =>
      t.deadline &&
      new Date(t.deadline) < new Date() &&
      t.status !== "Completed"
  ).length;

  return (
    <>
      <Navbar role="Admin" />

      <div className="dashboard-container">
        <h1>Admin Control Panel</h1>

        {/* ===== Organization Stats ===== */}
        <div className="stats-grid">
          <div className="card">👥 Total Users: {users.length}</div>
          <div className="card">🧑‍💼 Managers: {totalManagers}</div>
          <div className="card">👨‍💻 Employees: {totalEmployees}</div>
          <div className="card">📋 Total Tasks: {tasks.length}</div>
          <div className="card">✅ Completed: {completedTasks}</div>
          <div className="card">⚠️ Overdue: {overdueTasks}</div>
        </div>

        {/* ===== Users Section ===== */}
        <div className="section" style={{ marginTop: "30px" }}>
          <h2>All Users</h2>

          {users.map(user => (
            <div key={user._id} className="task-row">
              <span>{user.name}</span>
              <span>{user.email}</span>
              <span className="badge">{user.role}</span>
            </div>
          ))}
        </div>

        {/* ===== Tasks Section ===== */}
        <div className="section" style={{ marginTop: "30px" }}>
          <h2>All Tasks</h2>

          {tasks.map(task => (
            <div key={task._id} className="task-row">
              <span>{task.title}</span>
              <span>{task.assignedBy?.name}</span>
              <span>{task.assignedTo?.name}</span>
              <span className={`badge ${getStatusClass(task.status)}`}>
                {task.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

function getStatusClass(status) {
  if (status === "To Do") return "todo";
  if (status === "In Progress") return "inprogress";
  if (status === "Completed") return "completed";
  return "";
}

export default AdminDashboard;