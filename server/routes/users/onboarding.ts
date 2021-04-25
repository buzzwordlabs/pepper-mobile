import express from 'express';
import { user } from '../../controllers';

const onboardingRouter = express.Router();

onboardingRouter.get('/step', user.onboarding.getCurrentStep);

onboardingRouter.post('/step', user.onboarding.stepChange);

// send phone number to Twilio to verify
onboardingRouter.post('/phone-input', user.onboarding.phoneInput);

// verify user code sent by Twilio
onboardingRouter.post('/phone-verify', user.onboarding.phoneVerify);

export default onboardingRouter;
