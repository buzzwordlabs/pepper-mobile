import asyncHandler from 'express-async-handler';
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import { Users } from '../../database/entities';
import { findById, save, count, repositories } from '../../database/helpers';
import { analytics, logger, sendText } from '../../utils';
import { random } from 'lodash';

const getCurrentStep = asyncHandler(async (req, res, next) => {
  const [userRepo, user]: [repositories, Users] = await findById(
    Users,
    req.session.id!
  );
  return res.status(200).json({ onboardingStep: user.onboardingStep });
});

const stepChange = asyncHandler(async (req, res, next) => {
  const { onboardingStep }: { onboardingStep: number } = req.body;
  if (onboardingStep === null || onboardingStep === undefined)
    return res.sendStatus(400);
  const [userRepo, user]: [repositories, Users] = await findById(
    Users,
    req.session.id!
  );
  if (user) {
    user.onboardingStep = onboardingStep;
    logger.info('ONBOARDING STEP: ' + onboardingStep);
    await save(userRepo, user);
    if (onboardingStep === 0) {
      analytics.event('Onboarding', 'Completed Onboarding').send();
    }
    return res.sendStatus(200);
  }
  return res.sendStatus(401);
});

// send phone number to Twilio to verify
const phoneInput = asyncHandler(async (req, res, next) => {
  if (!req.body.phone) {
    return res.sendStatus(400);
  }
  const phoneNumber = parsePhoneNumberFromString(req.body.phone);
  if (!phoneNumber || phoneNumber.country !== 'US' || !phoneNumber.isValid()) {
    return res.sendStatus(400);
  }
  const existingNumber = await count(Users, {
    phoneNum: phoneNumber.number
  });
  if (existingNumber > 0) {
    return res.sendStatus(409);
  }
  const code = random(100000, 999999);
  const [userRepo, user]: [repositories, Users] = await findById(
    Users,
    req.session.id!
  );
  user.phoneNumVerifyCode = code;
  user.phoneNumVerifyCodeExpires = new Date(Date.now() + 60 * 2000);
  await save(userRepo, user);
  await sendText({
    body: `Your Pepper six-digit code is: ${code}`,
    to: phoneNumber.number as string
  });
  return res.sendStatus(200);
});

// verify user code sent by Twilio
const phoneVerify = asyncHandler(async (req, res, next) => {
  if (!req.body.phone || !req.body.code) {
    return res.sendStatus(400);
  }
  const phoneNumber = parsePhoneNumberFromString(req.body.phone);
  if (!phoneNumber || phoneNumber.country !== 'US' || !phoneNumber.isValid()) {
    return res.sendStatus(400);
  }
  const existingNumber = await count(Users, {
    phoneNum: phoneNumber.number
  });
  if (existingNumber > 0) {
    return res.sendStatus(409);
  }
  const [userRepo, user] = await findById(Users, req.session.id!);
  if (
    user.phoneNumVerifyCode !== Number(req.body.code) ||
    new Date(user.phoneNumVerifyCodeExpires) < new Date()
  ) {
    return res.sendStatus(400);
  }
  user.phoneNum = phoneNumber.number as string;
  user.phoneNumVerifyCode = null;
  user.phoneNumVerifyCodeExpires = null;
  await save(userRepo, user);
  analytics.event('Onboarding', 'Completed Phone Verification').send();
  return res.sendStatus(200);
});

export { getCurrentStep, stepChange, phoneInput, phoneVerify };
