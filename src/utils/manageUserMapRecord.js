const mapRecord = (record) => {
  const role = record.role || {};

  const formattedName = `${record.firstName || ''} ${
    record.lastName || ''
  }`.trim();

  return {
    id: record._id,
    userId: record.userId,
    firstName: record.firstName || 'N/A',
    lastName: record.lastName || 'N/A',
    name: formattedName,
    gender: record.gender || 'N/A',
    email: record.email || 'N/A',
    phoneNumber: record.phoneNumber || 'N/A',
    roleName: role.roleName || 'N/A',
    status: record.status,
  };
};

export default mapRecord;
