import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { VoiceProvider } from './context/VoiceContext.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import App from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <AuthProvider>
      <VoiceProvider>
        <App />
      </VoiceProvider>
    </AuthProvider>
  </BrowserRouter>
);
