import Twilio from 'twilio';
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import encryptorModule from 'simple-encryptor';
import { Request, Response, NextFunction } from 'express';
import AccessTokenType from 'twilio/lib/jwt/AccessToken';
import asyncHandler from 'express-async-handler';
import axios from 'axios';
import path from 'path';
import { Users, Calls, Voicemails, Uglycalls } from '../database/entities';
import {
  findById,
  findOne,
  save,
  create,
  camelcaseTwilioData,
  deleteOneOrMany,
  repositories
} from '../database/helpers';
import {
  logger,
  pushNotification,
  phone,
  twilioClient,
  sendEmail,
  inWhitelist,
  s3,
  S3_BUCKET,
  S3_VOICEMAIL_KEY_FOLDER,
  trello,
  numberTurnOffForwarding,
  sendText
} from '../utils';
import { iap } from './users';
import {
  ENCRYPT_SECRET,
  SITE_URL,
  PEPPER_EMAIL_ADDRESS,
  TWILIO_SID,
  TWILIO_PEPPERMOBILE_API_KEY,
  TWILIO_PEPPERMOBILE_ANDROID_PUSH_CREDENTIAL_SID,
  TWILIO_PEPPERMOBILE_API_SECRET,
  TWILIO_PEPPERMOBILE_APP_SID,
  TWILIO_PEPPERMOBILE_IOS_PUSH_CREDENTIAL_SID,
  UNKNOWN_NUMBERS,
  IS_PRODUCTION,
  TRELLO_TECHNICAL_ISSUE_LIST_ID
} from '../config';
import { PlatformType, UserSettings } from '../database/entities/Users';
import { getRepository } from 'typeorm';

const { VoiceResponse } = Twilio.twiml;
const { AccessToken } = Twilio.jwt;
const { VoiceGrant } = AccessToken;
const encryptor = encryptorModule(ENCRYPT_SECRET!);
const TWILIO_RECORDING_TIMEOUT = 3;

const getAccessToken = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.session.id) return res.sendStatus(401);
    const [userRepo, user]: [repositories, Users] = await findById(
      Users,
      req.session.id
    );
    if (!user) return res.sendStatus(401);
    const { platform, phoneNum } = user;
    const identity = phoneNum.substring(1);
    const voiceGrant = new VoiceGrant({
      outgoingApplicationSid: TWILIO_PEPPERMOBILE_APP_SID,
      incomingAllow: true,
      pushCredentialSid:
        platform === 'ios'
          ? TWILIO_PEPPERMOBILE_IOS_PUSH_CREDENTIAL_SID
          : TWILIO_PEPPERMOBILE_ANDROID_PUSH_CREDENTIAL_SID
    });
    interface TwilioAccessToken extends AccessTokenType {
      identity?: string;
      ttl?: number;
    }
    const token: TwilioAccessToken = new AccessToken(
      TWILIO_SID!,
      TWILIO_PEPPERMOBILE_API_KEY!,
      TWILIO_PEPPERMOBILE_API_SECRET!
    );
    token.addGrant(voiceGrant);
    token.identity = identity;
    token.ttl = 3600 * 24; // 24 hours
    return res.status(200).json({ token: token.toJwt() }); // NOTE: if token is received with native code, send it directly with res.send instead of using json
  }
);

