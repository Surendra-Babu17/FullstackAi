import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useToast } from "../components/ToastProvider";

export default function Register() {
  const toast = useToast();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!username || !email || !password) return toast("Fill all fields", "error");
    setLoading(true);
    try {
      const res = await api.register({ username, email, password });
      const serverMsg = res?.data?.message || res?.data?.detail || "Registered successfully";
      toast(serverMsg, "success");
      navigate("/login");
    } catch (err) {
      toast("Registration failed", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-wrap">
      <div className="form-card">
        <h2>Register</h2>
        <form onSubmit={handleRegister} className="form-grid">
          <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" />
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
          <button type="submit" className="btn btn-accent">{loading ? "Registering..." : "Register"}</button>
        </form>
      </div>
    </div>
  );
}
