import { useEffect, useState } from "react";
import axios from "../axiosConfig";
import { Navigate } from "react-router-dom";

function ProtectedRoute({ children, allowedRole }) {
  const [auth, setAuth] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await axios.get("/auth/me");
        if (res.data.role === allowedRole) {
          setAuth(true);
        } else {
          setAuth(false);
        }
      } catch {
        setAuth(false);
      }
    };

    checkAuth();
  }, [allowedRole]);

  if (auth === null) return <div>Loading...</div>;

  return auth ? children : <Navigate to="/login" />;
}

export default ProtectedRoute;