const startCall = async (req: Request, res: Response) => {
  try {
    const twiml = new VoiceResponse();
    const {
      ForwardedFrom,
      CalledVia,
      From,
      ToCountry
    }: {
      ForwardedFrom: string;
      CalledVia: string;
      From: string;
      ToCountry: string;
    } = req.body;
    if (!(ForwardedFrom || CalledVia)) {
      const uglyCallDocument = await create(
        Uglycalls,
        camelcaseTwilioData(req.body)
      );
      logger.info(`Call Not Forwarded: ${uglyCallDocument.id}`);
      twiml.reject();
      res.type('text/xml');
      return res.send(twiml.toString());
    }
    if (ToCountry !== 'US') {
      const uglyCallDocument = await create(
        Uglycalls,
        camelcaseTwilioData(req.body)
      );
      logger.info(
        `Call Not Received in the United States: ${uglyCallDocument.id}`
      );
      twiml.reject();
      res.type('text/xml');
      return res.send(twiml.toString());
    }
    const [userRepo, user]: [repositories, Users] = await findOne(Users, {
      phoneNum: ForwardedFrom || CalledVia
    });
    if (!user) {
      const uglyCallDocument = await create(
        Uglycalls,
        camelcaseTwilioData(req.body)
      );
      logger.info(`User Not Found: ${uglyCallDocument.id}`);
      twiml.reject();
      res.type('text/xml');
      return res.send(twiml.toString());
    }
    const {
      contacts,
      firstName,
      id,
      email,
      phoneNum,
      platform,
      settings,
      appleDeviceToken,
      androidDeviceToken,
      notSubscribedGracePeriod,
      carrier
    } = user;
    req.session.id = id;
    let familyName;
    let givenName;
    const contact = contacts[From];
    if (contact) {
      familyName = contact.familyName;
      givenName = contact.givenName;
    }
    const callerNum = parsePhoneNumberFromString(From);
    const callerId = phone.callerId(
      givenName,
      familyName,
      callerNum
        ? UNKNOWN_NUMBERS[callerNum.number as string] ||
            callerNum.formatInternational()
        : 'Unknown'
    );
    if (IS_PRODUCTION) {
      const [
        isSubscribed,
        isOnGracePeriod
      ] = await iap.checkUserSubscriptionOnGracePeriod(
        id,
        notSubscribedGracePeriod
      );
      if (!isSubscribed) {
        logger.info(`User Not Subscribed: ${id}`);
        if (!isOnGracePeriod) {
          logger.info(`User not on grace period: ${id}`);
          twiml.reject();
          res.type('text/xml');
          res.send(twiml.toString());
          await sendNotSubscribedText({
            firstName,
            phoneNum,
            carrier,
            caller: callerId
          });
          const callDocument: Calls = await create(Calls, {
            ...camelcaseTwilioData(req.body),
            incoming: true,
            userId: id,
            isSubscribed: false
          });
          req.callId = callDocument.id;
        }

        const wasPushed = await pushNotification(
          { androidDeviceToken, appleDeviceToken },
          {
            title: 'Pepper',
            body: `You are not subscribed - please resubscribe or turn off spam blocking in our app!${
              !isOnGracePeriod ? ` You have a missed call from ${callerId}` : ''
            }`
          }
        );
        if (wasPushed === false) {
          await sendAppNotInstalledText({
            firstName,
            phoneNum,
            carrier,
            caller: callerId
          });
          await sendAppNotInstalledEmail({
            firstName,
            email,
            missedCall: callerId,
            carrier,
            voicemail: undefined
          });
        }

        if (!isOnGracePeriod) {
          return sendNotSubscribedEmail({
            firstName,
            email,
            missedCall: callerId,
            carrier,
            isOnGracePeriod: isOnGracePeriod
          });
        } else {
          await sendNotSubscribedEmail({
            firstName,
            email,
            missedCall: callerId,
            carrier,
            isOnGracePeriod: isOnGracePeriod
          });
        }
      }
    }
    const callDocument: Calls = await create(Calls, {
      ...camelcaseTwilioData(req.body),
      incoming: true,
      userId: id
    });
    req.callId = callDocument.id;
    // Before answering the call, check if the receiver knows this number
    if (user.contacts[From] || user.safelist[From]) {
      callDocument.wasPrompted = false;
      await getRepository(Calls).save(callDocument);
      // If they do, redirect call to app
      const userInfo = {
        userId: id,
        callId: callDocument.id,
        firstName,
        phoneNum,
        userSettings: settings,
        email,
        platform,
        appleDeviceToken,
        androidDeviceToken,
        callerId,
        carrier
      };
      const encrypted = encryptor.encrypt(userInfo);
      const encoded = encodeURIComponent(encrypted);
      twiml.redirect({ method: 'POST' }, `/call/api/redirect?param=${encoded}`);
    } else {
      callDocument.wasPrompted = true;
      await getRepository(Calls).save(callDocument);
      // Ask the digital receptionist
      // generate random number for caller
      const randomNum = await randomNumGen();
      // Encrypt user data before sending it to next middleware
      const userInfo = {
        randomNum,
        userId: id,
        callId: callDocument.id,
        firstName,
        phoneNum,
        userSettings: settings,
        email,
        platform,
        appleDeviceToken,
        androidDeviceToken,
        callerId,
        carrier
      };
      const encrypted = encryptor.encrypt(userInfo);
      const encoded = encodeURIComponent(encrypted);

      // Prompt the caller for a number press, and send that info to a
      // middleware function to check if it's valid
      const gather = twiml.gather({
        numDigits: 1,
        timeout: 7,
        actionOnEmptyResult: true,
        action: `/call/api/gather?param=${encoded}`
      });
      gather.say(`Press the number ${randomNum} to get connected.`);
    }

    // Render the res as XML in reply to the webhook request
    res.type('text/xml');
    return res.send(twiml.toString());
  } catch (err) {
    if (!res.headersSent) {
      const twiml = new VoiceResponse();
      twiml.reject();
      res.type('text/xml');
      res.send(twiml.toString());
    }
    logger.error(err);
    return createTrelloErrorCard(err);
  }
};

