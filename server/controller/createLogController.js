import LogSchema from '../models/log.js';

export const createLog = async ({ user, section, action, description,}) => {
  try {

    console.log(description);
    const newLog = new LogSchema({
      user,
      section,
      action,
      description,
    });

    await newLog.save();
  } catch (err) {
    console.error('Error creating log:', err);
  }
};
