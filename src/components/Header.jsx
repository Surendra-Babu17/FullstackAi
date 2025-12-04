import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

export default function Header() {
  const navigate = useNavigate();
  const token = localStorage.getItem("access");
  const username = localStorage.getItem("username");

  const [open, setOpen] = useState(false);

  function logout() {
    api.logout();
    // clean localStorage if needed
    localStorage.removeItem("access");
    // keep username if you want or remove: localStorage.removeItem("username");
    navigate("/");
  }

  // close mobile menu on route change or on ESC
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape" && open) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="logo">
          <div className="logo-icon">CR</div>
          <div className="logo-text-wrap">
            <div className="logo-text">Content Rewriter & Improver</div>
            <div className="logo-subtext">Rewrite essays, mails, docs — fast</div>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="nav-desktop" aria-label="primary navigation">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/history" className="nav-link">History</Link>

          {!token ? (
            <>
              <Link to="/login" className="nav-btn nav-btn-login">Login</Link>
              <Link to="/register" className="nav-btn nav-btn-register">Register</Link>
            </>
          ) : (
            <>
              <div className="nav-username">{username || "You"}</div>
              <button onClick={logout} className="nav-btn nav-btn-logout">Logout</button>
            </>
          )}
        </nav>

        {/* Hamburger for mobile */}
        <button
          className={`hamburger ${open ? "is-open" : ""}`}
          aria-label="Toggle menu"
          aria-expanded={open}
          onClick={() => setOpen((s) => !s)}
        >
          <span /><span /><span />
        </button>
      </div>

      {/* Mobile menu */}
      <div className={`mobile-menu ${open ? "open" : ""}`} aria-hidden={!open}>
        <nav className="mobile-nav">
          <Link to="/" className="mobile-link" onClick={() => setOpen(false)}>Home</Link>
          <Link to="/history" className="mobile-link" onClick={() => setOpen(false)}>History</Link>
          {!token ? (
            <>
              <Link to="/login" className="mobile-link mobile-auth-link" onClick={() => setOpen(false)}>Login</Link>
              <Link to="/register" className="mobile-link mobile-auth-link" onClick={() => setOpen(false)}>Register</Link>
            </>
          ) : (
            <>
              <div className="mobile-username">{username || "You"}</div>
              <button className="mobile-logout" onClick={() => { setOpen(false); logout(); }}>Logout</button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
