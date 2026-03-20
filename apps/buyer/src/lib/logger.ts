import { getLogger } from '@cf/logger/node';

// Create a logger instance for the grower app
export const logger = getLogger('grower');

// Export specific loggers for different modules
export const apiLogger = logger.child({ module: 'api' });
export const authLogger = logger.child({ module: 'auth' });
export const dbLogger = logger.child({ module: 'db' });