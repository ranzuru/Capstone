import Log from '../models/log.js';
import moment from 'moment-timezone';

export const fetchLogsController = async (req, res) => {
  try {
    const logs = await Log.find().sort({ timestamp: -1 }).lean();
    const formattedLogs = logs.map((log) => formatLog(log));
    res.json(formattedLogs);
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error fetching logs', error: error.message });
  }
};

function formatLog(log) {
  try {
    const messageObj = safeParse(log.message);
    const timestamp = moment(log.timestamp)
      .tz('Asia/Manila')
      .format('YYYY-MM-DD hh:mm:ss A');

    return {
      ID: log._id.toString(),
      UserId: messageObj.user?.id || 'N/A',
      Name: messageObj.user?.name || 'N/A',
      Role: messageObj.user?.role || 'N/A',
      Section: messageObj.section || 'N/A',
      Action: messageObj.action || 'N/A',
      Method: messageObj.method || 'N/A',
      Path: messageObj.path || 'N/A',
      Timestamp: timestamp,
    };
  } catch (parseError) {
    console.error(`Error parsing log message: ${log.message}`, parseError);
    return defaultLogFormat(log);
  }
}

function safeParse(str) {
  try {
    // Replace single quotes with double quotes
    str = str.replace(/'/g, '"');

    // Add quotes around keys
    str = str.replace(/(\w+):/g, '"$1":');

    // Attempt to add quotes around string values, avoiding complex structures
    str = str.replace(/:\s*([^["\d][^,{}]]*)(,|\})/g, ': "$1"$2');

    return JSON.parse(str);
  } catch (e) {
    console.error('Failed to parse:', str, e);
    throw e;
  }
}

function defaultLogFormat(log) {
  return {
    ID: log._id.toString(),
    UserId: 'N/A',
    Name: 'N/A',
    Role: 'N/A',
    Section: 'N/A',
    Action: 'N/A',
    Method: 'N/A',
    Path: 'N/A',
    Timestamp: log.timestamp,
  };
}

export const fetchAllLogsController = async (req, res) => {
  try {
    const logs = await Log.find({}); // This will fetch all logs without any formatting
    res.json(logs);
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error fetching logs', error: error.message });
  }
};
