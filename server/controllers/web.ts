import { NextFunction, Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { analytics } from '../utils';
import { isEmpty } from 'lodash';

const refVisitor = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    if (isEmpty(req.query.ref)) return res.sendStatus(400);
    else analytics.event('Ref Visit', `${req.query.ref}`).send();
    return res.sendStatus(200);
  }
);

export { refVisitor };
