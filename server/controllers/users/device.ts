import { isEmpty } from 'lodash';
import asyncHandler from 'express-async-handler';
import { Users } from '../../database/entities';
import { findById, save, repositories } from '../../database/helpers';

const deviceToken = asyncHandler(async (req, res, next) => {
  if (!req.body.token) return res.sendStatus(400);
  const [userRepo, user]: [repositories, Users] = await findById(
    Users,
    req.session.id!
  );
  if (user) {
    if (user.platform === 'ios') {
      user.appleDeviceToken = req.body.token;
      await save(userRepo, user);
    } else {
      user.androidDeviceToken = req.body.token;
      await save(userRepo, user);
    }
    return res.sendStatus(200);
  }
  return res.sendStatus(401);
});

const syncUserMetadata = asyncHandler(async (req, res, next) => {
  const { carrier, appVersion, deviceInfo, codePushVersion } = req.body;
  const [userRepo, user]: [repositories, Users] = await findById(
    Users,
    req.session.id!
  );
  if (user) {
    // Only update the values that were sent (have changed)
    if (carrier) user.carrier = carrier;
    if (appVersion) user.appVersion = appVersion;
    if (!isEmpty(deviceInfo)) user.deviceInfo = deviceInfo;
    if (codePushVersion) user.codePushVersion = codePushVersion;
    await save(userRepo, user);
    return res.sendStatus(200);
  }
  return res.sendStatus(401);
});

export { deviceToken, syncUserMetadata };
