import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import axios from "../axiosConfig";
import socket from "../socket";
import "../index.css";

function ManagerDashboard() {

  const [tasks, setTasks] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [activeUsers, setActiveUsers] = useState([]);

  const [task, setTask] = useState({
    title: "",
    description: "",
    assignedTo: "",
    deadline: "",
    priority: "Medium",
  });

  // ===============================
  // Fetch Tasks
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
  // Fetch Employees
  // ===============================
  const fetchEmployees = async () => {
    try {
      const res = await axios.get("/users/employees");
      setEmployees(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // ===============================
  // SOCKET + DATA LOAD
  // ===============================
  useEffect(() => {

    fetchTasks();
    fetchEmployees();

    const user = JSON.parse(localStorage.getItem("user"));

    if(user){
      socket.emit("userOnline", {
        id: user.id,
        name: user.name,
        role: user.role
      });
    }

    socket.on("activeUsers", (users)=>{
      console.log("Active users:", users);
      setActiveUsers(users);
    });

    socket.on("taskCreated", fetchTasks);
    socket.on("taskUpdated", fetchTasks);
    socket.on("taskDeleted", fetchTasks);

    return () => {
      socket.off("activeUsers");
      socket.off("taskCreated");
      socket.off("taskUpdated");
      socket.off("taskDeleted");
    };

  }, []);

  // ===============================
  // Handle Input Change
  // ===============================
  const handleChange = (e) => {
    setTask({ ...task, [e.target.name]: e.target.value });
  };

  // ===============================
  // Create Task
  // ===============================
  const handleCreateTask = async () => {

    if (!task.title || !task.assignedTo) {
      alert("Title and Employee are required");
      return;
    }

    try {

      await axios.post("/tasks/create", task);

      setTask({
        title: "",
        description: "",
        assignedTo: "",
        deadline: "",
        priority: "Medium",
      });

    } catch (err) {
      console.error(err);
      alert("Error creating task");
    }

  };

  // ===============================
  // Delete Task
  // ===============================
  const handleDelete = async (taskId) => {

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this task?"
    );

    if (!confirmDelete) return;

    try {

      await axios.delete(`/tasks/delete/${taskId}`);

      setTasks((prev) =>
        prev.filter((task) => task._id !== taskId)
      );

    } catch (err) {

      console.error(err);
      alert("Error deleting task");

    }

  };

  const getTasksByStatus = (status) =>
    tasks
      .filter((task) => task.status === status)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const overdueCount = tasks.filter(
    (t) =>
      t.deadline &&
      new Date(t.deadline) < new Date() &&
      t.status !== "Completed"
  ).length;

  return (
    <>
      <Navbar role="manager" />

      <div className="kanban-container">

        <h1>Manager Control Panel</h1>

        {/* ===== Stats ===== */}

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


        {/* ===== Active Users ===== */}

        <div className="section active-users-section">

          <h2>Active Employees</h2>

          {activeUsers.filter(user => user.role === "employee").length === 0 ? (

            <p>No employees online</p>

          ) : (

            <div className="active-users-list">

              {activeUsers
                .filter(user => user.role === "employee")
                .map(user => (

                <div key={user.id} className="active-user">

                  <span className="online-dot"></span>

                  {user.name}

                </div>

              ))}

            </div>

          )}

        </div>


        {/* ===== Create Task Section ===== */}

        <div className="section" style={{ marginTop: "30px" }}>

          <h2>Create New Task</h2>

          <input
            name="title"
            placeholder="Task Title"
            value={task.title}
            onChange={handleChange}
          />

          <input
            name="description"
            placeholder="Description"
            value={task.description}
            onChange={handleChange}
          />

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

          <button onClick={handleCreateTask}>
            Create Task
          </button>

        </div>


        {/* ===== Kanban Board ===== */}

        <div className="kanban-board" style={{ marginTop: "40px" }}>

          {["To Do", "In Progress", "Completed"].map((status) => (

            <div className="kanban-column" key={status}>

              <h3>{status}</h3>

              {getTasksByStatus(status).map((task) => (

                <div key={task._id} className="kanban-card">

                  <div className="card-header">

                    <h4>{task.title}</h4>

                    <button
                      className="delete-icon-btn"
                      onClick={() => handleDelete(task._id)}
                    >
                      ✕
                    </button>

                  </div>

                  <p>👤 {task.assignedTo?.name}</p>

                  <small className="deadline-text">
                    {task.deadline
                      ? new Date(task.deadline).toLocaleDateString()
                      : "No Deadline"}
                  </small>

                </div>

              ))}

            </div>

          ))}

        </div>

      </div>
    </>
  );
}

export default ManagerDashboard;