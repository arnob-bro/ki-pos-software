const { findUserById } = require('../models/UserModel');
const { comparePassword } = require('../utils/hash');

function login(userId, password) {
  const user = findUserById(userId);
  if (!user) return { success: false, message: 'User not found' };

  const valid = comparePassword(password, user.password);
  if (!valid) return { success: false, message: 'Invalid credentials' };

  return {
    success: true,
    user: {
      id: user.id,
      user_id: user.user_id,
      role: user.role,
    },
  };
}

module.exports = { login };
