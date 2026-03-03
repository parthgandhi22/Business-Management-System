import Navbar from "../components/Navbar";

function AdminDashboard() {
  return (
    <>
      <Navbar role="Admin" />
      <div style={{ padding: "30px", color: "white" }}>
        <h1>Admin Control Panel</h1>
        <div style={{ display: "flex", gap: "20px" }}>
          <div style={cardStyle}>Total Employees</div>
          <div style={cardStyle}>Active Tasks</div>
          <div style={cardStyle}>Audit Logs</div>
        </div>
      </div>
    </>
  );
}

const cardStyle = {
  background: "white",
  color: "black",
  padding: "30px",
  borderRadius: "10px",
  width: "200px",
  textAlign: "center",
  boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
};

export default AdminDashboard;