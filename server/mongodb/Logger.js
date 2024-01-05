import winston from 'winston';
import { MongoDB } from 'winston-mongodb';

const options = {
  db: process.env.MONGODB_URL,
  collection: 'logs',
  level: 'info',
  options: { useUnifiedTopology: true },
};

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [new MongoDB(options)],
});

export default logger;
