import logSchema from '../models/log.js';
import User from '../models/User.js';
import { handleError } from '../utils/handleError.js';

// read
export const getAll = async (req, res) => {
  try {
    const data =
      await logSchema.find();
    
      const populatedData = await Promise.all(data.map(async (data) => {
        const userId = data.user.userId;

        const userData = await User.find({ userId });

        const firstName = userData.map(item => item.firstName);
        const lastName = userData.map(item => item.lastName);
        const role = userData.map(item => item.role);
  
        return {
          ...data.toObject(),
          name: firstName + lastName,
          role: role,
        };
      }));

    res.send(populatedData);

  } catch (err) {
    handleError(res, err);
  }
};
