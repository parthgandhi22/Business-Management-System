import Navbar from "../components/Navbar";

function EmployeeDashboard() {
  return (
    <>
      <Navbar role="Employee" />

      <div className="dashboard-container">
        <h1>My Workspace</h1>

        <div className="stats-grid">
          <div className="card">📌 My Tasks: 5</div>
          <div className="card">⏳ Pending: 2</div>
          <div className="card">✅ Completed: 12</div>
        </div>

        <div className="section">
          <h2>My Tasks</h2>
          <div className="task-row">
            <span>Authentication Module</span>
            <span className="badge inprogress">In Progress</span>
          </div>
          <div className="task-row">
            <span>Fix Login Bug</span>
            <span className="badge todo">To Do</span>
          </div>
        </div>
      </div>
    </>
  );
}

export default EmployeeDashboard;