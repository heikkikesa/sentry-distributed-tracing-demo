import React, { useState } from "react";

export default function App() {
  const [gatewayUrl] = useState("http://localhost:4000");
  const [output, setOutput] = useState("(Click the button to fetch)");

  async function handleClick() {
    setOutput("Loading...");
    try {
      const res = await fetch(`${gatewayUrl}/api/data`, {
        method: "GET",
      });
      const text = await res.text();
      setOutput(text);
    } catch (err: any) {
      setOutput("Error: " + (err?.message ?? String(err)));
    }
  }

  return (
    <div
      style={{
        maxWidth: 720,
        margin: "40px auto",
        fontFamily:
          "Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif",
      }}
    >
      <h1>Distributed Tracing Demo</h1>
      <p style={{ color: "#666", fontSize: 14 }}>
        React + Node + SQLite with Sentry distributed tracing.
      </p>

      <div style={{ margin: "16px 0" }}>
        <button
          onClick={handleClick}
          style={{ padding: "10px 16px", fontSize: 16, cursor: "pointer" }}
        >
          Fetch data
        </button>
      </div>

      <h3>Response</h3>
      <pre
        style={{
          background: "#f6f8fa",
          padding: 12,
          borderRadius: 6,
          overflow: "auto",
        }}
      >
        {output}
      </pre>
    </div>
  );
}
