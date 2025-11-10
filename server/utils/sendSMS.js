// helper/sendSMS.js
import twilio from 'twilio';

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

const ensureEnv = (key) => {
  if (!process.env[key]) {
    throw new Error(`Missing Twilio env config: ${key}`);
  }
  return process.env[key];
};

const normalizePhoneNumber = (phone) => {
  if (!phone || typeof phone !== 'string') {
    throw new Error('Phone number must be a string');
  }

  const trimmed = phone.trim();
  if (!trimmed) {
    throw new Error('Phone number cannot be empty');
  }

  if (trimmed.startsWith('+')) {
    return trimmed;
  }

  if (trimmed.startsWith('0')) {
    return `+1${trimmed.slice(1)}`;
  }

  if (/^\d+$/.test(trimmed)) {
    return `+${trimmed}`;
  }

  throw new Error('Phone number must contain digits and may start with + or 0');
};

const sendSMS = async ({ to, message }) => {
  ensureEnv('TWILIO_ACCOUNT_SID');
  ensureEnv('TWILIO_AUTH_TOKEN');
  const from = ensureEnv('TWILIO_PHONE_NUMBER');

  if (!message) {
    throw new Error('Message is required to send SMS');
  }

  const normalizedTo = normalizePhoneNumber(to);

  try {
    const res = await client.messages.create({
      body: message,
      from,
      to: normalizedTo,
    });
    console.log('SMS sent:', res.sid);
    return { success: true, sid: res.sid };
  } catch (error) {
    console.error('Error sending SMS:', error.message);
    throw error;
  }
};

export default sendSMS;
