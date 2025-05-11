import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { HashRouter as Router } from "react-router-dom";
import "antd/dist/reset.css";
// import "./App.css";
import "./index.css";
import { I18nextProvider } from "react-i18next";
import i18n from "./i18n";

const rootElement = document.getElementById("root");
const root = createRoot(rootElement);

root.render(
  <React.StrictMode>
    <Router>
      <I18nextProvider i18n={i18n}>
        <App />
      </I18nextProvider>
    </Router>
  </React.StrictMode>
);
