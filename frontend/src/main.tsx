import React from "react";
import ReactDOM from "react-dom/client";
import * as Sentry from "@sentry/react";
import App from "./App";

const SENTRY_DSN = (import.meta as any).env?.VITE_SENTRY_DSN || "";

if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    tracesSampleRate: 1.0,
    tracePropagationTargets: [
      "http://localhost:4000",
      "http://localhost:4001",
      /^\/$/,
    ],
    integrations: [
      Sentry.browserTracingIntegration({
        traceFetch: true,
      }),
    ],
  });
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <App />
);
