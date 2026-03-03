import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import axios from "../axiosConfig";
import "../index.css";

function ManagerDashboard() {
  const [task, setTask] = useState({
    title: "",
    description: "",
    assignedTo: "",
    deadline: "",
    priority: "Medium",
  });

  const [tasks, setTasks] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);

  // ===============================
  // Fetch Manager Tasks
  // ===============================
  const fetchTasks = async () => {
    try {
      const res = await axios.get("/tasks/manager-tasks");
      setTasks(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // ===============================
  // Fetch Employees for Dropdown
  // ===============================
  const fetchEmployees = async () => {
    try {
      const res = await axios.get("/users/employees");
      setEmployees(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTasks();
    fetchEmployees();
  }, []);

  // ===============================
  // Handle Form Change
  // ===============================
  const handleChange = (e) => {
    setTask({ ...task, [e.target.name]: e.target.value });
  };

  // ===============================
  // Create Task API Call
  // ===============================
  const handleCreateTask = async () => {
    try {
      setLoading(true);

      await axios.post("/tasks/create", task);

      alert("Task Created Successfully");

      setTask({
        title: "",
        description: "",
        assignedTo: "",
        deadline: "",
        priority: "Medium",
      });

      fetchTasks();

    } catch (err) {
      console.error(err.response?.data || err.message);
      alert("Error creating task");
    } finally {
      setLoading(false);
    }
  };

  // ===============================
  // Safe Overdue Count
  // ===============================
  const overdueCount = tasks.filter(
    (t) =>
      t.deadline &&
      new Date(t.deadline) < new Date() &&
      t.status !== "Completed"
  ).length;

  return (
    <>
      <Navbar role="Manager" />

      <div className="dashboard-container">
        <h1>Manager Control Panel</h1>

        {/* ===== Overview Section ===== */}
        <div className="stats-grid">
          <div className="card">📋 Total Tasks: {tasks.length}</div>
          <div className="card">
            ⏳ In Progress: {
              tasks.filter(t => t.status === "In Progress").length
            }
          </div>
          <div className="card">
            ⚠️ Overdue: {overdueCount}
          </div>
        </div>

        {/* ===== Create Task Section ===== */}
        <div className="section">
          <h2>Create New Task</h2>

          <input
            name="title"
            placeholder="Task Title"
            value={task.title}
            onChange={handleChange}
          />

          <input
            name="description"
            placeholder="Task Description"
            value={task.description}
            onChange={handleChange}
          />

          {/* Employee Dropdown */}
          <select
            name="assignedTo"
            value={task.assignedTo}
            onChange={handleChange}
          >
            <option value="">Select Employee</option>
            {employees.map(emp => (
              <option key={emp._id} value={emp._id}>
                {emp.name}
              </option>
            ))}
          </select>

          <input
            type="date"
            name="deadline"
            value={task.deadline}
            onChange={handleChange}
          />

          <select
            name="priority"
            value={task.priority}
            onChange={handleChange}
          >
            <option>High</option>
            <option>Medium</option>
            <option>Low</option>
          </select>

          <button onClick={handleCreateTask} disabled={loading}>
            {loading ? "Creating..." : "Create Task"}
          </button>
        </div>

        {/* ===== Task Monitoring Section ===== */}
        <div className="section" style={{ marginTop: "30px" }}>
          <h2>Team Tasks</h2>

          {tasks.length === 0 ? (
            <p>No tasks yet.</p>
          ) : (
            tasks.map((t) => (
              <div key={t._id} className="task-row">
                <span>{t.title}</span>
                <span>{t.assignedTo?.name || "Employee"}</span>
                <span className={`badge ${getStatusClass(t.status)}`}>
                  {t.status}
                </span>
                <span>
                  {t.deadline
                    ? new Date(t.deadline).toLocaleDateString()
                    : "No Deadline"}
                </span>
                <span>{t.priority}</span>
              </div>
            ))
          )}
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

export default ManagerDashboard;