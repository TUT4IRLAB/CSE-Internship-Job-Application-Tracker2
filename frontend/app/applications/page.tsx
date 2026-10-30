"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Application {
  id: number;
  company_name: string;
  role: string;
  date_applied: string;
  status: string;
  response_days?: number;
  notes: string | null;
}

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>("ALL");

  async function fetchApplications() {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch("http://localhost:5000/applications", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          console.error("Session expired or unauthorized. Please log in again.");
        }
        throw new Error("Failed to fetch applications");
      }

      const data = await response.json();
      setApplications(data);
    } catch (error) {
      console.error("Error fetching applications:", error);
    }
  }

  useEffect(() => {
    fetchApplications();
  }, []);

  async function handleStatusChange(id: number, newStatus: string) {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`http://localhost:5000/applications/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        setApplications((prev) =>
          prev.map((app) => (app.id === id ? { ...app, status: newStatus } : app))
        );
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
  }

  async function handleDelete(id: number) {
    if (!window.confirm("Are you sure you want to delete this application?")) return;

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`http://localhost:5000/applications/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setApplications((prev) => prev.filter((app) => app.id !== id));
      }
    } catch (error) {
      console.error("Error deleting application:", error);
    }
  }

  function formatDate(dateStr: string) {
    if (!dateStr) return "N/A";
    return dateStr.slice(0, 10);
  }

  function isApplicationExpired(dateAppliedStr: string, allowedDays: number = 0) {
    if (!allowedDays || allowedDays <= 0) return false;

    const appliedDate = new Date(dateAppliedStr);
    const today = new Date();
    const diffInDays = Math.floor((today.getTime() - appliedDate.getTime()) / (1000 * 3600 * 24));
    return diffInDays >= allowedDays;
  }

  const filteredApplications = applications.filter((app) => {
    if (filterStatus === "ALL") return true;
    return app.status.toLowerCase() === filterStatus.toLowerCase();
  });

  return (
    <main style={{ maxWidth: "800px", margin: "30px auto", padding: "0 20px 80px 20px" }}>
      <h1 style={{ fontSize: "28px", fontWeight: "700" }}>Job Applications</h1>
      <p style={{ color: "#666" }}>View and manage your internship and job applications.</p>

      {/* Filter Tabs */}
      <div style={{ display: "flex", gap: "10px", margin: "20px 0", flexWrap: "wrap" }}>
        {["ALL", "Applied", "Interview", "Offer", "Rejected", "Expired"].map((status) => (
          <button
            key={status}
            type="button"
            onClick={() => setFilterStatus(status)}
            style={{
              padding: "6px 16px",
              borderRadius: "6px",
              border: "1px solid #ccc",
              backgroundColor: filterStatus === status ? "#0052cc" : "#fff",
              color: filterStatus === status ? "#fff" : "#333",
              fontWeight: "500",
              cursor: "pointer",
            }}
          >
            {status}
          </button>
        ))}
      </div>

      {filteredApplications.length === 0 ? (
        <p>No applications found.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {filteredApplications.map((app) => {
            const timeframe = app.response_days ?? 0;
            const overdue =
              app.status.toLowerCase() === "applied" &&
              isApplicationExpired(app.date_applied, timeframe);

            return (
              <div
                key={app.id}
                style={{
                  border: "1px solid #e2e8f0",
                  padding: "20px",
                  borderRadius: "8px",
                  backgroundColor: "#fff",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
                }}
              >
                <h2 style={{ margin: "0 0 10px 0", fontSize: "20px" }}>{app.company_name}</h2>
                <p style={{ margin: "4px 0" }}><strong>Role:</strong> {app.role}</p>
                <p style={{ margin: "4px 0" }}><strong>Date Applied:</strong> {formatDate(app.date_applied)}</p>
                <p style={{ margin: "4px 0" }}>
                  <strong>Expected Response Time:</strong>{" "}
                  {timeframe === 0 ? "No expiry (Always responds)" : `${timeframe} days`}
                </p>
                <p style={{ margin: "4px 0" }}><strong>Status:</strong> {app.status}</p>

                {overdue && (
                  <div
                    style={{
                      backgroundColor: "#fff3cd",
                      color: "#856404",
                      padding: "8px 12px",
                      borderRadius: "6px",
                      margin: "12px 0",
                      fontSize: "13px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span>⚠️ Over {timeframe} days with no response.</span>
                    <button
                      type="button"
                      onClick={() => handleStatusChange(app.id, "Expired")}
                      style={{
                        padding: "4px 10px",
                        fontSize: "12px",
                        cursor: "pointer",
                        backgroundColor: "#856404",
                        color: "#fff",
                        border: "none",
                        borderRadius: "4px",
                      }}
                    >
                      Mark Expired
                    </button>
                  </div>
                )}

                <p style={{ margin: "4px 0 12px 0" }}><strong>Notes:</strong> {app.notes || "No notes"}</p>

                <div style={{ display: "flex", gap: "10px" }}>
                  <Link href={`/applications/edit/${app.id}`}>
                    <button
                      type="button"
                      style={{
                        padding: "6px 14px",
                        backgroundColor: "#f1f5f9",
                        border: "1px solid #cbd5e1",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontSize: "13px",
                      }}
                    >
                      Edit
                    </button>
                  </Link>

                  <button
                    type="button"
                    onClick={() => handleDelete(app.id)}
                    style={{
                      padding: "6px 14px",
                      backgroundColor: "#fff1f0",
                      color: "#e53e3e",
                      border: "1px solid #ffa39e",
                      borderRadius: "4px",
                      cursor: "pointer",
                      fontSize: "13px",
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}