// Check if the number the caller pressed was a valid one
const gatherInfo = async (req: Request, res: Response) => {
  try {
    const { From, Digits }: { From: string; Digits: string } = req.body;
    const { param }: { param: string } = req.query;
    const {
      callId,
      userId,
      firstName,
      phoneNum,
      email,
      platform,
      appleDeviceToken,
      androidDeviceToken,
      callerId,
      randomNum,
      userSettings,
      carrier
    }: {
      callId: string;
      userId: string;
      firstName: string;
      phoneNum: string;
      email: string;
      platform: PlatformType;
      appleDeviceToken: string;
      androidDeviceToken: string;
      callerId: string;
      randomNum: number;
      userSettings: UserSettings;
      carrier: string;
    } = encryptor.decrypt(decodeURIComponent(param))!;
    req.session.id = userId;
    req.callId = callId;
    const [callRepo, call]: [repositories, Calls] = await findById(
      Calls,
      callId
    );
    if (!call) return res.sendStatus(401);
    // Use the Twilio Node.js SDK to build an XML response
    const twiml = new VoiceResponse();

    switch (Digits) {
      // If the number was correct, add this number to the safelist
      // and redirect the call to the receiver's app
      case randomNum.toString(): {
        addToSafelist(userId, From).catch(err => logger.error(err));
        twiml.say('Thanks! Redirecting you now');
        // encrypt data before sending to next middleware
        const userInfoObj = {
          userId,
          callId,
          firstName,
          phoneNum,
          email,
          platform,
          appleDeviceToken,
          androidDeviceToken,
          callerId,
          userSettings,
          carrier
        };
        const encrypted = encryptor.encrypt(userInfoObj);
        const encoded = encodeURIComponent(encrypted);
        twiml.redirect(
          { method: 'POST' },
          `/call/api/redirect?param=${encoded}`
        );
        break;
      }
      // If the number was incorrect, assume it's a robot and hang up
      default: {
        call.failedPrompt = true;
        call.callStatus = 'completed';
        await save(callRepo, call);
        if (userSettings.robocallPN) {
          const wasPushed = await pushNotification(
            { androidDeviceToken, appleDeviceToken },
            {
              title: 'Pepper',
              body: `🚫 Robocaller Blocked: ${callerId}`
            }
          );
          if (wasPushed === false) {
            await sendAppNotInstalledText({
              firstName,
              phoneNum,
              carrier,
              caller: callerId
            });
            await sendAppNotInstalledEmail({
              firstName,
              email,
              carrier,
              missedCall: undefined,
              voicemail: undefined
            });
          }
        }
        logger.info(`Robocaller Blocked: ${callId}`);
        twiml.say(
          'You pressed the wrong number. Please call back and try again.'
        );
        twiml.hangup();
        break;
      }
    }

    // Render the response as XML in reply to the webhook request
    res.type('text/xml');
    return res.send(twiml.toString());
  } catch (err) {
    if (!res.headersSent) {
      const twiml = new VoiceResponse();
      twiml.hangup();
      res.type('text/xml');
      res.send(twiml.toString());
    }
    logger.error(err);
    return createTrelloErrorCard(err);
  }
};

