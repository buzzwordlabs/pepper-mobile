import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });
import express, { Request, Response, NextFunction } from 'express';

import compression from 'compression';
import 'reflect-metadata';
import { createConnection } from 'typeorm';
import helmet from 'helmet';
import morgan from 'morgan';
import cors from 'cors';
import sslRedirect from 'heroku-ssl-redirect';
import { logger, jwt, sendEmail, trello } from './utils';
import {
  NODE_ENV,
  PORT,
  IS_PRODUCTION,
  TRELLO_TECHNICAL_ISSUE_LIST_ID
} from './config';
import { call, auth, user, contact, faq, web, retool } from './routes';
import {
  validateAllSubscriptionsCron,
  subscriptionExpiringSoonCron
} from './scripts/crons';

createConnection().catch((err: Error) => {
  console.log('DB Connection Error: ', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error(`Unhandled Rejection at:', ${promise}\n, 'reason:', ${reason}`);
  process.exit(1);
});

process.on('uncaughtException', (err: Error) => {
  console.error(`Caught Exception ${err}\n`);
  process.exit(1);
});

const app = express();
app.use(cors());
app.set('trust proxy', 1);
app.use(sslRedirect());
app.use(compression());
app.use(
  express.urlencoded({
    extended: true,
    limit: '25mb'
  })
);
app.use(express.json({ limit: '25mb' }));
app.use(helmet());
morgan.token('user-id', req => req.session.id!);
morgan.token('call-id', req => req.callId!);
app.use(
  morgan(
    NODE_ENV !== 'production'
      ? 'dev'
      : ':user-id :call-id :remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :response-time ms :res[content-length] ":referrer" ":user-agent"'
  )
);

validateAllSubscriptionsCron();
subscriptionExpiringSoonCron();

app.use(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const header = req.headers.authorization;
    const token = header ? header.split(' ')[1] : '';
    const verifiedToken = await jwt.verify(token);
    req.session = { id: verifiedToken.id };
    next();
  } catch (err) {
    req.session = {};
    next();
  }
});

app.use('/call', call);
app.use('/auth', auth);
app.use('/user', user);
app.use('/contact', contact);
app.use('/faq', faq);
app.use('/web', web);
app.use('/retool', retool);

app.listen(PORT || 8000, () => {
  if (NODE_ENV !== 'production') {
    logger.info(`Listening on PORT ${PORT || 8000}...`);
  }
});
// error handler, express expects 4 parameters
app.use(async (err: Error, req: Request, res: Response, next: NextFunction) => {
  try {
    res.sendStatus(500);
    logger.error(err);
    if (IS_PRODUCTION) {
      await trello.card.create({
        name: 'Express Server Error Handler',
        desc: `${err.stack || err.message || err}`,
        pos: 'top',
        idList: TRELLO_TECHNICAL_ISSUE_LIST_ID
      });
    }
    return sendEmail({
      subject: 'Express Server Error Handler',
      html: `Error at Express server:\n\n${err.stack || err.message || err}`
    });
  } catch (err) {
    logger.error('EXPRESS ERROR HANDLER FAILURE');
    logger.error(err);
  }
});
