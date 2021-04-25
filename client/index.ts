import 'react-native-gesture-handler';
import TrackPlayer from 'react-native-track-player';
import {AppRegistry, YellowBox, Platform} from 'react-native';
import RNCallKeep from 'react-native-callkeep';
import App from './src/App';
import {
  addEventListeners,
  removeEventListeners,
  RNCallKeepOptions,
} from './src/utils';

YellowBox.ignoreWarnings([
  'Require cycle: node_modules/react-native-paper',
  'Error: There was no active call',
  'Sending `onAnimatedValueUpdate`',
  '-[RCTRootView cancelTouches]`',
  'Warning',
  'Unable to open URL:',
  'Sending `CodePushDownloadProgress` with no listeners registered.',
  'Unable to find module for UIManager',
]);

AppRegistry.registerComponent('buzzwordlabs.pepper', () => App);
TrackPlayer.registerPlaybackService(() => require('./service.js'));
// android only
if (Platform.OS === 'android') {
  AppRegistry.registerHeadlessTask(
    'BackgroundCallTaskService',
    () => ({
      callState,
      callSid,
      handle,
    }: {
      callState: string;
      callSid: string;
      handle: string;
    }) => {
      if (callState === 'PENDING') {
        // Initialise RNCallKeep
        const options = RNCallKeepOptions;
        RNCallKeep.setup(options);
        RNCallKeep.setAvailable(true);

        removeEventListeners();

        addEventListeners();
        const handleTrimmed = handle.split('client:').pop();
        RNCallKeep.displayIncomingCall(
          callSid,
          handleTrimmed ? handleTrimmed : handle,
        );
      } else {
        removeEventListeners();
      }
      return Promise.resolve();
    },
  );
}
