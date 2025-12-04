import React from "react";
import { Navigate } from "react-router-dom";
import { notify } from "./toastService";

export default function ProtectedRoute({ children }) {
  const token = localStorage.getItem("access");
  if (!token) {
    notify("Please login or register to access this page", "error");
    return <Navigate to="/login" replace />;
  }
  return children;
}
