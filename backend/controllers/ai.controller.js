const { z } = require('zod');
const AIMessage = require('../models/AIMessage');
const asyncHandler = require('../utils/asyncHandler');
const { generateReply } = require('../services/ai.service');

const chatSchema = z.object({ message: z.string().min(1).max(2000) });

// AI hech qachon boshqa user data'sini contextga olmasin: every lookup inside
// generateReply is scoped to req.user._id, exactly like every other route.
const chat = asyncHandler(async (req, res) => {
  const { message } = chatSchema.parse(req.body);

  await AIMessage.create({ user: req.user._id, role: 'user', content: message });
  const { reply, action } = await generateReply(req.user._id, message);
  await AIMessage.create({ user: req.user._id, role: 'assistant', content: reply });

  res.json({ reply, action });
});

const history = asyncHandler(async (req, res) => {
  const messages = await AIMessage.find({ user: req.user._id }).sort({ createdAt: 1 }).limit(50);
  res.json({ messages });
});

module.exports = { chat, history };
