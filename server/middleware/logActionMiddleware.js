import logger from '../mongodb/Logger.js';
import ACTION_TYPES from '../utils/actionTypes.js';

const getActionType = (method) => {
  switch (method) {
    case 'POST':
      return 'CREATE';
    case 'PUT':
      return 'UPDATE';
    case 'DELETE':
      return 'DELETE';
    case 'GET':
      return 'READ';
    case 'PATCH':
      return 'MODIFY';
    default:
      return 'UNKNOWN';
  }
};

export const logActionsMiddleware = (req, res, next) => {
  const fullPath = req.baseUrl + req.path;
  let sectionName = null;
  let actionType = getActionType(req.method);

  // Build the regex patterns to identify the section name
  Object.entries(ACTION_TYPES).forEach(([pattern, name]) => {
    const modifiedPattern = pattern.replace(/:id/g, '[0-9a-fA-F]{24}');
    const regex = new RegExp(`^${modifiedPattern}$`);

    if (regex.test(fullPath)) {
      sectionName = name;
    }
  });

  if (!sectionName) {
    sectionName = 'Unknown Section';
  }

  // Overwrite the end method to intercept the response status code
  const originalEnd = res.end;
  res.end = function (chunk, encoding) {
    // Grab the status code before the response is actually sent
    const responseStatusCode = res.statusCode;

    // Log the action if the status is 200 OK and the user is authenticated
    if (responseStatusCode === 200 && req.userResponse) {
      const logEntry = {
        section: sectionName,
        action: actionType,
        method: req.method,
        path: fullPath, // using fullPath that includes baseUrl
        status: responseStatusCode, // Include the status code in the log
        user: {
          id: req.userResponse.userId,
          name: `${req.userResponse.firstName} ${req.userResponse.lastName}`,
          role: req.userResponse.role.roleName,
        },
      };

      logger.info(logEntry);
    }

    // Call the original end method to ensure the response is sent correctly
    originalEnd.call(this, chunk, encoding);
  };

  // Proceed to next middleware or route handler
  next();
};
