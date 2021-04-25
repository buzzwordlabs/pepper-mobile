import {Linking, Platform} from 'react-native';

const redirectTOS = (): void => {
  Linking.openURL('https://callpepper.co/#/terms-of-service');
};

const redirectPrivacyPolicy = (): void => {
  Linking.openURL('https://callpepper.co/#/privacy-policy');
};

const sendCall = (recipient: string): void => {
  Linking.openURL(`tel:${encodeURIComponent(recipient)}`);
};

const redirectAppStore = () => {
  return Linking.openURL(
    Platform.select({
      ios: 'https://apps.apple.com/us/app/pepper-robocall-blocker/id1487400263',
      android:
        'https://play.google.com/store/apps/details?id=com.buzzwordlabs.pepper',
    }),
  );
};

const redirectSettings = () => {
  Linking.openSettings();
};

export {
  redirectPrivacyPolicy,
  redirectTOS,
  sendCall,
  redirectSettings,
  redirectAppStore,
};
