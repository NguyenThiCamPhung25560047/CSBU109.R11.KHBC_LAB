const { readDB, writeDB } = require('../data/store');

function sanitizeUser(user) {
  const { passwordHash, ...safeUser } = user;
  return safeUser;
}

exports.updateProfile = (req, res) => {
  const { fullName, age, gender } = req.body || {};
  const db = readDB();
  const user = db.users.find((u) => Number(u.id) === Number(req.user.id));

  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  if (fullName !== undefined && fullName.trim() !== '') user.fullName = fullName.trim();
  if (age !== undefined) user.age = Number(age);
  if (gender !== undefined) user.gender = gender;

  writeDB(db);
  res.status(200).json({ success: true, data: sanitizeUser(user) });
};

exports.uploadAvatar = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'Please choose an image file!' });
  }

  const db = readDB();
  const user = db.users.find((u) => Number(u.id) === Number(req.user.id));
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  user.avatarUrl = `/uploads/${req.file.filename}`;
  writeDB(db);

  res.status(200).json({
    success: true,
    message: 'Avatar uploaded successfully',
    data: sanitizeUser(user)
  });
};