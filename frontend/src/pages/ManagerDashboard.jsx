import Navbar from "../components/Navbar";

function ManagerDashboard() {
  return (
    <>
      <Navbar role="Manager" />

      <div className="dashboard-container">
        <h1>Manager Dashboard</h1>

        <div className="stats-grid">
          <div className="card">👥 Team Members: 8</div>
          <div className="card">📋 Active Tasks: 21</div>
          <div className="card">⚠️ Overdue Tasks: 3</div>
        </div>

        <div className="section">
          <h2>Recent Tasks</h2>
          <div className="task-row">
            <span>API Integration</span>
            <span className="badge inprogress">In Progress</span>
          </div>
          <div className="task-row">
            <span>Database Schema</span>
            <span className="badge todo">To Do</span>
          </div>
          <div className="task-row">
            <span>UI Fixes</span>
            <span className="badge completed">Completed</span>
          </div>
        </div>
      </div>
    </>
  );
}

export default ManagerDashboard;