import asyncHandler from 'express-async-handler';
import bcrypt from 'bcrypt';
import { Users } from '../../database/entities';
import { isEmail, normalizeEmail } from 'validator';
import { findOne, save, repositories } from '../../database/helpers';
import { sendEmail } from '../../utils';

const sendResetPasswordEmail = async (token: number, email: string) => {
  const mailOptions = {
    to: email,
    subject: 'Pepper - Reset Password',
    html:
      `If you requested a password reset for your account, please enter the six-digit code below.<br/><br/>` +
      `This will expire in 5 minutes.<br/><br/>` +
      `${token}<br/><br/>` +
      `If you did not request this, please ignore this email and your password will remain unchanged.`
  };
  return sendEmail(mailOptions);
};

const passwordResetEmail = asyncHandler(async (req, res, next) => {
  if (!isEmail(req.body.email)) {
    return res.sendStatus(400);
  }
  const [userRepo, user]: [repositories, Users] = await findOne(Users, {
    email: normalizeEmail(req.body.email)
  });
  if (user) {
    const token = Math.floor(Math.random() * (999999 - 100000 + 1) + 100000);
    user.resetPasswordToken = token;
    user.resetPasswordExpires = new Date(Date.now() + 60 * 5000);
    await save(userRepo, user);
    await sendResetPasswordEmail(
      token,
      normalizeEmail(req.body.email) as string
    );
    return res.sendStatus(200);
  }
  return res.sendStatus(401);
});

const passwordResetToken = asyncHandler(async (req, res, next) => {
  if (!req.body.token) {
    return res.sendStatus(400);
  }
  const [userRepo, user]: [repositories, Users] = await findOne(Users, {
    resetPasswordToken: req.body.token
  });
  if (user) {
    if (new Date(user.resetPasswordExpires) < new Date()) {
      return res.sendStatus(401);
    }
    return res.sendStatus(200);
  }
  return res.sendStatus(401);
});

const passwordReset = asyncHandler(async (req, res, next) => {
  if (!req.body.token || !req.body.password) {
    return res.sendStatus(400);
  }
  const [userRepo, user] = await findOne(Users, {
    resetPasswordToken: req.body.token
  });
  if (user) {
    if (new Date(user.resetPasswordExpires) < new Date()) {
      user.resetPasswordToken = null;
      user.resetPasswordExpires = null;
      await save(userRepo, user);
      return res.sendStatus(401);
    }
    const hash = await bcrypt.hash(req.body.password, 12);
    if (hash) {
      user.password = hash;
      user.resetPasswordToken = null;
      user.resetPasswordExpires = null;
      await save(userRepo, user);
      return res.sendStatus(200);
    }
    throw new Error('bcrypt on password reset token broken');
  } else {
    return res.sendStatus(401);
  }
});

export { passwordResetEmail, passwordResetToken, passwordReset };
