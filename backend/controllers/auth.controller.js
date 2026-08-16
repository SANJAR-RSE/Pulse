const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { z } = require('zod');
const User = require('../models/User');
const HealthProfile = require('../models/HealthProfile');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

const registerSchema = z.object({
  name: z.string().min(2, 'Ism kamida 2 belgidan iborat bo\'lsin.'),
  email: z.string().email('Email noto\'g\'ri formatda.'),
  password: z.string().min(6, 'Parol kamida 6 belgidan iborat bo\'lsin.'),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

function signToken(user) {
  return jwt.sign({ sub: user._id.toString(), role: user.role }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
}

function toPublicUser(user) {
  return { id: user._id, name: user.name, email: user.email, role: user.role, telegramLinked: !!user.telegramId };
}

const register = asyncHandler(async (req, res) => {
  const { name, email, password } = registerSchema.parse(req.body);

  const existing = await User.findOne({ email });
  if (existing) throw new ApiError(400, 'Bu email bilan foydalanuvchi allaqachon ro\'yxatdan o\'tgan.');

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, passwordHash, role: 'patient' });
  await HealthProfile.create({ user: user._id });

  res.status(201).json({ token: signToken(user), user: toPublicUser(user) });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = loginSchema.parse(req.body);

  const user = await User.findOne({ email });
  if (!user) throw new ApiError(400, 'Email yoki parol noto\'g\'ri.');

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) throw new ApiError(400, 'Email yoki parol noto\'g\'ri.');

  res.json({ token: signToken(user), user: toPublicUser(user) });
});

const me = asyncHandler(async (req, res) => {
  res.json({ user: toPublicUser(req.user) });
});

module.exports = { register, login, me, toPublicUser };