// Redirects caller to the receiver's app
const redirectToUser = async (req: Request, res: Response) => {
  try {
    const { param }: { param: string } = req.query;
    const {
      callId,
      userId,
      firstName,
      email,
      platform,
      appleDeviceToken,
      androidDeviceToken,
      callerId,
      phoneNum,
      userSettings,
      carrier
    }: {
      userId: string;
      firstName: string;
      email: string;
      callId: string;
      platform: PlatformType;
      appleDeviceToken: string;
      androidDeviceToken: string;
      callerId: string;
      phoneNum: string;
      userSettings: UserSettings;
      carrier: string;
    } = encryptor.decrypt(decodeURIComponent(param))!;
    const { From }: { From: string } = req.body;
    req.session.id = userId;
    req.callId = callId;
    const twiml = new VoiceResponse();
    const userInfoObj = {
      userId,
      firstName,
      email,
      caller: From,
      callId,
      platform,
      appleDeviceToken,
      androidDeviceToken,
      callerId,
      userSettings,
      carrier,
      phoneNum
    };
    const encrypted = encryptor.encrypt(userInfoObj);
    const encoded = encodeURIComponent(encrypted);
    const customCallerId = twilioCallerId({ platform, callerId, From });
    // redirect to voicemail
    const dial = twiml.dial({
      action: `/call/api/voicemail?param=${encoded}`,
      method: 'POST',
      callerId: customCallerId
    });
    dial.client(
      {
        statusCallbackEvent: ['completed'],
        statusCallback: `${SITE_URL}/call/api/postcallinfo?param=${encoded}`
      },
      phoneNum.substring(1)
    );
    res.type('text/xml');
    res.send(twiml.toString());
  } catch (err) {
    if (!res.headersSent) {
      const twiml = new VoiceResponse();
      twiml.hangup();
      res.type('text/xml');
      res.send(twiml.toString());
    }
    logger.error(err);
    return createTrelloErrorCard(err);
  }
};

const postCallInfo = asyncHandler(async (req, res, next) => {
  const { param }: { param: string } = req.query;
  const {
    callId,
    userId
  }: { callId: string; userId: string } = encryptor.decrypt(
    decodeURIComponent(param)
  )!;
  const {
    CallDuration,
    CallStatus
  }: { CallDuration: string; CallStatus: string } = req.body;
  req.session.id = userId;
  req.callId = callId;
  const [callRepo, currentCall]: [repositories, Calls] = await findById(
    Calls,
    callId
  );
  if (currentCall) {
    if (CallDuration !== undefined && CallDuration !== null)
      currentCall.callDuration = Number(CallDuration);
    currentCall.callStatus = CallStatus;
    await save(callRepo, currentCall);
  }
  return res.sendStatus(200);
});

