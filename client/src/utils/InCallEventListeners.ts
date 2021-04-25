import RNCallKeep, {
  SupportsVideo,
  MaximumCallGroups,
  MaximumCallsPerCallGroup,
} from 'react-native-callkeep';
import {Platform, AppState} from 'react-native';
import TwilioVoice from 'react-native-twilio-programmable-voice';
import {bugsnag} from '../utils/bugsnag';

export const twilioReceiveIncoming = (data: any) => {
  if (data && data.call_state === 'PENDING') {
    const callFrom = data.call_from.split('client:').pop();
    bugsnag.leaveBreadcrumb(`run displayIncomingCall()`, {
      file: 'InCallEventListeners.ts',
    });
    RNCallKeep.displayIncomingCall(data.call_sid, callFrom || data.call_from);
  }
};

export const twilioConnectionDidConnect = (data: any) => {
  if (Platform.OS === 'android') {
    bugsnag.leaveBreadcrumb(`run setCurrentCallActive()`, {
      file: 'InCallEventListeners.ts',
    });
    RNCallKeep.setCurrentCallActive(data.call_sid);
  }
};

export const twilioConnectionDidDisconnect = (data: any) => {
  if (Platform.OS === 'android') {
    bugsnag.leaveBreadcrumb(`run endCall()`, {
      file: 'InCallEventListeners.ts',
    });
    RNCallKeep.endCall(data.call_sid);
  } else {
    bugsnag.leaveBreadcrumb(`run disconnect()`, {
      file: 'InCallEventListeners.ts',
    });
    TwilioVoice.disconnect();
  }
};

export const CKOnAnswerCallAction = (data: any) => {
  bugsnag.leaveBreadcrumb(`run accept()`, {
    file: 'InCallEventListeners.ts',
  });
  TwilioVoice.accept();
};

export const CKOnEndCallAction = (data: any) => {
  bugsnag.leaveBreadcrumb(`run reject()`, {
    file: 'InCallEventListeners.ts',
  });
  TwilioVoice.reject();
  bugsnag.leaveBreadcrumb(`run disconnect()`, {
    file: 'InCallEventListeners.ts',
  });
  TwilioVoice.disconnect();
};

export const CKOnToggleMute = (data: any) => {
  const {muted} = data;
  bugsnag.leaveBreadcrumb(`run setMuted()`, {
    file: 'InCallEventListeners.ts',
  });
  TwilioVoice.setMuted(muted);
};

export const CKOnDTMFAction = (data: any) => {
  const {digits} = data;
  bugsnag.leaveBreadcrumb(`run sendDigits()`, {
    file: 'InCallEventListeners.ts',
  });
  TwilioVoice.sendDigits(digits);
};

export const addEventListeners = () => {
  if (Platform.OS === 'android') {
    if (AppState.currentState === 'active') {
      TwilioVoice.addEventListener(
        'deviceDidReceiveIncoming',
        twilioReceiveIncoming,
      );
    } else {
      TwilioVoice.addEventListener(
        'connectionDidConnect',
        twilioConnectionDidConnect,
      );
      TwilioVoice.addEventListener(
        'connectionDidDisconnect',
        twilioConnectionDidDisconnect,
      );
    }
    // Add RNCallKeep Events
    RNCallKeep.addEventListener('answerCall', CKOnAnswerCallAction);
    RNCallKeep.addEventListener('endCall', CKOnEndCallAction);
    RNCallKeep.addEventListener('didPerformSetMutedCallAction', CKOnToggleMute);
    RNCallKeep.addEventListener('didPerformDTMFAction', CKOnDTMFAction);
  }
};

export const removeEventListeners = () => {
  if (Platform.OS === 'android') {
    TwilioVoice.removeEventListener(
      'deviceDidReceiveIncoming',
      twilioReceiveIncoming,
    );
    // need to remove these listeners on Android whenever call goes into the background
    TwilioVoice.removeEventListener(
      'connectionDidConnect',
      twilioConnectionDidConnect,
    );
    TwilioVoice.removeEventListener(
      'connectionDidDisconnect',
      twilioConnectionDidDisconnect,
    );
    // Remove RNCallKeep Events
    RNCallKeep.removeEventListener('answerCall', CKOnAnswerCallAction);
    RNCallKeep.removeEventListener('endCall', CKOnEndCallAction);
    RNCallKeep.removeEventListener(
      'didPerformSetMutedCallAction',
      CKOnToggleMute,
    );
    RNCallKeep.removeEventListener('didPerformDTMFAction', CKOnDTMFAction);
  }
};

export const RNCallKeepOptions = {
  ios: {
    appName: 'Pepper',
    imageName: 'sim_icon',
    supportsVideo: false as SupportsVideo,
    maximumCallGroups: '1' as MaximumCallGroups,
    maximumCallsPerCallGroup: '1' as MaximumCallsPerCallGroup,
  },
  android: {
    alertTitle: 'IMPORTANT',
    alertDescription:
      'On the following screen, please select "All Calling Accounts" and turn Pepper on. You will not receive calls properly without it.',
    cancelButton: 'Cancel',
    okButton: 'ok',
    imageName: 'sim_icon',
    additionalPermissions: [],
  },
};

export const callkeepSetup = () => {
  const options = RNCallKeepOptions;
  try {
    RNCallKeep.setup(options);
    RNCallKeep.setAvailable(true);
  } catch (err) {
    console.error('initializeCallKeep error:', err.message);
  }
};
