import { useState } from "react";
import axios from "../axiosConfig";
import { useNavigate } from "react-router-dom";

function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "employee",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = async () => {
    await axios.post("/auth/register", form);
    alert("Registered Successfully!");
    navigate("/login");
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Register</h2>

        <input name="name" placeholder="Name" onChange={handleChange} />
        <input name="email" placeholder="Email" onChange={handleChange} />
        <input
          name="password"
          type="password"
          placeholder="Password"
          onChange={handleChange}
        />

        <select name="role" onChange={handleChange}>
          <option value="employee">Employee</option>
          <option value="manager">Manager</option>
          <option value="admin">Admin</option>
        </select>

        <button onClick={handleRegister}>Register</button>

        <div className="link-text" onClick={() => navigate("/login")}>
          Already have account? Login
        </div>
      </div>
    </div>
  );
}

export default Register;