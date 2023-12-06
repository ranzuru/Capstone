import User from '../models/User.js';
import Role from '../models/Role.js';
import bcrypt from 'bcrypt';
import { userValidation } from '../schema/createUserValidation.js';

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
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