// Redirects to voicemail
const goToVoicemail = async (req: Request, res: Response) => {
  try {
    const { param }: { param: string } = req.query;
    const {
      userId,
      callId,
      appleDeviceToken,
      androidDeviceToken,
      callerId,
      userSettings,
      firstName,
      email,
      carrier,
      phoneNum
    }: {
      userId: string;
      callId: string;
      appleDeviceToken: string;
      androidDeviceToken: string;
      callerId: string;
      userSettings: UserSettings;
      firstName: string;
      email: string;
      carrier: string;
      phoneNum: string;
    } = encryptor.decrypt(decodeURIComponent(param))!;
    const {
      DialCallStatus,
      From,
      CalledVia,
      ForwardedFrom,
      CallSid
    }: {
      DialCallStatus: string;
      From: string;
      CalledVia: string;
      ForwardedFrom: string;
      CallSid: string;
    } = req.body;
    req.session.id = userId;
    req.callId = callId;
    const [callRepo, currentCall]: [repositories, Calls] = await findById(
      Calls,
      callId
    );
    currentCall.dialCallStatus = DialCallStatus;
    const twiml = new VoiceResponse();
    if (DialCallStatus !== 'completed') {
      currentCall.wasAnswered = false;
      if (userSettings.voicemailGreeting) {
        twiml.play({}, userSettings.voicemailGreeting);
      } else {
        twiml.say('Please leave your message after the beep');
      }
      twiml.record({
        action: '/call/api/hangup',
        timeout: TWILIO_RECORDING_TIMEOUT,
        maxLength: 150,
        trim: 'do-not-trim',
        recordingStatusCallback: `${SITE_URL}/call/api/recording?param=${encodeURIComponent(
          param
        )}`
      });
    } else {
      currentCall.wasAnswered = true;
      twiml.hangup();
    }
    await save(callRepo, currentCall);
    if (
      IS_PRODUCTION &&
      inWhitelist(From) &&
      inWhitelist(CalledVia || ForwardedFrom)
    ) {
      await deleteOneOrMany(Calls, { callSid: CallSid });
      logger.info(`Deleting call record for callSid: ${CallSid}...`);
    }
    res.type('text/xml');
    res.send(twiml.toString());
    if (DialCallStatus !== 'completed') {
      const wasPushed = await pushNotification(
        { androidDeviceToken, appleDeviceToken },
        {
          body: `📲 Missed Call From: ${callerId}`,
          title: 'Pepper'
        }
      );
      if (wasPushed === false) {
        await sendAppNotInstalledText({
          firstName,
          phoneNum,
          carrier,
          caller: callerId
        });
        await sendAppNotInstalledEmail({
          firstName,
          email,
          carrier,
          missedCall: callerId,
          voicemail: undefined
        });
      }
    }
  } catch (err) {
    if (!res.headersSent) {
      const twiml = new VoiceResponse();
      twiml.hangup();
      res.type('text/xml');
      res.send(twiml.toString());
    }
    logger.error(err);
    return createTrelloErrorCard(err);
  }
};

// Notify user about voicemail
const notifyUserVoicemail = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // check timeout based on recording timeout in /call/api/voicemail
    res.sendStatus(200);
    const {
      RecordingStatus,
      ErrorCode,
      RecordingDuration,
      RecordingUrl,
      RecordingSid
    }: {
      RecordingStatus: string;
      ErrorCode: string;
      RecordingDuration: string;
      RecordingUrl: string;
      RecordingSid: string;
    } = req.body;
    if (
      RecordingStatus === 'completed' &&
      ErrorCode === '0' &&
      Number(RecordingDuration) > TWILIO_RECORDING_TIMEOUT
    ) {
      const { param }: { param: string } = req.query;
      const {
        callId,
        caller,
        userId,
        appleDeviceToken,
        androidDeviceToken,
        callerId,
        firstName,
        email,
        phoneNum,
        carrier
      }: {
        callId: string;
        caller: string;
        userId: string;
        appleDeviceToken: string;
        androidDeviceToken: string;
        callerId: string;
        firstName: string;
        email: string;
        phoneNum: string;
        carrier: string;
      } = encryptor.decrypt(decodeURIComponent(param))!;
      req.session.id = userId;
      req.callId = callId;
      const recordingUrl = `${RecordingUrl}.mp3`;
      const twilioVoicemail = await axios({
        url: recordingUrl,
        method: 'GET',
        responseType: 'arraybuffer'
      });
      const s3UploadParams = {
        Bucket: S3_BUCKET,
        Key: `${S3_VOICEMAIL_KEY_FOLDER}/${path.basename(recordingUrl)}`,
        Body: twilioVoicemail.data,
        ACL: 'public-read',
        ContentType: 'audio/mpeg'
      };
      const uploadedS3 = await s3.upload(s3UploadParams).promise();
      const uploadedS3Url = uploadedS3.Location;
      await create(Voicemails, {
        url: uploadedS3Url,
        isDeleted: false,
        userId,
        caller,
        duration: Number(RecordingDuration)
      });
      twilioClient.recordings(RecordingSid).remove();

      const wasPushed = await pushNotification(
        { androidDeviceToken, appleDeviceToken },
        {
          body: `📼 New Voicemail From: ${callerId}`,
          title: 'Pepper'
        }
      );
      if (wasPushed === false) {
        await sendAppNotInstalledText({
          firstName,
          phoneNum,
          carrier,
          caller: callerId
        });
        await sendAppNotInstalledEmail({
          firstName,
          email,
          carrier,
          missedCall: callerId,
          voicemail: uploadedS3Url
        });
      }
    } else {
      if (ErrorCode !== '0')
        logger.error(
          `Twilio voicemail response error code: ${ErrorCode}, SID: ${RecordingSid}`
        );
      if (
        !RecordingDuration ||
        Number(RecordingDuration) < TWILIO_RECORDING_TIMEOUT
      )
        logger.info('Twilio voicemail too short to store, probably empty');
      twilioClient.recordings(RecordingSid).remove();
    }
  } catch (err) {
    twilioClient.recordings(req.body.RecordingSid).remove();
    next(err);
  }
};

