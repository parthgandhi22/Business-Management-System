import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import axios from "../axiosConfig";
import "../index.css";

function EmployeeDashboard() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);

  // ===============================
  // Fetch My Tasks
  // ===============================
  const fetchTasks = async () => {
    try {
      const res = await axios.get("/tasks/my-tasks");
      setTasks(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // ===============================
  // Update Status
  // ===============================
  const updateStatus = async (taskId, newStatus) => {
    try {
      setLoading(true);

      await axios.patch(`/tasks/update-status/${taskId}`, {
        status: newStatus,
      });

      fetchTasks();

    } catch (err) {
      console.error(err.response?.data || err.message);
      alert("Error updating status");
    } finally {
      setLoading(false);
    }
  };

  const completedCount = tasks.filter(t => t.status === "Completed").length;
  const pendingCount = tasks.filter(t => t.status !== "Completed").length;

  return (
    <>
      <Navbar role="Employee" />

      <div className="dashboard-container">
        <h1>My Workspace</h1>

        {/* ===== Overview ===== */}
        <div className="stats-grid">
          <div className="card">📋 My Tasks: {tasks.length}</div>
          <div className="card">⏳ Pending: {pendingCount}</div>
          <div className="card">✅ Completed: {completedCount}</div>
        </div>

        {/* ===== Task List ===== */}
        <div className="section" style={{ marginTop: "30px" }}>
          <h2>My Tasks</h2>

          {tasks.length === 0 ? (
            <p>No tasks assigned.</p>
          ) : (
            tasks.map(task => (
              <div key={task._id} className="task-row">
                <span>{task.title}</span>

                <span>
                  {task.deadline
                    ? new Date(task.deadline).toLocaleDateString()
                    : "No Deadline"}
                </span>

                <span className={`badge ${getStatusClass(task.status)}`}>
                  {task.status}
                </span>

                {/* Status Buttons */}
                <div>
                  {task.status !== "To Do" && (
                    <button
                      className="small-btn"
                      onClick={() => updateStatus(task._id, "To Do")}
                    >
                      To Do
                    </button>
                  )}

                  {task.status !== "In Progress" && (
                    <button
                      className="small-btn"
                      onClick={() => updateStatus(task._id, "In Progress")}
                    >
                      In Progress
                    </button>
                  )}

                  {task.status !== "Completed" && (
                    <button
                      className="small-btn"
                      onClick={() => updateStatus(task._id, "Completed")}
                    >
                      Complete
                    </button>
                  )}
                </div>
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

export default EmployeeDashboard;