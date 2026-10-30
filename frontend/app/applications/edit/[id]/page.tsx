"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";

export default function EditApplicationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const [companyName, setCompanyName] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("Applied");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchApplication() {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch(`http://localhost:5000/applications/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!res.ok) throw new Error("Failed to fetch application details");
        const data = await res.json();

        setCompanyName(data.company_name || "");
        setRole(data.role || "");
        setStatus(data.status || "Applied");
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchApplication();
  }, [id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`http://localhost:5000/applications/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      if (res.ok) {
        router.push("/applications");
      } else {
        alert("Failed to update application status");
      }
    } catch (err) {
      console.error(err);
      alert("Error updating application status");
    }
  }

  if (loading) return <p style={{ padding: "20px" }}>Loading application details...</p>;

  return (
    <main style={{ padding: "20px", maxWidth: "500px" }}>
      <h1>Edit Application</h1>
      <p><strong>Company:</strong> {companyName}</p>
      <p><strong>Role:</strong> {role}</p>

      <form onSubmit={handleSubmit} style={{ marginTop: "15px" }}>
        <div style={{ marginBottom: "15px" }}>
          <label htmlFor="status-select"><strong>Status: </strong></label>
          <select
            id="status-select"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            style={{ padding: "5px 10px", marginLeft: "10px" }}
          >
            <option value="Applied">Applied</option>
            <option value="Interview">Interview</option>
            <option value="Offer">Offer</option>
            <option value="Rejected">Rejected</option>
            <option value="Expired">Expired</option>
          </select>
        </div>

        <button type="submit" style={{ padding: "8px 16px", cursor: "pointer" }}>
          Update Status
        </button>
      </form>
    </main>
  );
}