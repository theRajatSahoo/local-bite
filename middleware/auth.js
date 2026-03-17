const jwt = require('jsonwebtoken');

function verifyAdmin(req, res, next) {
  const authHeader = req.headers.authorization;

  // Support both "Bearer <token>" and bare token formats
  const token = authHeader && authHeader.startsWith('Bearer ')
    ? authHeader.slice(7)
    : authHeader;

  if (!token) return res.status(403).json({ error: 'Access Denied' });

  try {
    jwt.verify(token, process.env.JWT_SECRET || 'secretkey');
    next();
  } catch {
    res.status(401).json({ error: 'Invalid Token' });
  }
}

module.exports = { verifyAdmin };
