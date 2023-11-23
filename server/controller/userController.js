import User from '../models/User.js';
import Role from '../models/Role.js';
import bcrypt from 'bcrypt';

// Create a new user
export const createUser = async (req, res) => {
  try {
    const { email, password, roleId, ...userData } = req.body;

    // Check if the email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: 'Email already in use' });
    }

    // Validate the role
    if (roleId) {
      const roleExists = await Role.findById(roleId);
      if (!roleExists) {
        return res.status(400).json({ error: 'Invalid role ID' });
      }
    }

    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create a new user object with the hashed password and role
    const newUser = new User({
      ...userData,
      email,
      password: hashedPassword,
      role: roleId,
    });

    // Save the new user to the database
    await newUser.save();

    // Exclude the password in the response
    const userToReturn = { ...newUser._doc };
    delete userToReturn.password;
    res.status(201).json(userToReturn);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get a single user by ID
export const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a user
export const updateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const { roleId } = req.body;

    // Validate the role
    if (!roleId) {
      return res.status(400).json({ error: 'Role ID is required' });
    }

    const roleExists = await Role.findById(roleId);
    if (!roleExists) {
      return res.status(400).json({ error: 'Invalid role ID' });
    }

    // Update the user's role
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { role: roleId },
      { new: true, runValidators: true }
    );
    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(updatedUser);
  } catch (error) {
    res.status(400).json({ error: error.message });
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
