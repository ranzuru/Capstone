export const handleError = (res, err) => {
  if (err.name === 'ValidationError') {
    // Handle Mongoose validation errors
    return res.status(400).send(err.message);
  } else if (err.name === 'MongoError' && err.code === 11000) {
    // Handle MongoDB duplicate key error
    return res.status(409).send('Duplicate key error');
  } else {
    // General error handling
    console.error(err); // Log the error for debugging
    return res.status(500).send('An internal server error occurred');
  }
};
