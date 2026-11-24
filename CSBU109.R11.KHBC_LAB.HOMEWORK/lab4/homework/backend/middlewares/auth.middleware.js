const jwt = require('jsonwebtoken');

function protect(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ success: false, message: 'Please log in first' });
  }

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
}

function adminOnly(req, res, next) {
  if (!req.user || req.user.type !== 'admin') {
    return res.status(403).json({ success: false, message: 'Admin permission required' });
  }
  next();
}

module.exports = { protect, adminOnly };