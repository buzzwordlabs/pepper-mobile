import asyncHandler from 'express-async-handler';
import { Users } from '../../database/entities';
import { findById, save, repositories } from '../../database/helpers';
import { s3, S3_BUCKET } from '../../utils';

const notifications = asyncHandler(async (req, res, next) => {
  const [userRepo, user]: [repositories, Users] = await findById(
    Users,
    req.session.id!
  );
  if (user) {
    const bodyKeys = Object.keys(req.body);
    bodyKeys.map((bodyKey: string) => {
      // @ts-ignore
      if (!(user.settings[bodyKey] === undefined)) {
        // @ts-ignore
        user.settings[bodyKey] = req.body[bodyKey];
      }
    });
    await save(userRepo, user);
    return res.sendStatus(200);
  }
  return res.sendStatus(401);
});

const updateVoicemailRecording = asyncHandler(async (req, res, next) => {
  if (!req.file) return res.sendStatus(400);
  const [userRepo, user]: [repositories, Users] = await findById(
    Users,
    req.session.id!
  );
  if (user) {
    if (user.settings.voicemailGreeting) {
      const key = user.settings.voicemailGreeting
        .split('/')
        .reverse()
        .slice(0, 2)
        .reverse()
        .join('/');
      await s3
        .deleteObject({
          Bucket: S3_BUCKET,
          Key: key
        })
        .promise();
    }
    // @ts-ignore
    user.settings.voicemailGreeting = req.file.location;
    await save(userRepo, user);
    return res
      .status(200)
      .json({ voicemailGreeting: user.settings.voicemailGreeting });
  }
  return res.sendStatus(401);
});

export { notifications, updateVoicemailRecording };
