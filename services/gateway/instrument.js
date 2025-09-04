import * as Sentry from "@sentry/node";
import dotenv from "dotenv";

dotenv.config();

Sentry.init({
  dsn: process.env.SENTRY_DSN || undefined,
  tracesSampleRate: 1.0,
  debug: true,
  integrations: [
    // Enable automatic instrumentation
    Sentry.httpIntegration(),
    Sentry.expressIntegration(),
  ],
  tracePropagationTargets: ["http://localhost:4001"],
});

export default Sentry;
