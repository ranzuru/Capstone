export const handleError = (res, err) => {
  if (err.name === 'ValidationError') {
    return res.status(400).send(err.message);
  } else if (
    (err.name === 'MongoServerError' || err.name === 'MongoError') &&
    err.code === 11000
  ) {
    // Check for specific duplicate key errors
    if ('lrn' in err.keyPattern && 'academicYear' in err.keyPattern) {
      return res.status(409).send('LRN with this schoolYear already exists');
    } else if ('employeeId' in err.keyPattern) {
      return res.status(409).send('Employee ID already exists');
    } else if ('email' in err.keyPattern) {
      return res.status(409).send('Email already exists');
    } else {
      return res.status(409).send('Duplicate key error');
    }
  } else {
    console.error(err);
    return res.status(500).send('An internal server error occurred');
  }
};
