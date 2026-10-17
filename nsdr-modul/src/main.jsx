import React from "react";
import { createRoot } from "react-dom/client";
import NSDRModule from "./NSDRModule.jsx";
import "./styles.css";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <NSDRModule />
  </React.StrictMode>
);
