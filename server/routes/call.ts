import express from 'express';

import Twilio from 'twilio';
import { IS_PRODUCTION } from '../config';
import { call } from '../controllers';

const callRouter = express.Router();

callRouter.get('/api/token', call.getAccessToken);

callRouter.post(
  '/api/index',
  Twilio.webhook({ validate: IS_PRODUCTION }),
  call.startCall
);

// Check if the number the caller pressed was a valid one
callRouter.post(
  '/api/gather',
  Twilio.webhook({ validate: IS_PRODUCTION }),
  call.gatherInfo
);

// Redirects caller to the receiver's app
callRouter.post(
  '/api/redirect',
  Twilio.webhook({ validate: IS_PRODUCTION }),
  call.redirectToUser
);

// Status callback after call
callRouter.post(
  '/api/postcallinfo',
  Twilio.webhook({ validate: IS_PRODUCTION }),
  call.postCallInfo
);

// Redirects to voicemail
callRouter.post(
  '/api/voicemail',
  Twilio.webhook({ validate: IS_PRODUCTION }),
  call.goToVoicemail
);

// Notifies user of voicemail
callRouter.post(
  '/api/recording',
  Twilio.webhook({ validate: IS_PRODUCTION }),
  call.notifyUserVoicemail
);

callRouter.post(
  '/api/hangup',
  Twilio.webhook({ validate: IS_PRODUCTION }),
  call.hangup
);

export default callRouter;
