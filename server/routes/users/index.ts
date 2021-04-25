import express from 'express';
import asyncHandler from 'express-async-handler';
import { TWILIO_NUM } from '../../config';
import onboarding from './onboarding';
import recents from './recents';
import contacts from './contacts';
import device from './device';
import robocalls from './robocalls';
import settingsController from './settings';
import voicemails from './voicemails';
import callFeedback from './callFeedback';
import iap from './iap';
import { count, findById, repositories } from '../../database/helpers';
import { Calls, Users } from '../../database/entities';
import { getRepository } from 'typeorm';

const userRouter = express.Router();

userRouter.use((req, res, next) => {
  if (!req.session.id) return res.sendStatus(401);
  next();
});

userRouter.get('/phone-number', (req, res) => {
  return res.status(200).json({ phoneNum: TWILIO_NUM });
});

userRouter.get(
  '/init',
  asyncHandler(async (req, res, next) => {
    const blockedCalls = await count(Calls, {
      userId: req.session.id,
      failedPrompt: true
    });
    const [userRepo, user]: [repositories, Users] = await findById(
      Users,
      req.session.id!
    );
    if (!user) return res.sendStatus(401);

    // Get the highest version by platform (accounts for app distribution time)
    const newestAppVersion = await getRepository(Users).query(`
      SELECT DISTINCT "appVersion"
      FROM users
      WHERE "appVersion" IS NOT NULL
      AND "platform" = '${user.platform}'
      ORDER BY "appVersion" DESC
      LIMIT 1
    `);

    const {
      settings,
      carrier,
      deviceInfo,
      appVersion,
      codePushVersion,
      firstName,
      lastName,
      email,
      id
    } = user;
    return res.status(200).json({
      id,
      firstName,
      lastName,
      email,
      blockedCalls,
      settings,
      carrier,
      deviceInfo,
      appVersion,
      codePushVersion,
      newestAppVersion: newestAppVersion[0].appVersion
    });
  })
);

userRouter.use('/settings', settingsController);
userRouter.use('/call-feedback', callFeedback);
userRouter.use('/onboarding', onboarding);
userRouter.use('/recents', recents);
userRouter.use('/contacts', contacts);
userRouter.use('/devices', device);
userRouter.use('/voicemails', voicemails);
userRouter.use('/iap', iap);
userRouter.use('/robocalls', robocalls);

export default userRouter;
