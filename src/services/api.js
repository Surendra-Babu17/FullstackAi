// import axios from "axios";
// import { notify } from "../components/toastService";

// const BASE = "https://content-rewriter-backend.onrender.com/api";

// const instance = axios.create({ baseURL: BASE, timeout: 30000 });

// // set auth token helper
// instance.setToken = (token) => {
//   if (token) instance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
//   else delete instance.defaults.headers.common["Authorization"];
// };

// const savedAccess = localStorage.getItem("access");
// if (savedAccess) instance.setToken(savedAccess);

// function saveTokens({ access, refresh }) {
//   if (access) { localStorage.setItem("access", access); instance.setToken(access); }
//   if (refresh) localStorage.setItem("refresh", refresh);
// }

// function clearTokens() {
//   localStorage.removeItem("access");
//   localStorage.removeItem("refresh");
//   localStorage.removeItem("username");
//   instance.setToken(null);
// }

// async function tryRefreshToken() {
//   const refresh = localStorage.getItem("refresh");
//   if (!refresh) return null;
//   try {
//     const res = await axios.post(`${BASE}/token/refresh/`, { refresh });
//     saveTokens({ access: res.data.access, refresh: res.data.refresh || refresh });
//     return res.data.access;
//   } catch {
//     clearTokens();
//     return null;
//   }
// }

// instance.interceptors.response.use(
//   (resp) => resp,
//   async (err) => {
//     const original = err.config || {};
//     const status = err?.response?.status;
//     if (status === 401 && !original._retry) {
//       original._retry = true;
//       const newToken = await tryRefreshToken();
//       if (newToken) {
//         original.headers = original.headers || {};
//         original.headers["Authorization"] = `Bearer ${newToken}`;
//         return instance(original);
//       }
//       notify("Session expired. Please log in again.", "error");
//       clearTokens();
//     }
//     const data = err?.response?.data;
//     const msg = data?.detail || data?.message || err?.message || "Server error";
//     notify(msg, "error");
//     return Promise.reject(err);
//   }
// );

// // === API endpoints ===
// export async function register({ username, email, password }) {
//   return instance.post("/register/", { username, email, password });
// }

// export async function login({ username, password }) {
//   const res = await instance.post("/login/", { username, password });
//   const access = res.data?.access || res.data?.token;
//   const refresh = res.data?.refresh || res.data?.tokens?.refresh;
//   if (access) {
//     saveTokens({ access, refresh });
//     localStorage.setItem("username", username);
//   }
//   return res;
// }

// export function logout() { clearTokens(); notify("Logged out", "info"); }

// // rewrite / history endpoints
// export function rewrite(data) { return instance.post("/rewrite/", data); }
// export function saveHistory(data) { return instance.post("/history/save/", data); }
// export function getHistory() { return instance.get("/history/"); }
// export function deleteHistory(id) { return instance.delete(`/history/${id}/`); }
// export function exportPdf(id) { return instance.get(`/export/pdf/${id}/`, { responseType: "blob" }); }

// /**
//  * Text to voice:
//  * - Use responseType: "arraybuffer" so backend binary audio arrives correctly.
//  * - If your backend sometimes returns JSON { audio_base64: "..." } this file still works
//  *   because the client-side handlePlay can handle both ArrayBuffer and base64 JSON.
//  */
// export function textToVoice(payload) {
//   // If backend expects multipart/form-data for voice settings, adapt here.
//   return instance.post("/text-to-voice/", payload, {
//     responseType: "arraybuffer" // <<-- important: get binary audio
//   });
// }

// /**
//  * Speech to text (upload audio file)
//  * Example: call with FormData { file: audioFile, language: 'en' }
//  * Backend expected to return JSON { text: "..." }
//  */
// export function speechToText(formData) {
//   // Make sure you pass a proper FormData and not a plain object
//   return instance.post("/speech-to-text/", formData, {
//     headers: { "Content-Type": "multipart/form-data" },
//     responseType: "json"
//   });
// }

