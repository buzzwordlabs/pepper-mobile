import winston from 'winston';
import { IS_PRODUCTION } from '../config';

winston.configure({
  transports: [
    new winston.transports.Console({
      format: !IS_PRODUCTION
        ? winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
          )
        : winston.format.simple(),
      level: 'silly'
    })
  ]
});

const error = (err: any) => {
  winston.error(err.stack || err.message || err);
};

const warn = (warning: any) => {
  winston.warn(warning.stack || warning.message || warning);
};

const info = (information: any) => {
  winston.info(information.stack || information.message || information);
};

export { error, warn, info };
