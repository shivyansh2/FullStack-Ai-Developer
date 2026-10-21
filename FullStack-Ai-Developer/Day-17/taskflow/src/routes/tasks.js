const express = require('express');
const mongoose = require('mongoose');
const Task = require('../models/Task');
const auth = require('../middleware/auth');

const router = express.Router();
router.use(auth); // every task route requires a valid token

// Clients may only set these fields. `owner` is NEVER read from the body.
const ALLOWED = ['title', 'description', 'status', 'priority', 'dueDate'];
const pick = (body) =>
  Object.fromEntries(ALLOWED.filter((k) => body && k in body).map((k) => [k, body[k]]));

// 404 (not 403) for other users' tasks so IDs can't be probed
const validId = (req, res, next) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ error: 'Task not found' });
  next();
};

router.post('/', async (req, res, next) => {
  try {
    const task = await Task.create({ ...pick(req.body), owner: req.user._id });
    res.status(201).json({ task });
  } catch (err) {
    next(err);
  }
});

router.get('/', async (req, res, next) => {
  try {
    const filter = { owner: req.user._id };
    if (req.query.status) filter.status = String(req.query.status);
    if (req.query.priority) filter.priority = String(req.query.priority);
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 100);
    const [tasks, total] = await Promise.all([
      Task.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
      Task.countDocuments(filter),
    ]);
    res.json({ tasks, page, limit, total });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', validId, async (req, res, next) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, owner: req.user._id });
    if (!task) return res.status(404).json({ error: 'Task not found' });
    res.json({ task });
  } catch (err) {
    next(err);
  }
});

router.patch('/:id', validId, async (req, res, next) => {
  try {
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, owner: req.user._id },
      { $set: pick(req.body) },
      { new: true, runValidators: true }
    );
    if (!task) return res.status(404).json({ error: 'Task not found' });
    res.json({ task });
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', validId, async (req, res, next) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, owner: req.user._id });
    if (!task) return res.status(404).json({ error: 'Task not found' });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

module.exports = router;