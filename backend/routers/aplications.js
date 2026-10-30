const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");

// JWT Authentication Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Access token required. Please log in." });
  }

  jwt.verify(token, process.env.JWT_SECRET || "fallback_secret", (err, user) => {
    if (err) {
      return res.status(403).json({ error: "Invalid or expired token" });
    }
    req.user = user;
    next();
  });
};

// GET application statistics
router.get("/stats", authenticateToken, async (req, res) => {
  try {
    const db = req.app.locals.db;
    const userId = req.user.userId;

    const result = await db.query(
      `
      SELECT
        COUNT(*) AS total,
        COUNT(*) FILTER (WHERE LOWER(status) = 'applied') AS applied,
        COUNT(*) FILTER (WHERE LOWER(status) = 'interview') AS interview,
        COUNT(*) FILTER (WHERE LOWER(status) = 'offer') AS offer,
        COUNT(*) FILTER (WHERE LOWER(status) = 'rejected') AS rejected,
        COUNT(*) FILTER (WHERE LOWER(status) = 'expired') AS expired
      FROM applications
      WHERE user_id = $1
      `,
      [userId]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching statistics:", error.message);
    res.status(500).json({ error: "Failed to fetch application statistics" });
  }
});

// GET all job applications
router.get("/", authenticateToken, async (req, res) => {
  try {
    const db = req.app.locals.db;
    const userId = req.user.userId;
    const { status } = req.query;

    let query = "SELECT * FROM applications WHERE user_id = $1";
    let values = [userId];

    if (status) {
      query += " AND status = $2";
      values.push(status);
    }

    query += " ORDER BY created_at DESC";

    const result = await db.query(query, values);
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching applications:", error.message);
    res.status(500).json({ error: "Failed to fetch applications" });
  }
});

// GET application by ID
router.get("/:id", authenticateToken, async (req, res) => {
  try {
    const db = req.app.locals.db;
    const userId = req.user.userId;
    const { id } = req.params;

    const result = await db.query(
      "SELECT * FROM applications WHERE id = $1 AND user_id = $2",
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Application not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching application:", error.message);
    res.status(500).json({ error: "Failed to fetch application" });
  }
});

// POST new application
router.post("/", authenticateToken, async (req, res) => {
  try {
    const db = req.app.locals.db;
    const userId = req.user.userId;
    const { company_name, role, date_applied, status, response_days, notes } = req.body;

    if (!company_name || !role || !date_applied || !status) {
      return res.status(400).json({
        error: "Company name, role, date applied, and status are required",
      });
    }

    const validStatuses = ["Applied", "Interview", "Offer", "Rejected", "Expired"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status value provided" });
    }

    const days = response_days !== undefined && response_days !== null ? Number(response_days) : 0;

    const result = await db.query(
      `INSERT INTO applications
       (user_id, company_name, role, date_applied, status, response_days, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [userId, company_name, role, date_applied, status, days, notes || null]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error creating application:", error.message);
    res.status(500).json({ error: "Failed to create application: " + error.message });
  }
});

// UPDATE status
router.put("/:id", authenticateToken, async (req, res) => {
  try {
    const db = req.app.locals.db;
    const userId = req.user.userId;
    const { id } = req.params;
    const { status } = req.body;

    const result = await db.query(
      `UPDATE applications
       SET status = $1
       WHERE id = $2 AND user_id = $3
       RETURNING *`,
      [status, id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Application not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error updating application:", error.message);
    res.status(500).json({ error: "Failed to update application" });
  }
});

// DELETE application
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const db = req.app.locals.db;
    const userId = req.user.userId;
    const { id } = req.params;

    const result = await db.query(
      "DELETE FROM applications WHERE id = $1 AND user_id = $2 RETURNING *",
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Application not found" });
    }

    res.json({
      message: "Application deleted successfully",
      application: result.rows[0],
    });
  } catch (error) {
    console.error("Error deleting application:", error.message);
    res.status(500).json({ error: "Failed to delete application" });
  }
});

module.exports = router;