import asyncHandler from 'express-async-handler';
import { Calls, Users } from '../../database/entities';
import {
  find,
  repositories,
  findById,
  save,
  findOne
} from '../../database/helpers';
import { UNKNOWN_NUMBERS } from '../../config';
import { sendEmail, extractUserInfo } from '../../utils';

const getRecentCalls = asyncHandler(async (req, res, next) => {
  const [callRepo, recentCalls]: [repositories, Calls[]] = await find(Calls, {
    select: [
      'callSid',
      'createdAt',
      'caller',
      'dialCallStatus',
      'failedPrompt',
      'callQuality',
      'updatedAt'
    ],
    where: {
      userId: req.session.id
    },
    order: {
      createdAt: 'DESC'
    },
    take: 30
  });
  recentCalls.map(
    recentCall =>
      (recentCall.caller =
        UNKNOWN_NUMBERS[recentCall.caller] || recentCall.caller)
  );
  return res.status(200).json({ recentCalls });
});

const reportProblem = asyncHandler(async (req, res, next) => {
  if (!req.session.id) res.sendStatus(401);
  const [usersRepo, user]: [repositories, Users] = await findById(
    Users,
    req.session.id!
  );
  if (!user) return res.sendStatus(400);
  if (!req.body.callSid || !req.body.description) return res.sendStatus(400);
  const [callRepo, call]: [repositories, Calls] = await findOne(Calls, {
    callSid: req.body.callSid
  });
  // Hardcoded values for now
  call.callQuality = 'bad';
  call.callQualityDescription = req.body.description;
  await save(callRepo, call);
  const userInfoHTML = extractUserInfo(user);
  await sendEmail({
    subject: 'Call Problem Reported',
    html: `
      ${userInfoHTML}<br/><br/>
      Call Sid: ${req.body.callSid}<br/><br/>
      Problem Description: ${req.body.description}<br/><br/>
    `
  });
  return res.sendStatus(200);
});

export { getRecentCalls, reportProblem };
