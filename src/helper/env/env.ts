import * as dotenv from 'dotenv';
import path from 'path';
import logger from '../../Utility/logger';
/**
 * getting environment variables
 */
export function getEnv() {
  const environment = process.env.ENV;
  if (!environment) {
    logger.info('NO ENV PASSED!');
    process.exit(1);
  }

  const envPath = path.resolve(
    process.cwd(),
    'src/helper/env',
    `.env.${environment}`,
  );
  const result = dotenv.config({ path: envPath, override: true });

  if (result.error) {
    logger.info(`Failed to load ${envPath}`, result.error);
    process.exit(1);
  }

  logger.info(`Loaded environment: .env.${environment}`);
}