const hangup = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const {
      From,
      CalledVia,
      ForwardedFrom,
      CallSid
    }: {
      From: string;
      CalledVia: string;
      ForwardedFrom: string;
      CallSid: string;
    } = req.body;
    const twiml = new VoiceResponse();
    twiml.hangup();
    res.type('text/xml');
    res.send(twiml.toString());
    if (
      IS_PRODUCTION &&
      inWhitelist(From) &&
      inWhitelist(CalledVia || ForwardedFrom)
    ) {
      await deleteOneOrMany(Calls, { callSid: CallSid });
      logger.info(`Deleting call record for callSid: ${CallSid}...`);
    }
  }
);

const randomNumGen = async () => {
  return Math.floor(Math.random() * 10);
};

const addToSafelist = async (userid: string, phoneNum: string) => {
  try {
    if (!UNKNOWN_NUMBERS[phoneNum]) {
      const [userRepo, user]: [repositories, Users] = await findById(
        Users,
        userid
      );
      if (user) {
        user.safelist[phoneNum] = true;
        await save(userRepo, user);
      }
    }
  } catch (err) {
    logger.error(err);
  }
};

const twilioCallerId = ({
  platform,
  callerId,
  From
}: {
  platform: PlatformType;
  callerId: string;
  From: string;
}) => {
  if (UNKNOWN_NUMBERS[From]) {
    return `client:${UNKNOWN_NUMBERS[From]}`;
  }
  if (platform === 'android') {
    return From;
  }
  // replace spaces or hyphens with 737737
  const delimitedCallerId = callerId.trim().replace(/-|\s/g, '737737');
  const iOSCallerId = delimitedCallerId.replace(/\W/g, '');
  return `client:${iOSCallerId}`;
};

const sendNotSubscribedText = async ({
  firstName,
  phoneNum,
  carrier,
  caller
}: {
  firstName: string;
  phoneNum: string;
  carrier: string;
  caller: string;
}) => {
  const turnOffForwardingNum = numberTurnOffForwarding(carrier);
  const turnOffForwardingText = turnOffForwardingNum
    ? turnOffForwardingNum
    : `the number ${carrier} requires.`;
  const textMessage = {
    body: `Hey ${firstName}! This is the Pepper team. We recently received a call to you from ${caller},
    and we had to end the call because you aren't subscribed. You may resubscribe from the Settings tab in our app, or
    to continue receiving calls again without Pepper, dial ${turnOffForwardingText} so ${carrier} stops sending us calls.`,
    to: phoneNum
  };
  return sendText(textMessage);
};

