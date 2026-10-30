"use client";

import { useState } from "react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      // Updated URL to include /api/auth/
      const res = await fetch("http://localhost:5000/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      setMessage(data.message || data.error);
    } catch {
      setMessage("An error occurred. Please try again.");
    }
  }

  return (
    <main style={{ maxWidth: "400px", margin: "50px auto", padding: "20px" }}>
      <h1>Forgot Password</h1>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        <input
          type="email"
          required
          placeholder="Enter your email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ padding: "10px", borderRadius: "6px", border: "1px solid #ccc" }}
        />
        <button type="submit" style={{ padding: "10px", backgroundColor: "#0052cc", color: "#fff", border: "none", borderRadius: "6px" }}>
          Send Reset Link
        </button>
      </form>
      {message && <p style={{ marginTop: "15px" }}>{message}</p>}
    </main>
  );
}