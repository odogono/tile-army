/* eslint-disable no-console */
// import RNFS from 'expo-file-system';
// import {
//   consoleTransport,
//   fileAsyncTransport,
//   logger,
// } from 'react-native-logs';

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
type LogTypes =
  | 'assert'
  | 'log'
  | 'debug'
  | 'info'
  | 'warn'
  | 'error'
  | 'dir'
  | 'group'
  | 'groupCollapsed'
  | 'groupEnd'
  | 'table';

const logTypes: LogTypes[] = [
  'assert',
  'log',
  'debug',
  'info',
  'warn',
  'error',
  'dir',
  'table',
  'group',
  'groupCollapsed',
  'groupEnd',
];

const ignorePrefixTypes = ['group', 'groupCollapsed', 'groupEnd', 'table'];

export const createLogger = (
  prefix: string | null = null,
  disabled: LogTypes[] = [],
) => {
  const prefixTxt = prefix && prefix.length > 0 ? `[${prefix}]` : '';

  const result: Partial<Record<LogTypes, (...args: any[]) => void>> = {};

  for (const logType of logTypes) {
    result[logType] = (...args: any[]) => {
      if (!disabled.includes(logType)) {
        if (logType === 'assert') {
          const assertion = args[0];
          const rest = args.slice(1);
          console.assert(assertion, [prefixTxt, ...rest].join(' '));
        } else if (ignorePrefixTypes.includes(logType)) {
          console[logType](...args);
        } else {
          console[logType](...[prefixTxt, ...args]);
        }
      }
    };
  }

  if (disabled.length > 0) {
    // console.warn(`[${prefix}] some logs are disabled: ${disabled.join(', ')}`);
  }

  return result;
  //   log: (...args: any[]) => console.log(prefixTxt, ...args),
  //   debug: (...args: any[]) => console.debug(prefixTxt, ...args),
  //   info: (...args: any[]) => console.info(prefixTxt, ...args),
  //   warn: (...args: any[]) => console.warn(prefixTxt, ...args),
  //   error: (...args: any[]) => console.error(prefixTxt, ...args),
  // };

  // return logger.createLogger({
  //   ...config,
  //   formatFunc: (level: string, _extension: string | null, msg: any) => {
  //     const dateTxt = `[${new Date().toLocaleTimeString()}]`;
  //     return `${dateTxt}${prefix ? `[${prefix}]` : ''}[${level}] ${msg}`;
  //   },
  // });
};
