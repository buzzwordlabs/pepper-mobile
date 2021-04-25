import {
  Alert as DefaultAlert,
  Platform,
  AlertButton,
  AlertOptions,
} from 'react-native';

import {redirectSettings} from '../utils/linking';

interface Args {
  title: string;
  description: string;
  buttonOptions: AlertButton[];
}

const popup = ({title, description, buttonOptions}: Args) => {
  return DefaultAlert.alert(title, description, buttonOptions);
};

const popupPermissionsPrompt = () => {
  popup({
    title: 'Enable Permissions',
    description: Platform.select({
      ios:
        "Please enable contacts, notifications, and microphone permissions.\n\nPepper won't work without these.",
      android:
        "Please enable contacts, audio, and phone state permissions.\n\nPepper won't work without these.",
    }),
    buttonOptions: [{text: 'Allow', onPress: redirectSettings}],
  });
};

export {popup, popupPermissionsPrompt};
