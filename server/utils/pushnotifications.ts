import PushNotifications from 'node-pushnotifications';
import {
  APPLE_BUNDLE_ID_STRING,
  APN_KEY,
  APN_KEY_ID,
  APPLE_DEV_TEAM_ID,
  FIREBASE_SERVER_KEY,
  IS_PRODUCTION
} from '../config';

// missing type in types but located in docs
interface ExtendedPushOptions extends PushNotifications.Data {
  pushType?: string;
}
interface DeviceToken {
  appleDeviceToken?: string;
  androidDeviceToken?: string;
}
const pushNotification = async (
  { appleDeviceToken, androidDeviceToken }: DeviceToken,
  data: PushNotifications.Data
) => {
  if (androidDeviceToken) {
    const settings = {
      gcm: {
        id: FIREBASE_SERVER_KEY
      }
    };
    const push = new PushNotifications(settings);
    const pushedNotification = await push.send(androidDeviceToken, data);
    if (pushedNotification[0].failure) {
      return false;
    }
    return true;
  }
  if (appleDeviceToken) {
    const settings = {
      apn: {
        token: {
          key: APN_KEY,
          keyId: APN_KEY_ID,
          teamId: APPLE_DEV_TEAM_ID
        },
        production: IS_PRODUCTION
      }
    };
    const push = new PushNotifications(settings);
    const applePushData: ExtendedPushOptions = {
      ...data,
      topic: APPLE_BUNDLE_ID_STRING,
      pushType: 'alert'
    };
    const pushedNotification = await push.send(appleDeviceToken, applePushData);
    if (pushedNotification[0].failure) {
      return false;
    }
    return true;
  }
};

export { pushNotification };
