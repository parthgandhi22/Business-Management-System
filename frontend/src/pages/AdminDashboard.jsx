import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import axios from "../axiosConfig";
import "../index.css";

function AdminDashboard() {

  const [users, setUsers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [logs, setLogs] = useState([]);
  const [slips, setSlips] = useState([]);

  const [announcement, setAnnouncement] = useState("");

  // ===============================
  // Fetch Users
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
  // Fetch Tasks
  // ===============================
  const fetchTasks = async () => {
    try {
      const res = await axios.get("/tasks/all");
      setTasks(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // ===============================
  // Fetch Logs
  // ===============================
  const fetchLogs = async () => {
    try {
      const res = await axios.get("/audit/logs");
      setLogs(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // ===============================
  // Fetch Payroll Slips
  // ===============================
  const fetchSlips = async () => {
    try {
      const res = await axios.get("/payroll/all");
      setSlips(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchTasks();
    fetchLogs();
    fetchSlips();
  }, []);

  // ===============================
  // Send Payroll Email
  // ===============================
  const sendEmail = async (id) => {
    try {
      await axios.post(`/payroll/send/${id}`);
      fetchSlips();
    } catch (err) {
      console.error(err);
    }
  };

  // ===============================
  // Send Announcement
  // ===============================
  const sendAnnouncement = async () => {

    if (!announcement.trim()) {
      alert("Write announcement first");
      return;
    }

    try {

      await axios.post("/admin/announcement", {
        message: announcement
      });

      alert("Announcement sent to all employees");

      setAnnouncement("");

    } catch (err) {

      console.error(err);

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

      fetchLogs();

    } catch (err) {

      console.error(err);
      alert("Error deleting task");

    }

  };

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
      <Navbar role="admin" />

      <div className="dashboard-container">

        <h1>Admin Control Panel</h1>

        {/* ===== Stats ===== */}
        <div className="stats-grid">

          <div className="card">👥 Total Users: {users.length}</div>

          <div className="card">🧑‍💼 Managers: {totalManagers}</div>

          <div className="card">👨‍💻 Employees: {totalEmployees}</div>

          <div className="card">📋 Total Tasks: {tasks.length}</div>

          <div className="card">✅ Completed: {completedTasks}</div>

          <div className="card">⚠️ Overdue: {overdueTasks}</div>

        </div>

        {/* ===== ANNOUNCEMENT SECTION ===== */}

        <div className="section" style={{ marginTop: "30px" }}>

          <h2>Company Announcement</h2>

          <textarea
            className="announcement-box"
            placeholder="Write announcement for all employees..."
            value={announcement}
            onChange={(e) => setAnnouncement(e.target.value)}
          />

          <button
            className="announcement-btn"
            onClick={sendAnnouncement}
          >
            Send Announcement
          </button>

        </div>

        {/* ===== Users ===== */}

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

        {/* ===== Tasks ===== */}

        <div className="section" style={{ marginTop: "30px" }}>

          <h2>All Tasks</h2>

          {tasks.map(task => {

            const statusClass = getStatusClass(task.status);

            return (

              <div key={task._id} className={`admin-task-card ${statusClass}`}>

                <div className="admin-card-header">

                  <h3>{task.title}</h3>

                  <button
                    className="delete-icon-btn"
                    onClick={() => handleDelete(task._id)}
                  >
                    ✕
                  </button>

                </div>

                <div className="admin-task-body">

                  <div className="task-meta">

                    <span>👤 {task.assignedTo?.name}</span>
                    <span>🧑‍💼 {task.assignedBy?.name}</span>

                  </div>

                  <div className="task-footer">

                    <span className="deadline">
                      📅 {task.deadline
                        ? new Date(task.deadline).toLocaleDateString()
                        : "No Deadline"}
                    </span>

                    <span className={`status-pill ${statusClass}`}>
                      {task.status}
                    </span>

                  </div>

                </div>

              </div>

            );

          })}

        </div>

        {/* ===== Payroll ===== */}

        <div className="section" style={{ marginTop: "40px" }}>

          <h2>Payroll Management</h2>

          <table className="payroll-table">

            <thead>

              <tr>
                <th>Employee</th>
                <th>Month</th>
                <th>Slip</th>
                <th>Email</th>
              </tr>

            </thead>

            <tbody>

              {slips.map((slip) => {

                const fileName = slip.filePath.split("/").pop();

                return (

                  <tr key={slip._id}>

                    <td>{slip.employee?.name}</td>

                    <td>{slip.month}</td>

                    <td>

                      <a
                        href={`http://localhost:8000/salary_slips/${fileName}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Download
                      </a>

                    </td>

                    <td>

                      {slip.sent ? (

                        <span className="sent-badge">
                          Sent
                        </span>

                      ) : (

                        <button
                          className="send-mail-btn"
                          onClick={() => sendEmail(slip._id)}
                        >
                          Send Email
                        </button>

                      )}

                    </td>

                  </tr>

                );

              })}

            </tbody>

          </table>

        </div>

        {/* ===== Audit Logs ===== */}

        <div className="section" style={{ marginTop: "40px" }}>

          <h2>System Activity Timeline</h2>

          <div className="audit-timeline">

            {logs.map((log) => {

              const visual = getLogVisual(log.action);

              return (

                <div key={log._id} className="timeline-item">

                  <div className={`timeline-icon ${visual.class}`}>
                    {visual.icon}
                  </div>

                  <div className="timeline-content">

                    <div className="audit-action">
                      {log.description}
                    </div>

                    <div className="audit-meta">

                      <span className="audit-role">
                        {log.role}
                      </span>

                      <span>
                        {new Date(log.createdAt).toLocaleString()}
                      </span>

                    </div>

                  </div>

                </div>

              );

            })}

          </div>

        </div>

      </div>
    </>
  );
}

function getLogVisual(action = "") {

  if (action.includes("CREATE")) return { icon: "➕", class: "log-create" };

  if (action.includes("DELETE")) return { icon: "🗑️", class: "log-delete" };

  if (action.includes("UPDATE")) return { icon: "✏️", class: "log-update" };

  if (action.includes("STATUS")) return { icon: "🔄", class: "log-status" };

  return { icon: "📌", class: "log-default" };

}

function getStatusClass(status) {
  if (status === "To Do") return "todo";
  if (status === "In Progress") return "inprogress";
  if (status === "Completed") return "completed";
  return "";
}

export default AdminDashboard;