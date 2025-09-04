import React, { useState } from "react";

export default function App() {
  const [gatewayUrl] = useState("http://localhost:4000");
  const [output, setOutput] = useState(null);
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleClick() {
    setIsLoading(true);
    setError(null);
    setOutput(null);
    setData(null);

    try {
      const res = await fetch(`${gatewayUrl}/api/data`, {
        method: "GET",
      });
      const responseData = await res.json();
      setData(responseData);
    } catch (err: any) {
      setError(err?.message ?? String(err));
    } finally {
      setIsLoading(false);
    }
  }

  const renderTable = () => {
    if (!data || !data.downstream || !data.downstream.rows) return null;

    const { downstream } = data;
    const {
      rows,
      requestId,
      timestamp,
      processingTimeMs,
      randomValue,
      slowdownMode,
      slowOperations,
    } = downstream;

    // Calculate performance indicators
    const isSlowRequest = processingTimeMs > 1000;
    const isMediumRequest = processingTimeMs > 500 && processingTimeMs <= 1000;

    return (
      <div style={{ marginTop: "20px" }}>
        {/* Performance Alert */}
        {isSlowRequest && (
          <div
            style={{
              background: "#f8d7da",
              border: "1px solid #f5c6cb",
              borderRadius: "8px",
              padding: "12px",
              marginBottom: "16px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <span style={{ fontSize: "18px" }}>⚠️</span>
            <div>
              <strong>Slow Request Detected</strong>
              <div style={{ fontSize: "12px", color: "#721c24" }}>
                Request took {processingTimeMs}ms - this would trigger
                performance alerts in production
              </div>
            </div>
          </div>
        )}

        {isMediumRequest && !isSlowRequest && (
          <div
            style={{
              background: "#fff3cd",
              border: "1px solid #ffeaa7",
              borderRadius: "8px",
              padding: "12px",
              marginBottom: "16px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <span style={{ fontSize: "18px" }}>🟡</span>
            <div>
              <strong>Medium Response Time</strong>
              <div style={{ fontSize: "12px", color: "#856404" }}>
                Request took {processingTimeMs}ms - slightly slower than optimal
              </div>
            </div>
          </div>
        )}

        {/* Metadata Card */}
        <div
          style={{
            background: "#f8f9fa",
            border: "1px solid #e9ecef",
            borderRadius: "8px",
            padding: "16px",
            marginBottom: "20px",
          }}
        >
          <h4 style={{ margin: "0 0 12px 0", color: "#495057" }}>
            Request Information
          </h4>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "12px",
              fontSize: "14px",
            }}
          >
            <div>
              <strong>Gateway:</strong> {data.from}
            </div>
            <div>
              <strong>Service:</strong> {downstream.service}
            </div>
            <div>
              <strong>Request ID:</strong>{" "}
              <code
                style={{
                  background: "#e9ecef",
                  padding: "2px 4px",
                  borderRadius: "3px",
                }}
              >
                {requestId}
              </code>
            </div>
            <div>
              <strong>Slowdown Mode:</strong>
              <span
                style={{
                  color: slowdownMode ? "#fd7e14" : "#28a745",
                  fontWeight: "600",
                  marginLeft: "4px",
                }}
              >
                {slowdownMode ? "ENABLED 🐌" : "DISABLED ⚡"}
              </span>
            </div>
            <div>
              <strong>Random Value:</strong> {randomValue}
            </div>
            <div>
              <strong>Timestamp:</strong> {new Date(timestamp).toLocaleString()}
            </div>
          </div>
        </div>

        {/* Performance Breakdown */}
        {slowOperations && slowOperations.length > 1 && (
          <div
            style={{
              background: "#f8f9fa",
              border: "1px solid #e9ecef",
              borderRadius: "8px",
              padding: "16px",
              marginBottom: "20px",
            }}
          >
            <h4 style={{ margin: "0 0 12px 0", color: "#495057" }}>
              Performance Breakdown
            </h4>
            <div style={{ fontSize: "14px" }}>
              {slowOperations.map((op, index) => (
                <div
                  key={index}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "8px 0",
                    borderBottom:
                      index < slowOperations.length - 1
                        ? "1px solid #dee2e6"
                        : "none",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <span style={{ fontSize: "16px" }}>
                      {op.type === "db_connection"
                        ? "🔗"
                        : op.type === "slow_query"
                        ? "🐌"
                        : op.type === "data_processing"
                        ? "🔄"
                        : "⚡"}
                    </span>
                    <span style={{ textTransform: "capitalize" }}>
                      {op.type.replace("_", " ")}
                    </span>
                  </div>
                  <span
                    style={{
                      fontWeight: "600",
                      color:
                        op.delay > 1000
                          ? "#dc3545"
                          : op.delay > 500
                          ? "#fd7e14"
                          : "#6c757d",
                    }}
                  >
                    {op.delay}ms
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Data Table */}
        <div
          style={{
            border: "1px solid #e9ecef",
            borderRadius: "8px",
            overflow: "hidden",
          }}
        >
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: "14px",
            }}
          >
            <thead>
              <tr style={{ background: "#f8f9fa" }}>
                <th
                  style={{
                    padding: "12px",
                    textAlign: "left",
                    borderBottom: "1px solid #dee2e6",
                    fontWeight: "600",
                  }}
                >
                  ID
                </th>
                <th
                  style={{
                    padding: "12px",
                    textAlign: "left",
                    borderBottom: "1px solid #dee2e6",
                    fontWeight: "600",
                  }}
                >
                  Product Name
                </th>
                <th
                  style={{
                    padding: "12px",
                    textAlign: "right",
                    borderBottom: "1px solid #dee2e6",
                    fontWeight: "600",
                  }}
                >
                  Price
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row: any, index: number) => (
                <tr
                  key={row.id}
                  style={{
                    background: index % 2 === 0 ? "#ffffff" : "#f8f9fa",
                    borderBottom:
                      index < rows.length - 1 ? "1px solid #dee2e6" : "none",
                  }}
                >
                  <td style={{ padding: "12px" }}>{row.id}</td>
                  <td style={{ padding: "12px", fontWeight: "500" }}>
                    {row.name}
                  </td>
                  <td
                    style={{
                      padding: "12px",
                      textAlign: "right",
                      fontFamily: "monospace",
                      color: "#28a745",
                      fontWeight: "600",
                    }}
                  >
                    ${parseFloat(row.price).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div
          style={{
            fontSize: "12px",
            color: "#6c757d",
            marginTop: "8px",
            textAlign: "center",
          }}
        >
          Showing {rows.length} product{rows.length !== 1 ? "s" : ""}
        </div>
      </div>
    );
  };

  return (
    <div
      style={{
        maxWidth: 800,
        margin: "40px auto",
        fontFamily:
          "Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif",
      }}
    >
      <h1>Distributed Tracing Demo</h1>
      <p style={{ color: "#666", fontSize: 14 }}>
        React + Node + PostgreSQL with Sentry distributed tracing.
      </p>

      <div style={{ margin: "16px 0" }}>
        <button
          onClick={handleClick}
          disabled={isLoading}
          style={{
            padding: "12px 24px",
            fontSize: 16,
            cursor: isLoading ? "not-allowed" : "pointer",
            background: isLoading ? "#6c757d" : "#007bff",
            color: "white",
            border: "none",
            borderRadius: "6px",
            fontWeight: "500",
          }}
        >
          {isLoading ? "Loading..." : "Fetch Product Data"}
        </button>
      </div>

      <div>
        {error && (
          <div
            style={{
              background: "#f8d7da",
              border: "1px solid #f5c6cb",
              borderRadius: "6px",
              padding: "12px",
              color: "#721c24",
              marginBottom: "20px",
            }}
          >
            <strong>Error:</strong> {error}
          </div>
        )}

        {isLoading && (
          <div
            style={{
              background: "#d1ecf1",
              border: "1px solid #bee5eb",
              borderRadius: "6px",
              padding: "12px",
              color: "#0c5460",
              marginBottom: "20px",
            }}
          >
            Fetching data from gateway → downstream → database...
          </div>
        )}

        {data && !isLoading && (
          <div>
            <h3 style={{ marginBottom: "16px" }}>Response Data</h3>
            {renderTable()}
          </div>
        )}

        {!data && !isLoading && !error && (
          <div
            style={{
              background: "#f8f9fa",
              border: "1px dashed #dee2e6",
              borderRadius: "6px",
              padding: "40px",
              textAlign: "center",
              color: "#6c757d",
            }}
          >
            Click the button above to fetch product data and see the distributed
            trace in action!
          </div>
        )}
      </div>
    </div>
  );
}
