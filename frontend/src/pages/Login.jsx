import { useState } from "react";
import axios from "../axiosConfig";
import { useNavigate } from "react-router-dom";

function Login() {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const handleLogin = async () => {

    try {

      const res = await axios.post("/auth/login", {
        email,
        password,
      });

      const { role, name, id } = res.data;

      // ⭐ Save user in localStorage for sockets
      localStorage.setItem(
        "user",
        JSON.stringify({
          id,
          name,
          role
        })
      );

      // Redirect based on role
      if (role === "admin") navigate("/dashboard/admin");
      else if (role === "manager") navigate("/dashboard/manager");
      else navigate("/dashboard/employee");

    } catch (err) {

      console.error(err);
      alert("Invalid credentials");

    }

  };

  return (
    <div className="auth-container">

      <div className="auth-card">

        <h2>Login</h2>

        <input
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button onClick={handleLogin}>
          Login
        </button>

        <div
          className="link-text"
          onClick={() => navigate("/")}
        >
          Don’t have account? Register
        </div>

      </div>

    </div>
  );
}

export default Login;