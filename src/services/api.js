// src/services/api.js
import axios from "axios";
import { notify } from "../components/toastService";

const BASE = "https://content-rewriter-backend.onrender.com/api";

// axios instance
const instance = axios.create({
  baseURL: BASE,
  timeout: 30000,
});

/* -----------------------------------
   TOKEN HELPERS
----------------------------------- */

instance.setToken = (token) => {
  if (token) {
    instance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete instance.defaults.headers.common["Authorization"];
  }
};

const savedAccess = localStorage.getItem("access");
if (savedAccess) instance.setToken(savedAccess);

function saveTokens({ access, refresh }) {
  if (access) {
    localStorage.setItem("access", access);
    instance.setToken(access);
  }
  if (refresh) localStorage.setItem("refresh", refresh);
}

function clearTokens() {
  localStorage.removeItem("access");
  localStorage.removeItem("refresh");
  localStorage.removeItem("username");
  instance.setToken(null);
}

/* -----------------------------------
   REFRESH TOKEN LOGIC
----------------------------------- */

async function tryRefreshToken() {
  const refresh = localStorage.getItem("refresh");
  if (!refresh) return null;

  try {
    const res = await axios.post(`${BASE}/token/refresh/`, { refresh });

    const newAccess =
      res.data.access ||
      res.data.token ||
      res.data?.tokens?.access;

    const newRefresh =
      res.data.refresh ||
      res.data?.tokens?.refresh ||
      refresh;

    saveTokens({ access: newAccess, refresh: newRefresh });
    return newAccess;
  } catch (e) {
    clearTokens();
    return null;
  }
}

/* -----------------------------------
   INTERCEPTOR
----------------------------------- */

instance.interceptors.response.use(
  (resp) => resp,
  async (err) => {
    const original = err.config || {};
    const status = err?.response?.status;

    // token expired → refresh
    if (status === 401 && !original._retry) {
      original._retry = true;
      const newToken = await tryRefreshToken();

      if (newToken) {
        original.headers = original.headers || {};
        original.headers["Authorization"] = `Bearer ${newToken}`;
        return instance(original);
      }

      notify("Session expired. Please log in again.", "error");
      clearTokens();
      return Promise.reject(err);
    }

    // user-friendly error
    const data = err?.response?.data;
    const msg =
      data?.detail ||
      data?.message ||
      (typeof data === "string" ? data : null) ||
      (data ? JSON.stringify(data) : null) ||
      err?.message ||
      "Server error";

    notify(msg, "error");
    return Promise.reject(err);
  }
);

/* -----------------------------------
      AUTH ENDPOINTS
----------------------------------- */

export async function register({ username, email, password }) {
  // backend names must match exactly
  return instance.post("/register/", {
    username,
    email,
    password,
  });
}

export async function login({ username, password }) {
  const res = await instance.post("/login/", { username, password });

  const data = res.data || {};

  const access =
    data.access ||
    data.token ||
    data?.tokens?.access ||
    data?.data?.access;

  const refresh =
    data.refresh ||
    data?.tokens?.refresh ||
    data?.data?.refresh;

  if (access) {
    saveTokens({ access, refresh });
    try {
      localStorage.setItem("username", username);
    } catch {}
  }

  return res;
}

export function logout() {
  clearTokens();
  notify("Logged out", "info");
}

/* -----------------------------------
      REWRITE + HISTORY
----------------------------------- */

export function rewrite(data) {
  return instance.post("/rewrite/", data);
}

export function saveHistory(data) {
  return instance.post("/history/save/", data);
}

export function getHistory() {
  return instance.get("/history/");
}

export function deleteHistory(id) {
  return instance.delete(`/history/${id}/`);
}

/* -----------------------------------
      PDF EXPORT (BLOB)
----------------------------------- */

export function exportPdf(id) {
  return instance.get(`/export/pdf/${id}/`, {
    responseType: "blob",
  });
}

/* -----------------------------------
      VOICE 
----------------------------------- */

export function textToVoice({ text, language = "en" }) {
  return instance.post(
    "/voice/",
    { text, language },
    { responseType: "blob" }
  );
}

export function speechToText({ file, language = "en" }) {
  const fd = new FormData();
  fd.append("audio", file);
  fd.append("language", language);
  return instance.post("/speech-to-text/", fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });
}

/* -----------------------------------
      EXPORT DEFAULT
----------------------------------- */

const api = {
  instance,
  setToken: instance.setToken,
  register,
  login,
  logout,
  rewrite,
  saveHistory,
  getHistory,
  deleteHistory,
  exportPdf,
  textToVoice,
  speechToText,
};

export default api;
