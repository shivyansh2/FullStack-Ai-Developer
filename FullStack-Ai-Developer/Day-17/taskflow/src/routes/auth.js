const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

const signToken = (user) =>
  jwt.sign({ sub: user._id.toString() }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

const isString = (v) => typeof v === 'string';

router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password } = req.body || {};
    const errors = {};
    if (!isString(name) || name.trim().length < 2) errors.name = 'Name must be at least 2 characters';
    if (!isString(email) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'A valid email is required';
    if (!isString(password) || password.length < 8) errors.password = 'Password must be at least 8 characters';
    if (Object.keys(errors).length) return res.status(400).json({ error: 'Validation failed', details: errors });

    const hash = await bcrypt.hash(password, 10);
    // the unique index rejects duplicates atomically (no check-then-insert race)
    const user = await User.create({ name, email, password: hash });
    res.status(201).json({ user, token: signToken(user) });
  } catch (err) {
    next(err);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body || {};
    if (!isString(email) || !isString(password)) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');
    const ok = user && (await bcrypt.compare(password, user.password));
    if (!ok) return res.status(401).json({ error: 'Invalid email or password' });
    res.json({ user, token: signToken(user) });
  } catch (err) {
    next(err);
  }
});

router.get('/me', auth, (req, res) => res.json({ user: req.user }));

module.exports = router;