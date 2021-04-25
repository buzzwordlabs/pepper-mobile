import asyncHandler from 'express-async-handler';
import axios from 'axios';
import validator from 'validator';
import { Request, Response, NextFunction } from 'express';
import { Users } from '../database/entities';
import { findById, repositories } from '../database/helpers';
import {
  RECAPTCHA_SECRETKEY,
  IS_PRODUCTION,
  TRELLO_SUPPORT_TICKET_LIST_ID
} from '../config';
import { sendEmail, trello } from '../utils';

const sendContactEmailMobile = asyncHandler(async (req, res, next) => {
  if (
    !req.session.id ||
    !req.body.message ||
    !req.body.reason ||
    !req.body.platform ||
    !req.body.appVersion ||
    !req.body.deviceInfo ||
    !req.body.carrier
  )
    return res.sendStatus(401);
  const [userRepo, user]: [repositories, Users] = await findById(
    Users,
    req.session.id
  );
  if (!user) return res.sendStatus(400);

  const emailResponse = await sendEmail({
    subject: `Pepper ${req.body.reason}`,
    html: `
      Message from: ${user.firstName} ${user.lastName}<br></br>
      UserId: ${user.id}<br></br>
      Email: ${user.email}<br></br>
      Phone Number: ${user.phoneNum}<br></br>
      Platform: ${req.body.platform}<br></br>
      App Version: ${req.body.appVersion}<br></br>
      Carrier: ${req.body.carrier}<br></br>
      Device Info: ${JSON.stringify(req.body.deviceInfo, null, 2)}<br></br>
      Message: ${req.body.message}
    `
  });
  if (IS_PRODUCTION) {
    await trello.card.create({
      name: `${user.firstName} ${user.lastName} ${req.body.reason}`,
      desc: `
    Message from: ${user.firstName} ${user.lastName}
    UserId: ${user.id}
    Email: ${user.email}
    Phone Number: ${user.phoneNum}
    Platform: ${req.body.platform}
    App Version: ${req.body.appVersion}
    Carrier: ${req.body.carrier}
    Device Info: ${JSON.stringify(req.body.deviceInfo)}
    Message: ${req.body.message}
    `,
      pos: 'top',
      idList: TRELLO_SUPPORT_TICKET_LIST_ID
    });
  }
  if (emailResponse instanceof Error) {
    return next(emailResponse);
  }
  return res.sendStatus(200);
});

const sendContactEmailWeb = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    if (
      !req.body.name ||
      !req.body.email ||
      !validator.isEmail(req.body.email)
    ) {
      return res.sendStatus(400);
    }
    const emailResponse = await sendEmail({
      subject: 'Pepper Web Contact Form',
      html: `
      Message from: ${req.body.name}<br></br>
      Email: ${req.body.email}<br></br> 
      Message: ${req.body.message}
    `
    });
    if (emailResponse instanceof Error) {
      return next(emailResponse);
    }
    return res.sendStatus(200);
  }
);

const verifyRecaptcha = asyncHandler(async (req, res, next) => {
  if (!req.body.recaptcha) {
    return res.sendStatus(400);
  }
  const response = await axios.post(
    `https://www.google.com/recaptcha/api/siteverify?secret=${RECAPTCHA_SECRETKEY}&response=${req.body.recaptcha}`
  );
  res.send(response.data);
});

export {
  sendContactEmailMobile,
  sendContactEmailWeb,
  verifyRecaptcha,
  sendEmail
};
