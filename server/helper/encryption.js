import bcrypt from 'bcrypt';
import crypto from 'crypto';

// Hash password
export const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  return hashedPassword;
};

// Compare password
export const comparePassword = async (password, hashedPassword) => {
  const isMatch = await bcrypt.compare(password, hashedPassword);
  return isMatch;
};

// Generate random string
export const createRandomToken = () => {
  const resetToken = crypto.randomInt(0, 1_000_000).toString().padStart(6, '0');
  return resetToken;
};
