const jwt = require('jsonwebtoken');
const { User } = require('../db');
const secret = process.env.JWT_SECRET || 'dev_jwt_secret';

module.exports = async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ status: 'fail', data: { message: 'No token provided' } });

  const parts = header.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({ status: 'fail', data: { message: 'Invalid authorization format' } });
  }

  const token = parts[1];
  try {
    const payload = jwt.verify(token, secret);
    const user = await User.findByPk(payload.id);
    if (!user) return res.status(401).json({ status: 'fail', data: { message: 'User not found' } });
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ status: 'fail', data: { message: 'Invalid token' } });
  }
};