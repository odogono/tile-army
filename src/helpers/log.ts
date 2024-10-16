/* eslint-disable no-console */
import RNFS from 'expo-file-system';
import {
  consoleTransport,
  fileAsyncTransport,
  logger,
} from 'react-native-logs';

// const config = {
//   transport: __DEV__ ? consoleTransport : fileAsyncTransport,
//   severity: __DEV__ ? 'debug' : 'error',
//   transportOptions: {
//     colors: {
//       info: 'blueBright',
//       warn: 'yellowBright',
//       error: 'redBright',
//     },
//     FS: RNFS,
//     printFileLine: true,
//   },
//   formatFunc: (level: string, extension: string | null, msg: any) => {
//     return `${level} ${extension ? `.${extension}` : ''}: ${msg}`;
//   },
// };

export const createLogger = (prefix: string | null = null) => {
  return {
    log: (...args: any[]) => console.log(`[${prefix}]`, ...args),
    debug: (...args: any[]) => console.debug(`[${prefix}]`, ...args),
    info: (...args: any[]) => console.info(`[${prefix}]`, ...args),
    warn: (...args: any[]) => console.warn(`[${prefix}]`, ...args),
    error: (...args: any[]) => console.error(`[${prefix}]`, ...args),
  };

  // return logger.createLogger({
  //   ...config,
  //   formatFunc: (level: string, _extension: string | null, msg: any) => {
  //     const dateTxt = `[${new Date().toLocaleTimeString()}]`;
  //     return `${dateTxt}${prefix ? `[${prefix}]` : ''}[${level}] ${msg}`;
  //   },
  // });
};
