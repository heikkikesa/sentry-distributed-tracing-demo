// Import instrumentation first
import "./instrument.js";
import * as Sentry from "@sentry/node";

import express from "express";
import cors from "cors";

const PORT = process.env.PORT || 4000;
const DOWNSTREAM_URL = process.env.DOWNSTREAM_URL || "http://localhost:4001";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "gateway" });
});

app.get("/api/data", async (req, res, next) => {
  try {
    console.log("Request received by gateway: ", req.headers);

    // Continue the trace from the frontend
    // return await Sentry.continueTrace(
    //   {
    //     sentryTrace: req.headers["sentry-trace"],
    //     baggage: req.headers["baggage"],
    //   },
    //   async () => {
    //     // Now create a span within the continued trace context
    //     return await Sentry.startSpan(
    //       {
    //         name: "gateway.fetch_downstream_data",
    //         op: "http.client",
    //       },
    //       async (span) => {
    // Prepare headers for downstream request

    // Get trace headers from the current span to propagate to downstream
    // const sentryTrace = Sentry.spanToTraceHeader(span);
    // const baggage = Sentry.spanToBaggageHeader(span);

    // if (sentryTrace) {
    //   headers["sentry-trace"] = sentryTrace;
    // }
    // if (baggage) {
    //   headers["baggage"] = baggage;
    // }

    const response = await fetch(`${DOWNSTREAM_URL}/data`);

    const data = await response.json();

    // Set span attributes
    // span.setAttributes({
    //   "http.method": "GET",
    //   "http.url": `${DOWNSTREAM_URL}/data`,
    //   "http.status_code": response.status,
    // });

    res.status(response.status).json({
      from: "gateway",
      downstream: data,
    });
    //       }
    //     );
    //   }
    // );
  } catch (err) {
    Sentry.captureException(err);
    next(err);
  }
});

app.use((err, _req, res, _next) => {
  console.error("Gateway error:", err);
  res.status(500).json({ error: "Internal Server Error" });
});

app.listen(PORT, () => {
  console.log(`Gateway listening on http://localhost:${PORT}`);
  console.log(`Forwarding to downstream at ${DOWNSTREAM_URL}`);
});
