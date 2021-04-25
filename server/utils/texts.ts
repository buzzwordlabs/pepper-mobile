import { IS_PRODUCTION, TWILIO_MESSAGING_SERVICE_SID } from '../config';
import { twilioClient, logger } from '.';

const sendText = async ({ body, to }: { body: string; to: string }) => {
  const textMessage = {
    body,
    messagingServiceSid: TWILIO_MESSAGING_SERVICE_SID,
    to
  };
  if (IS_PRODUCTION) {
    return twilioClient.messages.create(textMessage);
  } else {
    return logger.info(JSON.stringify(textMessage, null, 2));
  }
};

export { sendText };
