// utils/logActivity.js
import UserLog from '../models/UserLog.js';

export const logActivity = async (username, activity, operation) => {
  try {
    const log = new UserLog({
      username,
      activity,
      operation,
    });
    await log.save();
  } catch (err) {
    console.error('Logging error:', err.message);
  }
};
