// // src/main.jsx
// import React from "react";
// import ReactDOM from "react-dom/client";
// import App from "./App";
// import "./index.css"; // Tailwind or your global CSS

// ReactDOM.createRoot(document.getElementById("root")).render(
//   <React.StrictMode>
//     <App />
//   </React.StrictMode>
// );

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { ToastProvider } from "./components/ToastProvider";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
    <ToastProvider>
      <App/>
    </ToastProvider>
    </BrowserRouter>
    
   
   
  </React.StrictMode>
);
