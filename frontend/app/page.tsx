"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Application {
  id: number;
  company_name: string;
  role: string;
  date_applied: string;
  status: string;
}

interface User {
  id: number;
  name?: string;
  email: string;
}

export default function DashboardPage() {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  // Auth Form States
  const [isRegistering, setIsRegistering] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [authError, setAuthError] = useState("");

  const [stats, setStats] = useState({
    total: 0,
    applied: 0,
    interviews: 0,
    offers: 0,
    rejected: 0,
    expired: 0,
  });

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");
    if (savedToken) setToken(savedToken);
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

  useEffect(() => {
    if (token) {
      fetchStats();
    }
  }, [token]);

  async function fetchStats() {
    try {
      const response = await fetch("http://localhost:5000/applications", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          handleLogout();
        }
        return;
      }

      const applications: Application[] = await response.json();

      setStats({
        total: applications.length,
        applied: applications.filter((a) => a.status.toLowerCase() === "applied").length,
        interviews: applications.filter((a) => a.status.toLowerCase() === "interview").length,
        offers: applications.filter((a) => a.status.toLowerCase() === "offer").length,
        rejected: applications.filter((a) => a.status.toLowerCase() === "rejected").length,
        expired: applications.filter((a) => a.status.toLowerCase() === "expired").length,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  }

  async function handleAuth(e: React.FormEvent) {
    e.preventDefault();
    setAuthError("");

    const endpoint = isRegistering ? "/api/auth/register" : "/api/auth/login";
    const payload = isRegistering
      ? { name: nameInput, email: emailInput, password: passwordInput }
      : { email: emailInput, password: passwordInput };

    try {
      const res = await fetch(`http://localhost:5000${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setAuthError(data.error || "Authentication failed");
        return;
      }

      if (isRegistering) {
        setIsRegistering(false);
        setAuthError("Registration successful! Please log in.");
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
      setPasswordInput("");
    } catch {
      setAuthError("Network error. Please try again.");
    }
  }

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
  }

  const statCards = [
    { label: "Total Applications", count: stats.total, color: "#172b4d" },
    { label: "Applied", count: stats.applied, color: "#0052cc" },
    { label: "Interviews", count: stats.interviews, color: "#ffab00" },
    { label: "Offers", count: stats.offers, color: "#36b37e" },
    { label: "Rejected", count: stats.rejected, color: "#ff5630" },
    { label: "Expired", count: stats.expired, color: "#6b778c" },
  ];

  // Auth Form Render if not logged in
  if (!token) {
    return (
      <main style={{ maxWidth: "400px", margin: "80px auto", padding: "0 20px" }}>
        <div style={{ backgroundColor: "#fff", padding: "32px", borderRadius: "10px", border: "1px solid #e2e8f0", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
          <h2 style={{ fontSize: "22px", fontWeight: "700", marginBottom: "8px", textAlign: "center" }}>
            {isRegistering ? "Create an Account" : "Sign In"}
          </h2>
          <p style={{ color: "#6b778c", fontSize: "14px", textAlign: "center", marginBottom: "24px" }}>
            {isRegistering ? "Register to start tracking your applications" : "Log in to view your application dashboard"}
          </p>

          {authError && (
            <div style={{ padding: "10px", backgroundColor: "#ffebe6", color: "#de350b", borderRadius: "6px", fontSize: "13px", marginBottom: "16px" }}>
              {authError}
            </div>
          )}

          <form onSubmit={handleAuth} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {isRegistering && (
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "4px" }}>Name</label>
                <input
                  type="text"
                  required
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                  placeholder="John Doe"
                />
              </div>
            )}
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "4px" }}>Email</label>
              <input
                type="email"
                required
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                placeholder="student@example.com"
              />
            </div>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                <label style={{ fontSize: "13px", fontWeight: "600" }}>Password</label>
                {!isRegistering && (
                  <Link
                    href="/forgot-password"
                    style={{ color: "#0052cc", fontSize: "12px", textDecoration: "none", fontWeight: "500" }}
                  >
                    Forgot Password?
                  </Link>
                )}
              </div>
              <input
                type="password"
                required
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              style={{ backgroundColor: "#0052cc", color: "#fff", border: "none", padding: "12px", borderRadius: "6px", fontWeight: "600", cursor: "pointer", marginTop: "10px" }}
            >
              {isRegistering ? "Sign Up" : "Sign In"}
            </button>
          </form>

          <p style={{ textAlign: "center", fontSize: "13px", color: "#64748b", marginTop: "20px" }}>
            {isRegistering ? "Already have an account?" : "Don't have an account?"}{" "}
            <span
              onClick={() => { setIsRegistering(!isRegistering); setAuthError(""); }}
              style={{ color: "#0052cc", cursor: "pointer", fontWeight: "600" }}
            >
              {isRegistering ? "Log In" : "Sign Up"}
            </span>
          </p>
        </div>
      </main>
    );
  }

  return (
    <main style={{ maxWidth: "1000px", margin: "40px auto", padding: "0 20px" }}>
      {/* Header Section */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
        <div>
          <h1 style={{ fontSize: "28px", fontWeight: "700", marginBottom: "8px" }}>
            Job Application Tracker
          </h1>
          <p style={{ color: "#6b778c", margin: 0 }}>
            Welcome back, <strong>{user?.name || user?.email}</strong>!
          </p>
        </div>
        <button
          onClick={handleLogout}
          style={{ backgroundColor: "#f1f5f9", color: "#334155", border: "1px solid #cbd5e1", padding: "8px 16px", borderRadius: "6px", cursor: "pointer", fontWeight: "600" }}
        >
          Log Out
        </button>
      </div>

      {/* Metric Cards Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
          gap: "16px",
          marginBottom: "40px",
        }}
      >
        {statCards.map((card) => (
          <div
            key={card.label}
            style={{
              backgroundColor: "#fff",
              padding: "20px",
              borderRadius: "8px",
              border: "1px solid #e2e8f0",
              textAlign: "center",
              boxShadow: "0 2px 4px rgba(0, 0, 0, 0.02)",
            }}
          >
            <div style={{ fontSize: "28px", fontWeight: "700", color: card.color }}>
              {card.count}
            </div>
            <div style={{ fontSize: "14px", color: "#6b778c", marginTop: "4px" }}>
              {card.label}
            </div>
          </div>
        ))}
      </div>

      {/* Why Use This Tracker Section */}
      <section
        style={{
          backgroundColor: "#fff",
          padding: "32px",
          borderRadius: "10px",
          border: "1px solid #e2e8f0",
          boxShadow: "0 2px 4px rgba(0, 0, 0, 0.02)",
        }}
      >
        <h2 style={{ fontSize: "20px", fontWeight: "700", marginTop: 0, marginBottom: "8px" }}>
          Why Use This Tracker?
        </h2>
        <p style={{ color: "#6b778c", fontSize: "14px", marginTop: 0, marginBottom: "24px" }}>
          Many job platforms help users find opportunities, but this system focuses on managing the applications after you apply.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "16px",
          }}
        >
          <div
            style={{
              backgroundColor: "#f8fafc",
              padding: "16px",
              borderRadius: "8px",
              border: "1px solid #f1f5f9",
            }}
          >
            <h3 style={{ fontSize: "15px", fontWeight: "600", marginTop: 0, marginBottom: "6px" }}>
              🎯 Simple & Focused
            </h3>
            <p style={{ fontSize: "13px", color: "#64748b", margin: 0, lineHeight: "1.4" }}>
              Designed specifically for students and graduates managing internship and entry-level job applications.
            </p>
          </div>

          <div
            style={{
              backgroundColor: "#f8fafc",
              padding: "16px",
              borderRadius: "8px",
              border: "1px solid #f1f5f9",
            }}
          >
            <h3 style={{ fontSize: "15px", fontWeight: "600", marginTop: 0, marginBottom: "6px" }}>
              📊 Easy Tracking
            </h3>
            <p style={{ fontSize: "13px", color: "#64748b", margin: 0, lineHeight: "1.4" }}>
              Track applications, statuses, dates, and notes from one central dashboard.
            </p>
          </div>

          <div
            style={{
              backgroundColor: "#f8fafc",
              padding: "16px",
              borderRadius: "8px",
              border: "1px solid #f1f5f9",
            }}
          >
            <h3 style={{ fontSize: "15px", fontWeight: "600", marginTop: 0, marginBottom: "6px" }}>
              ⚡ Quick Updates
            </h3>
            <p style={{ fontSize: "13px", color: "#64748b", margin: 0, lineHeight: "1.4" }}>
              Easily update an application when you receive an interview, offer, rejection, or when it expires.
            </p>
          </div>

          <div
            style={{
              backgroundColor: "#f8fafc",
              padding: "16px",
              borderRadius: "8px",
              border: "1px solid #f1f5f9",
            }}
          >
            <h3 style={{ fontSize: "15px", fontWeight: "600", marginTop: 0, marginBottom: "6px" }}>
              🚀 Built for Students
            </h3>
            <p style={{ fontSize: "13px", color: "#64748b", margin: 0, lineHeight: "1.4" }}>
              The system is designed to be simple, practical, and easy to use without unnecessary features.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}