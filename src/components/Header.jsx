import React from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

export default function Header() {
  const navigate = useNavigate();
  const token = localStorage.getItem("access");
  const username = localStorage.getItem("username");

  function logout() {
    api.logout();
    navigate("/");
  }

  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="logo">
          <div className="logo-icon">CR</div>
          <div>
            <div className="logo-text">Content Rewriter & Improver</div>
            <div className="logo-subtext">Rewrite essays, mails, docs — fast</div>
          </div>
        </Link>

        <nav>
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/history" className="nav-link">History</Link>
          {/* <a href="mailto:support@example.com" className="nav-link">Contact</a> */}
          {!token ? (
            <>
              <Link to="/login" className="nav-btn nav-btn-login">Login</Link>
              <Link to="/register" className="nav-btn nav-btn-register">Register</Link>
            </>
          ) : (
            <>
              <div className="nav-username" style={{backgroundColor:"black", color:"white", fontWeight:"700", padding:"6px", borderRadius:"10px"}} >{username || "You"}</div>
              <button onClick={logout} className="nav-btn nav-btn-logout" style={{backgroundColor:"greenyellow", color:"black", fontWeight:"700"}}>Logout</button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
