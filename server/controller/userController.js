import User from '../models/User.js';
import Role from '../models/Role.js';
import bcrypt from 'bcrypt';
import { userValidation } from '../schema/createUserValidation.js';
import { createLog } from './createLogController.js';
import { currentUserId } from '../auth/authenticateMiddleware.js';

// Create a new user
export const createUser = async (req, res) => {
  try {
    const { email, password, confirmPassword, roleName, ...userData } =
      req.body;

    const { error } = userValidation({
      email,
      password,
      confirmPassword,
      roleName,
      ...userData,
    });
    if (error) return res.status(400).send(error.details[0].message);

    const role = await Role.findOne({ roleName });
    if (!role) return res.status(400).send('Invalid Role.');

    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create a new user object with the hashed password and role
    const newUser = new User({
      ...userData,
      email,
      password: hashedPassword,
      role: role._id,
    });

    // Save the new user to the database
    await newUser.save();

    // LOG
    await createLog({
      user: 'n/a',
      section: 'User Profile',
      action: 'CREATE/ POST',
      description: JSON.stringify(newUser),
    });

    const populatedUser = await User.findById(newUser._id).populate('role');
    const userToReturn = populatedUser.toObject();
    delete userToReturn.password;

    res.status(201).json(userToReturn); 

  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Update a user
export const updateUserProfile = async (req, res) => {
  try {
    const { email, roleName, ...updateData } = req.body;

    delete updateData.password;
    delete updateData.confirmPassword;

    // Validate user data for update operation
    const { error } = userValidation({ email, roleName, ...updateData }, false); // false indicates update operation
    if (error) return res.status(400).send(error.details[0].message);

    let updateObject = updateData;

    if (roleName) {
      const role = await Role.findOne({ roleName });
      if (!role) return res.status(400).send('Invalid Role.');
      updateObject.role = role._id;
    }

    // Update user profile in the database
    const userProfile = await User.findByIdAndUpdate(
      req.params.id,
      updateObject,
      { new: true }
    ).populate('role');

    if (!userProfile) return res.status(404).send('User profile not found.');

    // LOG
    await createLog({
      user: 'n/a',
      section: 'User Profile',
      action: 'UPDATE/ PUT',
      description: JSON.stringify(userProfile),
    });

    const response = userProfile.toObject();
    delete response.password;
    response.roleName = userProfile.role.roleName;

    res.send(response); 

  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all user
export const getUser = async (req, res) => {
  try {
    const user = await User.find().populate('role');
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete a user
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(200).json({ message: 'User deleted successfully' });

    // LOG
    await createLog({
      user: 'n/a',
      section: 'User Profile',
      action: 'DELETE',
      description: JSON.stringify(user),
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Profile settings

export const getUserProfile = async (req, res) => {
  try {
    const userId = req.params.userId;

    // Replace 'role' with the actual reference field name in your User model
    const user = await User.findOne({ userId })
      .select('-password') // Exclude the password
      .populate({
        path: 'role', // Populate the role field
        select: 'roleName', // Select only the roleName from the Role model
      });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      ...user.toObject(), // Convert Mongoose document to a plain JavaScript object
      roleName: user.role ? user.role.roleName : 'No role assigned', // Extract roleName
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Function to handle updating the user data
export const updateUserProfileSettings = async (req, res) => {
  try {
    const { userId } = req.params;
    const { firstName, lastName, currentPassword, newPassword } = req.body;
    const updates = {};
    const saltRounds = 10;

    // Fetch the user by their userId (nanoid) including the password hash
    const user = await User.findOne({ userId }).select('+password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update only the provided non-sensitive fields
    if (firstName) updates.firstName = firstName;
    if (lastName) updates.lastName = lastName;

    // If a new password is provided, verify the current password
    if (newPassword) {
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res
          .status(400)
          .json({ message: 'Current password is incorrect' });
      }
      // Hash the new password and prepare for update
      updates.password = await bcrypt.hash(newPassword, saltRounds);
    }

    // Execute the update operation
    const updatedUser = await User.findOneAndUpdate(
      { userId }, // Filter by nanoid
      updates, // Apply updates
      { new: true, runValidators: true }
    ).select('-password'); // Exclude the password from the response

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prepare and return the updated user data excluding sensitive fields
    const userResponse = {
      userId: updatedUser.userId,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      email: updatedUser.email,
      // Other fields as needed but not the password
    };

    res.json({ message: 'Profile updated successfully', user: userResponse });
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Internal server error', error: error.message });
  }
};
