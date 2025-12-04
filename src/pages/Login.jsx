import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useToast } from "../components/ToastProvider";

export default function Login() {
  const toast = useToast();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username || !password) return toast("Enter username and password", "error");
    setLoading(true);
    try {
      await api.login({ username, password });
      toast("Logged in successfully", "success");
      navigate("/");
    } catch {
      // api already notified; still show fallback
      toast("Login failed", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-wrap">
      <div className="form-card">
        <h2>Login</h2>
        <form onSubmit={handleLogin} className="form-grid">
          <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" />
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
          <button type="submit" className="btn btn-accent">{loading ? "Logging in..." : "Login"}</button>
        </form>
      </div>
    </div>
  );
}
