import express from 'express';
import { user } from '../../controllers';
import {
  uploadUtilUser,
  S3_USER_VOICEMAIL_RECORDING_KEY_FOLDER
} from '../../utils';

const settingsRouter = express.Router();

settingsRouter.put('/notifications', user.settings.notifications);

settingsRouter.put(
  '/custom-voicemail-recording',
  uploadUtilUser(S3_USER_VOICEMAIL_RECORDING_KEY_FOLDER).single(
    'voicemailRecording'
  ),
  user.settings.updateVoicemailRecording
);

export default settingsRouter;
