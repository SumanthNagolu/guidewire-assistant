const isProduction = process.env.NODE_ENV === "production";

type LogFn = (...args: unknown[]) => void;

const noop: LogFn = () => {};

const createLogger = () => {
  if (isProduction) {
    return {
      debug: noop,
      info: noop,
      warn: noop,
      error: noop,
    };
  }

  return {
    debug: console.debug.bind(console),
    info: console.info.bind(console),
    warn: console.warn.bind(console),
    error: console.error.bind(console),
  };
};

export const logger = createLogger();




