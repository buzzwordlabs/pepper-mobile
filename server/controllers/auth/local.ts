import asyncHandler from 'express-async-handler';
import bcrypt from 'bcrypt';
import { isEmail, normalizeEmail } from 'validator';
import { trim } from 'lodash';
import { Response, Request, NextFunction } from 'express';
import { Users } from '../../database/entities';
import { create, findOne, save, repositories } from '../../database/helpers';
import { logger, analytics, jwt } from '../../utils';

const signup = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (
      !isEmail(req.body.email) ||
      !req.body.password ||
      !req.body.firstName ||
      !req.body.lastName ||
      !req.body.platform ||
      !req.body.appVersion ||
      !req.body.deviceInfo ||
      !req.body.carrier
    ) {
      return res.sendStatus(400);
    }
    const hash = await bcrypt.hash(req.body.password, 12);
    if (hash) {
      const initSettings = {
        robocallPN: false
      };
      const userObj = {
        email: normalizeEmail(req.body.email),
        password: hash,
        firstName: trim(req.body.firstName),
        lastName: trim(req.body.lastName),
        onboardingStep: 1,
        platform: req.body.platform,
        deviceInfo: req.body.deviceInfo,
        appVersion: trim(req.body.appVersion),
        carrier: trim(req.body.carrier),
        settings: initSettings
      };
      const newUser = await create(Users, userObj);
      analytics.event('User', 'Signed Up').send();
      const newJWT = await jwt.create(newUser.id, newUser.onboardingStep);
      return res.status(200).json({
        token: newJWT,
        firstName: newUser.firstName,
        onboardingStep: newUser.onboardingStep
      });
    }
    throw new Error('bcrypt hash on signup broken');
  } catch (err) {
    const POSTGRES_DUP_ENTRY_ERROR_CODE = '23505';
    if (err.code === POSTGRES_DUP_ENTRY_ERROR_CODE) {
      logger.warn(err);
      return res.sendStatus(409);
    }
    next(err);
  }
};

const login = asyncHandler(async (req, res, next) => {
  if (!isEmail(req.body.email) || !req.body.password || !req.body.platform) {
    return res.sendStatus(400);
  }
  const [userRepo, user]: [repositories, Users] = await findOne(Users, {
    email: normalizeEmail(req.body.email)
  });
  if (user) {
    const hash = await bcrypt.compare(req.body.password, user.password);
    if (!hash) return res.sendStatus(401);
    analytics.event('User', 'Logged In').send();
    if (!user.platform) user.platform = req.body.platform;
    await save(userRepo, user);
    const newJWT = await jwt.create(user.id, user.onboardingStep);
    return res.status(200).json({
      token: newJWT,
      firstName: user.firstName,
      onboardingStep: user.onboardingStep
    });
  }
  return res.sendStatus(401);
});

export { signup, login };
