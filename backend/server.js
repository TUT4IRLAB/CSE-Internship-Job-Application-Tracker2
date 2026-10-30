const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
require("dotenv").config();

// Import central Nodemailer transporter
const transporter = require("./config/mailer");

const app = express();

app.use(cors());
app.use(express.json());

// Connect to Neon PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Test database connection
pool.query("SELECT NOW()", (err, result) => {
  if (err) {
    console.error("Database connection failed!");
    console.error(err);
  } else {
    console.log("Connected to Neon PostgreSQL");
    console.log("Database time:", result.rows[0].now);
  }
});

// Make database available to routes
app.locals.db = pool;

// Authentication Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Access token required" });
  }

  jwt.verify(token, process.env.JWT_SECRET || "fallback_secret", (err, user) => {
    if (err) {
      return res.status(403).json({ error: "Invalid or expired token" });
    }
    req.user = user;
    next();
  });
};

// ==========================================
// AUTHENTICATION ROUTES
// ==========================================

// Register User
app.post("/api/auth/register", async (req, res) => {
  const { name, email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  try {
    const userExists = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (userExists.rows.length > 0) {
      return res.status(400).json({ error: "Email already registered" });
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const newUser = await pool.query(
      "INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email",
      [name || null, email, passwordHash]
    );

    res.status(201).json({
      message: "User registered successfully",
      user: newUser.rows[0]
    });
  } catch (err) {
    console.error("Error registering user:", err);
    res.status(500).json({ error: "Server error during registration" });
  }
});

// Login User
app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  try {
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (result.rows.length === 0) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    const user = result.rows[0];

    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || "fallback_secret",
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });
  } catch (err) {
    console.error("Error logging in:", err);
    res.status(500).json({ error: "Server error during login" });
  }
});

// Request Password Reset Link
app.post("/api/auth/forgot-password", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  try {
    const userResult = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    
    // Always return success message even if email doesn't exist for security
    if (userResult.rows.length === 0) {
      return res.json({ message: "If that email exists, a reset link has been sent." });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 3600000); // Token valid for 1 hour

    await pool.query(
      "UPDATE users SET reset_password_token = $1, reset_password_expires = $2 WHERE email = $3",
      [token, expires, email]
    );

    const resetUrl = `http://localhost:3000/reset-password?token=${token}`;

    const mailUser = process.env.EMAIL_USER || process.env.SMTP_USER;

    await transporter.sendMail({
      from: `"Job Application Tracker" <${mailUser}>`,
      to: email,
      subject: "Password Reset Request",
      html: `
        <h3>Password Reset Request</h3>
        <p>You requested a password reset for your account.</p>
        <p>Click the link below to set a new password:</p>
        <a href="${resetUrl}">${resetUrl}</a>
        <p>This link will expire in 1 hour.</p>
      `,
    });

    res.json({ message: "If that email exists, a reset link has been sent." });
  } catch (err) {
    console.error("Error in forgot-password:", err);
    res.status(500).json({ error: "Server error during password reset request" });
  }
});

// Save New Password
app.post("/api/auth/reset-password", async (req, res) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return res.status(400).json({ error: "Token and new password are required" });
  }

  try {
    const userResult = await pool.query(
      "SELECT * FROM users WHERE reset_password_token = $1 AND reset_password_expires > NOW()",
      [token]
    );

    if (userResult.rows.length === 0) {
      return res.status(400).json({ error: "Invalid or expired reset token" });
    }

    const saltRounds = 10;
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

    await pool.query(
      "UPDATE users SET password_hash = $1, reset_password_token = NULL, reset_password_expires = NULL WHERE id = $2",
      [newPasswordHash, userResult.rows[0].id]
    );

    res.json({ message: "Password updated successfully. You can now log in." });
  } catch (err) {
    console.error("Error in reset-password:", err);
    res.status(500).json({ error: "Server error during password reset" });
  }
});

// Applications routes
const applicationsRouter = require("./routers/aplications");
console.log("Applications router loaded:", applicationsRouter);
app.use("/applications", applicationsRouter);

// Stats summary route (User-Specific)
app.get("/applications/stats", authenticateToken, async (req, res) => {
  const userId = req.user.userId;

  try {
    const total = await pool.query("SELECT COUNT(*) FROM applications WHERE user_id = $1", [userId]);
    const applied = await pool.query("SELECT COUNT(*) FROM applications WHERE user_id = $1 AND LOWER(status) = 'applied'", [userId]);
    const interviews = await pool.query("SELECT COUNT(*) FROM applications WHERE user_id = $1 AND LOWER(status) = 'interview'", [userId]);
    const offers = await pool.query("SELECT COUNT(*) FROM applications WHERE user_id = $1 AND LOWER(status) = 'offer'", [userId]);
    const rejected = await pool.query("SELECT COUNT(*) FROM applications WHERE user_id = $1 AND LOWER(status) = 'rejected'", [userId]);
    const expired = await pool.query("SELECT COUNT(*) FROM applications WHERE user_id = $1 AND LOWER(status) = 'expired'", [userId]);

    res.json({
      total: parseInt(total.rows[0].count, 10),
      applied: parseInt(applied.rows[0].count, 10),
      interviews: parseInt(interviews.rows[0].count, 10),
      offers: parseInt(offers.rows[0].count, 10),
      rejected: parseInt(rejected.rows[0].count, 10),
      expired: parseInt(expired.rows[0].count, 10),
    });
  } catch (err) {
    console.error("Error fetching stats:", err);
    res.status(500).json({ error: "Failed to fetch application statistics" });
  }
});

// Test route
app.get("/", (req, res) => {
  res.json({
    message: "Job Application Tracker API is running"
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});