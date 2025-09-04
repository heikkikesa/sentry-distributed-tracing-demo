// Import instrumentation first
import "./instrument.js";

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

    const headers = {
      "Content-Type": "application/json",
    };

    console.log("Gateway sending headers to downstream:", headers);

    const response = await fetch(`${DOWNSTREAM_URL}/data`);

    const data = await response.json();

    res.status(response.status).json({
      from: "gateway",
      downstream: data,
    });
  } catch (err) {
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
