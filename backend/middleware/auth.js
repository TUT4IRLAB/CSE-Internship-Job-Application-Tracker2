// backend/middleware/auth.js
const verifyMasterPassword = (req, res, next) => {
  const providedPassword = req.headers['x-admin-password'];
  const expectedPassword = process.env.ADMIN_PASSWORD;

  if (!providedPassword || providedPassword !== expectedPassword) {
    return res.status(403).json({ 
      error: 'Unauthorized: Invalid or missing admin password' 
    });
  }

  next();
};

module.exports = { verifyMasterPassword };