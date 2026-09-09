const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ message: 'Access token required' });

  console.log('Verifying token with secret:', process.env.JWT_SECRET ? '***SET***' : '***NOT SET***');
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.error('Token verification failed:', err.message);
      return res.status(403).json({ message: 'Invalid token', error: err.message });
    }
    console.log('Token verified for user:', user);
    req.user = user;
    next();
  });
};

module.exports = authenticateToken;
