/* eslint-disable no-console */

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

export type Logger = Record<LogTypes, (...args: any[]) => void>;

export const createLogger = (
  prefix: string | null = null,
  disabled: LogTypes[] = [],
) => {
  const prefixTxt = prefix && prefix.length > 0 ? `[${prefix}]` : '';

  const result: Logger = {} as Logger;

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
};
