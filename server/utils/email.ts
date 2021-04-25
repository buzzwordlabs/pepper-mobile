import nodemailer from 'nodemailer';
import {
  PEPPER_EMAIL_ADDRESS,
  REACT_APP_GAUTH_CLIENTID,
  GAUTH_CLIENT_SECRET,
  PEPPER_GMAIL_REFRESH_TOKEN,
  IS_PRODUCTION
} from '../config';
import { Users } from '../database/entities';
import { logger } from '.';

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    type: 'OAuth2',
    user: PEPPER_EMAIL_ADDRESS,
    clientId: REACT_APP_GAUTH_CLIENTID,
    clientSecret: GAUTH_CLIENT_SECRET,
    refreshToken: PEPPER_GMAIL_REFRESH_TOKEN
  }
});

interface Email {
  to?: string;
  from?: string;
  subject: string;
  html: string;
  attachments?: { filename: string; path: string }[];
}

const extractUserInfo = (user: Users) => {
  return `
    UserId: ${user.id}<br></br>
    First Name: ${user.firstName}<br></br>
    Last Name: ${user.lastName}<br></br>
    Email: ${user.email}<br></br>
    Platform: ${user.platform}<br></br>
    App Version: ${user.appVersion}<br></br>
    Carrier: ${user.carrier}<br></br>
    Device Info: ${JSON.stringify(user.deviceInfo, null, 2)}<br></br>
  `;
};

const sendEmail = async ({
  subject,
  html,
  from = `'Call Pepper' <${PEPPER_EMAIL_ADDRESS}>`,
  to = PEPPER_EMAIL_ADDRESS,
  attachments = []
}: Email): Promise<any> => {
  const mailOptions = { from, to, subject, html, attachments };
  if (IS_PRODUCTION) {
    try {
      const result = await transporter.sendMail(mailOptions);
      result.ok = result.response.split(' ').includes('OK');
      return result;
    } catch (err) {
      return err;
    }
  } else {
    logger.info(
      JSON.stringify({ from, to, subject, html, attachments }, null, 2)
    );
  }
};

export { sendEmail, extractUserInfo };
