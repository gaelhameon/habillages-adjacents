export function getStupidLogger(silentMode = false) {
  const doNothing = function doNothing() { };

  const functionToUse = silentMode ? doNothing : (message, level) => {
    // eslint-disable-next-line no-console
    console.log(`logger(${level}): ${message}`);
  };
  const logOrThrow = (level, message) => {
    if (level === 'throw') throw new Error(message);
    return functionToUse(message, level);
  };
  return {
    OFF: () => { },
    silly: (message) => functionToUse(message, `silly`),
    trace: (message) => functionToUse(message, `trace`),
    debug: (message) => functionToUse(message, `debug`),
    info: (message) => functionToUse(message, `info`),
    progress: (message) => functionToUse(message, `progress`),
    warning: (message) => functionToUse(message, `warn`),
    warn: (message) => functionToUse(message, `warn`),
    error: (message) => functionToUse(message, `error`),
    throw: (message) => {
      throw new Error(message);
    },
    logOrThrow,
    logNotice: ({ level, message }) => logOrThrow(level, message),
  };
}

