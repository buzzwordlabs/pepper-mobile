import asyncHandler from 'express-async-handler';
import { Calls, Users } from '../../database/entities';
import { findById, repositories, findOne, save } from '../../database/helpers';
import { twilioClient, sendEmail, extractUserInfo } from '../../utils';

const addFeedback = asyncHandler(async (req, res, next) => {
  if (!req.body.callSid) return res.sendStatus(400);
  const fetchedCall = await twilioClient.calls(req.body.callSid).fetch();
  const { parentCallSid } = fetchedCall;
  if (!req.body.callQuality) return res.sendStatus(400);
  if (!parentCallSid) return res.sendStatus(400);

  const [usersRepo, user]: [repositories, Users] = await findById(
    Users,
    req.session.id!
  );
  if (!user) return res.sendStatus(401);

  const [callRepo, call]: [repositories, Calls] = await findOne(Calls, {
    callSid: parentCallSid
  });

  if (!call) return res.sendStatus(400);

  call.callQuality = req.body.callQuality;
  if (req.body.callQualityDescription)
    call.callQualityDescription = req.body.callQualityDescription;
  await save(callRepo, call);
  if (req.body.callQuality === 'robocall') {
    await sendEmail({
      subject: 'Potential Robocall Breach',
      html: `
        ${extractUserInfo(user)}<br/><br/>
        Call Id: ${call.id}<br/><br/>
        Call Sid: ${call.callSid}<br/><br/>
      `
    });
  }
  return res.sendStatus(200);
});

export { addFeedback };
