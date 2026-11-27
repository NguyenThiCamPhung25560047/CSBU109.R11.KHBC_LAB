const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { readDB, writeDB, nextId } = require('../data/store');
const { getIO } = require('../socket');

function sanitizeUser(user) {
  const { passwordHash, ...safeUser } = user;
  return safeUser;
}

exports.register = async (req, res, next) => {
  try {
    const { fullName, age, gender, email, password, type } = req.body || {};

    if (!fullName || !email || !password) {
      return res.status(400).json({ success: false, message: 'fullName, email, and password are required' });
    }

    const accountType = type === 'admin' ? 'admin' : 'normal';
    const db = readDB();

    const exists = db.users.some((u) => u.email.toLowerCase() === email.trim().toLowerCase());
    if (exists) {
      return res.status(409).json({ success: false, message: 'Email is already registered' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = {
      id: nextId(db.users),
      fullName: fullName.trim(),
      age: age ? Number(age) : null,
      gender: gender || 'male',
      email: email.trim().toLowerCase(),
      passwordHash,
      avatarUrl: null,
      type: accountType
    };

    db.users.push(newUser);
    writeDB(db);

    const safeUser = sanitizeUser(newUser);
    // Phát sự kiện Real-Time tới tất cả Admin đang online trong room 'admins'
    const io = req.app.get('io') || getIO();
    io.to('admins').emit('newUserRegistered', safeUser);

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      data: safeUser
    });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const db = readDB();
    const user = db.users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: user.id, type: user.type },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
    );

    res.status(200).json({
      success: true,
      token,
      user: sanitizeUser(user),
      data: {
        token,
        user: sanitizeUser(user)
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.getMe = (req, res) => {
  const db = readDB();
  const user = db.users.find((u) => Number(u.id) === Number(req.user.id));
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }
  res.status(200).json({ success: true, data: sanitizeUser(user) });
};
