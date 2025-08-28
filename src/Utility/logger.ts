/***Author
 * Santosh Kulkarni
 * Utility for logging with Winston
 */
import { createLogger, format, transports } from 'winston';

const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp(),
    format.printf(({ level, message, timestamp }) => {
      return `${timestamp} [${level.toUpperCase()}]: ${message}`;
    }),
  ),
  transports: [
    new transports.Console(),

    new transports.File({ filename: 'FinalReports/logs/app.log' }),

    new transports.File({
      filename: 'FinalReports/logs/error.log',
      level: 'error',
    }),
  ],
});

// Log uncaught exceptions and unhandled rejections
logger.exceptions.handle(
  new transports.File({ filename: 'FinalReports/logs/exceptions.log' }),
);

logger.rejections.handle(
  new transports.File({ filename: 'FinalReports/logs/rejections.log' }),
);

logger.rejections.handle(
  new transports.File({ filename: 'FinalReports/logs/rejections.log' }),
);

export function options(scenarioName: string) {
  return {
    transports: [
      new transports.File({
        filename: `FinalReports/logs/${scenarioName}/log.log`,
        level: 'info',
      }),
    ],
  };
}
export default logger;
