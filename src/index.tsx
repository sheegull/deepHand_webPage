import React from "react";
import { createRoot } from "react-dom/client";
import "./lib/i18n";
import { Frame } from "./screens/Frame/Frame";

const root = document.getElementById("app");
if (root) {
  createRoot(root).render(<Frame />);
