import Role from '../models/Role.js'; // Assuming RoleModel is in the same directory

export const createRole = async (req, res) => {
  try {
    const { roleName } = req.body;

    const existingRole = await Role.findOne({ roleName });
    if (existingRole) {
      return res.status(409).json({ error: 'Role name already in use' });
    }
    // If the role name is unique, proceed to create a new role
    const newRole = new Role(req.body);
    await newRole.save();
    res.status(201).json(newRole);
  } catch (error) {
    // Handle errors, including potential violations of the unique constraint
    res.status(400).json({ error: error.message });
  }
};

// Fetch RoleName

export const getAllRoleNames = async (req, res) => {
  try {
    const roles = await Role.find({}, 'roleName'); // Select only the roleName field
    const roleNames = roles.map((role) => role.roleName);
    res.status(200).json(roleNames);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getRole = async (req, res) => {
  try {
    const role = await Role.find();
    res.json(role);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateRole = async (req, res) => {
  try {
    const updatedRole = await Role.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updatedRole) {
      return res.status(404).json({ error: 'Role not found' });
    }
    res.json(updatedRole);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteRole = async (req, res) => {
  try {
    const role = await Role.findByIdAndDelete(req.params.id);
    if (!role) {
      return res.status(404).json({ error: 'Role not found' });
    }
    res.status(200).json({ message: 'Role deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteBulkRoles = async (req, res) => {
  try {
    const roleIds = req.body.ids;

    if (!roleIds || roleIds.length === 0) {
      return res.status(400).json({ error: 'No role IDs provided' });
    }

    const result = await Role.deleteMany({
      _id: { $in: roleIds },
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'No roles found to delete' });
    }

    res
      .status(200)
      .json({ message: `Successfully deleted ${result.deletedCount} roles` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