// export default {
//   instance,
//   setToken: instance.setToken,
//   register,
//   login,
//   logout,
//   rewrite,
//   saveHistory,
//   getHistory,
//   deleteHistory,
//   exportPdf,
//   textToVoice,
//   speechToText,
// };
import axios from "axios";
import { notify } from "../components/toastService";

/**
 * ===============================
 * BASE URL (Render Backend)
 * ===============================
 */
const BASE = "https://content-rewriter-backend.onrender.com/api";

/**
 * ===============================
 * AXIOS INSTANCE
 * ===============================
 */
const instance = axios.create({
  baseURL: BASE,
  timeout: 30000,
});

/**
 * ===============================
 * AUTH TOKEN HELPERS
 * ===============================
 */
instance.setToken = (token) => {
  if (token) {
    instance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete instance.defaults.headers.common["Authorization"];
  }
};

// Load token on refresh
const savedAccess = localStorage.getItem("access");
if (savedAccess) {
  instance.setToken(savedAccess);
}

function saveTokens({ access, refresh }) {
  if (access) {
    localStorage.setItem("access", access);
    instance.setToken(access);
  }
  if (refresh) {
    localStorage.setItem("refresh", refresh);
  }
}

function clearTokens() {
  localStorage.removeItem("access");
  localStorage.removeItem("refresh");
  localStorage.removeItem("email");
  instance.setToken(null);
}

/**
 * ===============================
 * REFRESH TOKEN LOGIC
 * ===============================
 */
async function tryRefreshToken() {
  const refresh = localStorage.getItem("refresh");
  if (!refresh) return null;

  try {
    const res = await axios.post(`${BASE}/token/refresh/`, { refresh });
    saveTokens({
      access: res.data.access,
      refresh: refresh,
    });
    return res.data.access;
  } catch (err) {
    clearTokens();
    return null;
  }
}

/**
 * ===============================
 * RESPONSE INTERCEPTOR
 * ===============================
 */
instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error?.response?.status;

    if (status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const newAccess = await tryRefreshToken();
      if (newAccess) {
        originalRequest.headers["Authorization"] = `Bearer ${newAccess}`;
        return instance(originalRequest);
      }

      notify("Session expired. Please login again.", "error");
      clearTokens();
    }

    const msg =
      error?.response?.data?.detail ||
      error?.response?.data?.message ||
      error.message ||
      "Server Error";

    notify(msg, "error");
    return Promise.reject(error);
  }
);

/**
 * ===============================
 * AUTH APIs
 * ===============================
 */
export function register({ username, email, password }) {
  return instance.post("/register/", {
    username,
    email,
    password,
  });
}

export async function login({ email, password }) {
  const res = await instance.post("/login/", {
    email,
    password,
  });

  const access = res.data?.access;
  const refresh = res.data?.refresh;

  if (access) {
    saveTokens({ access, refresh });
    localStorage.setItem("email", email);
  }

  return res;
}

export function logout() {
  clearTokens();
  notify("Logged out successfully", "info");
}

/**
 * ===============================
 * REWRITE API
 * ===============================
 */
export function rewrite(payload) {
  return instance.post("/rewrite/", payload);
}

/**
 * ===============================
 * HISTORY APIs
 * ===============================
 */
export function getHistory() {
  return instance.get("/history/");
}

export function saveHistory(payload) {
  return instance.post("/history/save/", payload);
}

export function deleteHistory(id) {
  return instance.delete(`/history/${id}/`);
}

/**
 * ===============================
 * EXPORT PDF
 * ===============================
 */
export function exportPdf(id) {
  return instance.get(`/export/pdf/${id}/`, {
    responseType: "blob",
  });
}

/**
 * ===============================
 * SPEECH TO TEXT
 * ===============================
 * FormData:
 * { file: audioFile }
 */
export function speechToText(formData) {
  return instance.post("/speech-to-text/", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
}

/**
 * ===============================
 * EXPORT DEFAULT
 * ===============================
 */
export default {
  instance,
  register,
  login,
  logout,
  rewrite,
  getHistory,
  saveHistory,
  deleteHistory,
  exportPdf,
  speechToText,
};