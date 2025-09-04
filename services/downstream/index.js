// Import instrumentation first
import "./instrument.js";
import * as Sentry from "@sentry/node";

import express from "express";
import pg from "pg";

const { Pool } = pg;

const PORT = process.env.PORT || 4001;

const app = express();

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
  try {
    console.log("Request received by downstream: ", req.headers);
    console.log("Downstream sentry-trace:", req.headers["sentry-trace"]);
    console.log("Downstream baggage:", req.headers["baggage"]);

    // // Continue the trace from the gateway
    // return await Sentry.continueTrace(
    //   {
    //     sentryTrace: req.headers["sentry-trace"],
    //     baggage: req.headers["baggage"],
    //   },
    //   async () => {
    //     // Create a span for the database operation within the continued trace
    //     return await Sentry.startSpan(
    //       {
    //         name: "downstream.fetch_widgets",
    //         op: "db.query",
    //       },
    //       async (span) => {
    try {
      const client = await pool.connect();
      const result = await client.query(
        "SELECT id, name, price FROM widgets ORDER BY id"
      );
      client.release();

      // span.setAttributes({
      //   "db.operation": "SELECT",
      //   "db.table": "widgets",
      //   "db.rows_affected": result.rows.length,
      //   "db.system": "postgresql",
      // });

      res.json({ service: "downstream", rows: result.rows });
    } catch (err) {
      span.setStatus({ code: 2, message: err.message }); // ERROR status
      Sentry.captureException(err);
      throw err;
    }
    //       }
    //     );
    //   }
    // );
  } catch (err) {
    //Sentry.captureException(err);
    next(err);
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
