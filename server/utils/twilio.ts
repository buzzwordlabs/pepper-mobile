import Twilio from 'twilio';
import { TWILIO_AUTH_TOKEN, TWILIO_SID } from '../config';

const twilioClient = new (Twilio as any)(TWILIO_SID, TWILIO_AUTH_TOKEN);

export default twilioClient;