const sendNotSubscribedEmail = async ({
  firstName,
  email,
  missedCall,
  carrier,
  isOnGracePeriod
}: {
  firstName: string;
  email: string;
  missedCall: string;
  carrier: string | null | undefined;
  isOnGracePeriod: boolean;
}) => {
  const turnOffForwarding = numberTurnOffForwarding(carrier);
  const turnOffForwardingNum = turnOffForwarding
    ? turnOffForwarding
    : `the number ${carrier} requires`;
  const turnOffForwardingText = `<a href="tel:${encodeURIComponent(
    turnOffForwardingNum
  )}">${turnOffForwardingNum}</a>`;
  const mailOptions = {
    from: `'Call Pepper' <${PEPPER_EMAIL_ADDRESS}>`,
    to: email,
    subject: `Pepper Missed Call - You are Not Subscribed`,
    html: `Hi ${firstName}, <br /><br />
    You are not subscribed to Pepper and will ${
      !isOnGracePeriod ? 'continue' : 'start'
    } missing calls unless you stop forwarding your number by dialing ${turnOffForwardingText} so ${carrier} stops sending us calls or resubscribe.${
      !isOnGracePeriod
        ? ` You may have already received a text for this as well. You have a missed call from ${missedCall}.`
        : ''
    }${
      isOnGracePeriod
        ? ' We will allow calls for today, but they will start getting rejected tomorrow. This email will get sent with each call you receive (including robocalls).'
        : ''
    }<br /><br />
    Regards,<br /><br />
    Pepper`
  };
  return sendEmail(mailOptions);
};

const sendAppNotInstalledText = async ({
  firstName,
  phoneNum,
  carrier,
  caller
}: {
  firstName: string;
  phoneNum: string;
  carrier: string;
  caller: string;
}) => {
  const turnOffForwardingNum = numberTurnOffForwarding(carrier);
  const turnOffForwardingText = turnOffForwardingNum
    ? turnOffForwardingNum
    : `the number ${carrier} requires`;
  const textMessage = {
    body: `Hey ${firstName}! This is the Pepper team. We recently received a call to you from ${caller},
    and we had to end the call since the Pepper app isn't installed.
    To continue receiving calls again without Pepper, dial ${turnOffForwardingText} so ${carrier} stops sending us calls.`,
    to: phoneNum
  };
  return sendText(textMessage);
};

const sendAppNotInstalledEmail = async ({
  firstName,
  email,
  missedCall,
  carrier,
  voicemail
}: {
  firstName: string;
  email: string;
  carrier: string | null | undefined;
  missedCall: string | null | undefined;
  voicemail: string | null | undefined;
}) => {
  const turnOffForwarding = numberTurnOffForwarding(carrier);
  const turnOffForwardingNum = turnOffForwarding
    ? turnOffForwarding
    : `the number ${carrier} requires`;
  const turnOffForwardingText = `<a href="tel:${encodeURIComponent(
    turnOffForwardingNum
  )}">${turnOffForwardingNum}</a>`;
  const mailOptions = {
    from: `'Call Pepper' <${PEPPER_EMAIL_ADDRESS}>`,
    to: email,
    subject: `Pepper Missed Call - App Not Installed`,
    html: `Hi ${firstName}, <br /><br />
    If the Pepper app isn't installed, you will continue missing calls unless you stop forwarding your number by dialing ${turnOffForwardingText} so ${carrier} stops sending us calls. You may have already received a text for this as well.${
      missedCall
        ? ` You have a missed call from ${missedCall}.${
            voicemail
              ? ` They also left a voicemail which you can listen to <a href="${voicemail}">here.</a>`
              : ''
          }`
        : ''
    }<br /><br />
    If you do have the Pepper app installed, please let us know if we've sent this email in error. Thank you!<br /><br />
    Regards,<br /><br />
    Pepper`
  };
  return sendEmail(mailOptions);
};

const createTrelloErrorCard = async (err: Error) => {
  if (IS_PRODUCTION) {
    return trello.card.create({
      name: 'Express Server Call Error Handler',
      desc: `${err.stack || err.message || err}`,
      pos: 'top',
      idList: TRELLO_TECHNICAL_ISSUE_LIST_ID
    });
  }
};

export {
  getAccessToken,
  startCall,
  gatherInfo,
  redirectToUser,
  postCallInfo,
  goToVoicemail,
  notifyUserVoicemail,
  hangup
};
