"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AddApplicationPage() {
  const router = useRouter();
  const [companyName, setCompanyName] = useState("");
  const [role, setRole] = useState("");
  const [dateApplied, setDateApplied] = useState("");
  const [status, setStatus] = useState("");
  const [responseDays, setResponseDays] = useState(0);
  const [notes, setNotes] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!status) {
      alert("Please select a status.");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        alert("Session expired. Please log in again.");
        router.push("/login");
        return;
      }

      const response = await fetch("http://localhost:5000/applications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          company_name: companyName,
          role,
          date_applied: dateApplied,
          status,
          response_days: Number(responseDays),
          response_timeframe: Number(responseDays),
          notes,
        }),
      });

      if (response.ok) {
        router.push("/applications");
      } else {
        // Clean session handling for expired/invalid credentials
        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem("token");
          alert("Session expired or unauthorized. Please log in again.");
          router.push("/login");
          return;
        }

        const errorData = await response.json().catch(() => ({}));
        alert(`Failed to create application: ${errorData.error || errorData.message || response.statusText}`);
      }
    } catch (error) {
      console.error(error);
      alert("An unexpected error occurred while saving.");
    }
  }

  const inputStyle = {
    width: "100%",
    padding: "10px 12px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    fontSize: "14px",
    marginTop: "6px",
    boxSizing: "border-box" as const,
  };

  const labelStyle = {
    display: "block",
    fontSize: "14px",
    fontWeight: "600",
    color: "#333",
  };

  return (
    <main style={{ maxWidth: "550px", margin: "40px auto", padding: "0 20px" }}>
      <div
        style={{
          backgroundColor: "#fff",
          padding: "32px",
          borderRadius: "10px",
          border: "1px solid #e2e8f0",
          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
        }}
      >
        <h1 style={{ fontSize: "24px", fontWeight: "700", marginTop: 0, marginBottom: "20px" }}>
          Add New Application
        </h1>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          <div>
            <label style={labelStyle}>Company Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Google, Discovery"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Role</label>
            <input
              type="text"
              required
              placeholder="e.g. Software Engineer Intern"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Date Applied</label>
            <input
              type="date"
              required
              value={dateApplied}
              onChange={(e) => setDateApplied(e.target.value)}
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Response Timeframe (Days)</label>
            <input
              type="number"
              min="0"
              value={responseDays}
              onChange={(e) => setResponseDays(Number(e.target.value))}
              style={inputStyle}
            />
            <small style={{ color: "#666", fontSize: "12px", marginTop: "4px", display: "block" }}>
              Enter <strong>0</strong> if the company always gives feedback or has no deadline. Enter <strong>7</strong>, <strong>14</strong>, etc. if no response after X days means rejected.
            </small>
          </div>

          <div>
            <label style={labelStyle}>Status</label>
            <select
              required
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              style={{ ...inputStyle, backgroundColor: "#fff" }}
            >
              <option value="" disabled>
                -- Select Status --
              </option>
              <option value="Applied">Applied</option>
              <option value="Interview">Interview</option>
              <option value="Offer">Offer</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          <div>
            <label style={labelStyle}>Notes</label>
            <textarea
              rows={3}
              placeholder="Add any specific details or recruiter notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              style={{ ...inputStyle, resize: "vertical" }}
            />
          </div>

          <button
            type="submit"
            style={{
              padding: "12px",
              backgroundColor: "#0052cc",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              fontWeight: "600",
              fontSize: "15px",
              cursor: "pointer",
              marginTop: "8px",
            }}
          >
            Add Application
          </button>
        </form>
      </div>
    </main>
  );
}