import {
  getCarrier,
  getModel,
  getSystemName,
  getSystemVersion,
  getVersion,
} from 'react-native-device-info';
import codePush from 'react-native-code-push';

const getUserMetadata = async () => {
  const carrier = await getCarrier();
  const appVersion = getVersion();
  const codePushMetadata = await codePush.getUpdateMetadata();
  const codePushVersion = codePushMetadata && codePushMetadata.label;
  const deviceInfo = {
    phoneModel: getModel(),
    systemName: getSystemName(),
    systemVersion: getSystemVersion(),
  };
  return {carrier, appVersion, deviceInfo, codePushVersion};
};

export {getUserMetadata};
