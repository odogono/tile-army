import RNFS from 'expo-file-system';
import {
  consoleTransport,
  fileAsyncTransport,
  logger,
} from 'react-native-logs';

const config = {
  transport: __DEV__ ? consoleTransport : fileAsyncTransport,
  severity: __DEV__ ? 'debug' : 'error',
  transportOptions: {
    colors: {
      info: 'blueBright',
      warn: 'yellowBright',
      error: 'redBright',
    },
    FS: RNFS,
    printFileLine: true,
  },
  formatFunc: (level: string, extension: string | null, msg: any) => {
    return `${level} ${extension ? `.${extension}` : ''}: ${msg}`;
  },
};

export const createLogger = (prefix: string | null = null) => {
  return logger.createLogger({
    ...config,
    formatFunc: (level: string, msg: any) => {
      const dateTxt = `[${new Date().toLocaleTimeString()}]`;
      return `${dateTxt}${prefix ? `[${prefix}]` : ''}[${level}] ${msg}`;
    },
  });
};
