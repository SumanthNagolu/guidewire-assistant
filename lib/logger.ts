import winston from 'winston';

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  verbose: 4,
  debug: 5,
  silly: 6,
};

// Define log colors
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  verbose: 'cyan',
  debug: 'blue',
  silly: 'gray',
};

winston.addColors(colors);

// Create format
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// Console format for development
const consoleFormat = winston.format.combine(
  winston.format.colorize({ all: true }),
  winston.format.timestamp({ format: 'HH:mm:ss' }),
  winston.format.printf((info) => {
    const { timestamp, level, message, ...extra } = info;
    return `${timestamp} [${level}]: ${message} ${
      Object.keys(extra).length ? JSON.stringify(extra) : ''
    }`;
  })
);

// Define transports
const transports = [];

// Console transport for development
if (process.env.NODE_ENV !== 'production') {
  transports.push(
    new winston.transports.Console({
      format: consoleFormat,
    })
  );
} else {
  // File transport for production
  transports.push(
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      format,
    }),
    new winston.transports.File({
      filename: 'logs/combined.log',
      format,
    })
  );
}

// Create logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  levels,
  format,
  transports,
});

// Create typed logger functions
export const log = {
  error: (message: string, meta?: any) => logger.error(message, meta),
  warn: (message: string, meta?: any) => logger.warn(message, meta),
  info: (message: string, meta?: any) => logger.info(message, meta),
  http: (message: string, meta?: any) => logger.http(message, meta),
  verbose: (message: string, meta?: any) => logger.verbose(message, meta),
  debug: (message: string, meta?: any) => logger.debug(message, meta),
};

// Specific logging functions for different contexts
export const loggers = {
  // API logging
  api: {
    request: (method: string, url: string, userId?: string) => {
      log.http('API Request', { method, url, userId });
    },
    response: (method: string, url: string, status: number, duration: number) => {
      log.http('API Response', { method, url, status, duration });
    },
    error: (method: string, url: string, error: any) => {
      log.error('API Error', { method, url, error: error.message, stack: error.stack });
    },
  },

  // Authentication logging
  auth: {
    login: (userId: string, method: string) => {
      log.info('User Login', { userId, method });
    },
    logout: (userId: string) => {
      log.info('User Logout', { userId });
    },
    signup: (email: string, method: string) => {
      log.info('User Signup', { email, method });
    },
    failed: (email: string, reason: string) => {
      log.warn('Auth Failed', { email, reason });
    },
  },

  // Learning logging
  learning: {
    topicStart: (userId: string, topicId: string) => {
      log.info('Topic Started', { userId, topicId });
    },
    topicComplete: (userId: string, topicId: string, timeSpent: number) => {
      log.info('Topic Completed', { userId, topicId, timeSpent });
    },
    quizAttempt: (userId: string, quizId: string, score: number) => {
      log.info('Quiz Attempt', { userId, quizId, score });
    },
  },

  // AI logging
  ai: {
    request: (userId: string, type: string, model: string) => {
      log.info('AI Request', { userId, type, model });
    },
    response: (userId: string, type: string, tokens: number, duration: number) => {
      log.info('AI Response', { userId, type, tokens, duration });
    },
    error: (userId: string, type: string, error: string) => {
      log.error('AI Error', { userId, type, error });
    },
  },

  // Productivity logging
  productivity: {
    sessionStart: (userId: string, sessionId: string) => {
      log.info('Productivity Session Start', { userId, sessionId });
    },
    sessionEnd: (userId: string, sessionId: string, duration: number) => {
      log.info('Productivity Session End', { userId, sessionId, duration });
    },
    screenshot: (userId: string, activityLevel: number) => {
      log.debug('Screenshot Captured', { userId, activityLevel });
    },
  },

  // System logging
  system: {
    startup: (version: string, environment: string) => {
      log.info('System Startup', { version, environment });
    },
    shutdown: () => {
      log.info('System Shutdown');
    },
    error: (component: string, error: any) => {
      log.error('System Error', { component, error: error.message, stack: error.stack });
    },
    performance: (operation: string, duration: number) => {
      log.verbose('Performance', { operation, duration });
    },
  },
};

export default logger;
