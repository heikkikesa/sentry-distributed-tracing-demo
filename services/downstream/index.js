// Import instrumentation first
import "./instrument.js";
import * as Sentry from "@sentry/node";

import express from "express";
import pg from "pg";

const { Pool } = pg;

const PORT = process.env.PORT || 4001;

// Slowdown mode configuration
const SLOWDOWN_MODE =
  process.env.SLOWDOWN_MODE === "true" || process.env.SLOWDOWN_MODE === "1";

const app = express();

console.log(`🚀 Downstream service starting...`);
console.log(`⚡ Slowdown mode: ${SLOWDOWN_MODE ? "ENABLED" : "DISABLED"}`);
if (SLOWDOWN_MODE) {
  console.log(
    `🐌 Slow operations will be simulated for demonstration purposes`
  );
}

// Initialize PostgreSQL connection pool
const pool = new Pool({
  user: process.env.POSTGRES_USER || "demo_user",
  host: process.env.POSTGRES_HOST || "localhost",
  database: process.env.POSTGRES_DB || "distributed_tracing_demo",
  password: process.env.POSTGRES_PASSWORD || "demo_password",
  port: process.env.POSTGRES_PORT || 5432,
});

async function initializeDatabase() {
  try {
    // Test the connection
    const client = await pool.connect();
    console.log("Connected to PostgreSQL database");

    // Check if data exists, if not, insert sample data
    const result = await client.query("SELECT COUNT(*) FROM widgets");
    const count = parseInt(result.rows[0].count);

    if (count === 0) {
      console.log("Inserting sample data...");
      await client.query(`
        INSERT INTO widgets (name, price) VALUES 
        ('Gadget', 19.99),
        ('Doohickey', 29.99),
        ('Whatsit', 9.99)
      `);
    }

    client.release();
    console.log("Database initialized successfully");
  } catch (err) {
    console.error("Database initialization failed:", err);
    throw err;
  }
}

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "downstream" });
});

app.get("/data", async (req, res, next) => {
  console.log("Request received by downstream: ", req.headers);

  // Generate random data to make each response unique
  const requestId = Math.random().toString(36).substring(2, 15);
  const timestamp = new Date().toISOString();

  if (SLOWDOWN_MODE) {
    console.log("🐌 SLOWDOWN MODE: Simulating performance issues...");

    // Continue the trace from the gateway and create a custom span for the slowdown simulation
    // await Sentry.continueTrace(
    //   {
    //     sentryTrace: req.headers["sentry-trace"],
    //     baggage: req.headers["baggage"],
    //   },
    //   async () => {
    //     await Sentry.startSpan(
    //       {
    //         name: "simulate_slow_database_connection",
    //         op: "performance.issue",
    //         attributes: {
    //           "performance.issue.type": "slow_database_connection",
    //           "slowdown.demo_mode": true,
    //         },
    //       },
    //       async (slowdownSpan) => {
    const dbConnectDelay = Math.floor(Math.random() * 2000) + 2000; // 2000-4000ms

    // slowdownSpan.setAttributes({
    //   "slowdown.delay_ms": dbConnectDelay,
    // });

    console.log(`⏳ Simulating slow DB connection: ${dbConnectDelay}ms`);
    await new Promise((resolve) => setTimeout(resolve, dbConnectDelay));
    //       }
    //     );
    //   }
    // );
  }

  try {
    const client = await pool.connect();
    const result = await client.query(
      "SELECT id, name, price FROM widgets ORDER BY id"
    );
    client.release();

    // Add randomization to the response data
    const responseData = {
      service: "downstream",
      requestId,
      timestamp,
      slowdownMode: SLOWDOWN_MODE,
      randomValue: Math.floor(Math.random() * 1000),
      rows: result.rows.map((row) => ({
        ...row,
        // Add small random price variation (±0.01 to ±0.99)
        price: parseFloat(
          (parseFloat(row.price) + (Math.random() - 0.5) * 2).toFixed(2)
        ),
      })),
    };

    res.json(responseData);
  } catch (err) {
    Sentry.captureException(err);
    throw err;
  }
});

app.use((err, _req, res, _next) => {
  console.error("Downstream error:", err);
  res.status(500).json({ error: "Internal Server Error" });
});

initializeDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Downstream listening on http://localhost:${PORT}`);
      console.log(
        `PostgreSQL database: ${process.env.POSTGRES_HOST || "localhost"}:${
          process.env.POSTGRES_PORT || 5432
        }`
      );
    });
  })
  .catch((err) => {
    console.error("Failed to initialize DB", err);
    process.exit(1);
  });
