const jwt = require('jsonwebtoken');

module.exports = function requireAuth(req, res, next) {
  // Accept token from Authorization header OR ?token= query param (for file downloads)
  const header = req.headers.authorization;
  const queryToken = req.query.token;
  if (!header && !queryToken) {
    return res.status(401).json({ error: 'Unauthorised — no token provided' });
  }
  const token = queryToken || (header && header.startsWith('Bearer ') ? header.slice(7) : null);
  if (!token) return res.status(401).json({ error: 'Unauthorised — no token provided' });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = payload;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Unauthorised — invalid or expired token' });
  }
};
