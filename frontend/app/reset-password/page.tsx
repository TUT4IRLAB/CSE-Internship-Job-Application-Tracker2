"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) {
      setMessage("Missing reset token.");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword }),
      });
      const data = await res.json();

      if (res.ok) {
        alert("Password reset successfully!");
        router.push("/login");
      } else {
        setMessage(data.error || "Failed to reset password.");
      }
    } catch {
      setMessage("An error occurred. Please try again.");
    }
  }

  return (
    <main style={{ maxWidth: "400px", margin: "50px auto", padding: "20px" }}>
      <h1>Set New Password</h1>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        <input
          type="password"
          required
          placeholder="Enter new password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          style={{ padding: "10px", borderRadius: "6px", border: "1px solid #ccc" }}
        />
        <button type="submit" style={{ padding: "10px", backgroundColor: "#0052cc", color: "#fff", border: "none", borderRadius: "6px" }}>
          Reset Password
        </button>
      </form>
      {message && <p style={{ marginTop: "15px", color: "red" }}>{message}</p>}
    </main>
  );
}