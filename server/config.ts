const {
  REACT_APP_GOOGLE_ANALYTICS_ID,
  PEPPER_EMAIL_ADDRESS,
  REACT_APP_GAUTH_CLIENTID,
  GAUTH_CLIENT_SECRET,
  PEPPER_GMAIL_REFRESH_TOKEN,
  ENCRYPT_SECRET,
  SITE_URL,
  TWILIO_SID,
  TWILIO_PEPPERMOBILE_API_KEY,
  TWILIO_PEPPERMOBILE_API_SECRET,
  TWILIO_PEPPERMOBILE_APP_SID,
  TWILIO_PEPPERMOBILE_ANDROID_PUSH_CREDENTIAL_SID,
  TWILIO_PEPPERMOBILE_IOS_PUSH_CREDENTIAL_SID,
  APPLE_BUNDLE_ID_STRING,
  RECAPTCHA_SECRETKEY,
  GOOGLE_SERVICE_ACCOUNT_EMAIL,
  GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY,
  ANDROID_PACKAGE_NAME,
  APPLE_SHARED_SECRET,
  NODE_ENV = 'dev',
  TWILIO_AUTH_TOKEN,
  TWILIO_SERVICE_ID,
  TWILIO_MESSAGING_SERVICE_SID,
  TWILIO_NUM,
  PORT = 8000,
  APN_KEY,
  APN_KEY_ID,
  APPLE_DEV_TEAM_ID,
  FIREBASE_SERVER_KEY,
  JWT_SECRET,
  AWS_ACCESS_KEY_ID,
  AWS_ACCESS_KEY_SECRET,
  TRELLO_API_KEY,
  TRELLO_API_TOKEN,
  TRELLO_TECHNICAL_ISSUE_LIST_ID,
  TRELLO_SUPPORT_TICKET_LIST_ID,
  MERCURY_ACCOUNT_ID,
  MERCURY_API_KEY,
  RETOOL_PEPPER_API_KEY
} = process.env;

const PEPPER_TEAM_NUMBERS = process.env.PEPPER_TEAM_NUMBERS!.split(',');
const PEPPER_TEAM_EMAILS = process.env.PEPPER_TEAM_EMAILS!.split(',');
const IS_PRODUCTION = NODE_ENV === 'production';
// TODO: '464' is supposed to be 'empty' or 'No Caller ID', but not sure how it appears in the actual JS object Twilio sends
const UNKNOWN_NUMBERS: any = {
  '+8006927753': 'Unknown', // unsure about this one
  '+266696687': 'Anonymous',
  '+17378742833': 'Restricted',
  '+86282452253': 'Unavailable',
  '+8002562533': 'Blocked', // unsure if this is right
  '+8008566696': 'Unknown', // unsure if this is right
  '+802693836': 'Unknown', // unsure about this one
  '+1802693836': 'Unknown'
};

const envs = [
  REACT_APP_GOOGLE_ANALYTICS_ID,
  PEPPER_EMAIL_ADDRESS,
  REACT_APP_GAUTH_CLIENTID,
  GAUTH_CLIENT_SECRET,
  PEPPER_GMAIL_REFRESH_TOKEN,
  ENCRYPT_SECRET,
  SITE_URL,
  TWILIO_SID,
  TWILIO_PEPPERMOBILE_API_KEY,
  TWILIO_PEPPERMOBILE_API_SECRET,
  TWILIO_PEPPERMOBILE_APP_SID,
  TWILIO_PEPPERMOBILE_ANDROID_PUSH_CREDENTIAL_SID,
  TWILIO_PEPPERMOBILE_IOS_PUSH_CREDENTIAL_SID,
  APPLE_BUNDLE_ID_STRING,
  RECAPTCHA_SECRETKEY,
  GOOGLE_SERVICE_ACCOUNT_EMAIL,
  GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY,
  ANDROID_PACKAGE_NAME,
  APPLE_SHARED_SECRET,
  NODE_ENV,
  TWILIO_AUTH_TOKEN,
  TWILIO_SERVICE_ID,
  TWILIO_MESSAGING_SERVICE_SID,
  TWILIO_NUM,
  PORT,
  APN_KEY,
  APN_KEY_ID,
  APPLE_DEV_TEAM_ID,
  FIREBASE_SERVER_KEY,
  JWT_SECRET,
  PEPPER_TEAM_NUMBERS,
  PEPPER_TEAM_EMAILS,
  IS_PRODUCTION,
  AWS_ACCESS_KEY_ID,
  AWS_ACCESS_KEY_SECRET,
  UNKNOWN_NUMBERS,
  TRELLO_API_KEY,
  TRELLO_API_TOKEN,
  TRELLO_TECHNICAL_ISSUE_LIST_ID,
  TRELLO_SUPPORT_TICKET_LIST_ID,
  MERCURY_ACCOUNT_ID,
  MERCURY_API_KEY,
  RETOOL_PEPPER_API_KEY
];

if (!envs.every(env => env !== undefined)) {
  throw new Error('Some environment variables are undefined');
}

export {
  REACT_APP_GOOGLE_ANALYTICS_ID,
  PEPPER_EMAIL_ADDRESS,
  REACT_APP_GAUTH_CLIENTID,
  GAUTH_CLIENT_SECRET,
  PEPPER_GMAIL_REFRESH_TOKEN,
  ENCRYPT_SECRET,
  SITE_URL,
  TWILIO_SID,
  TWILIO_MESSAGING_SERVICE_SID,
  TWILIO_PEPPERMOBILE_API_KEY,
  TWILIO_PEPPERMOBILE_API_SECRET,
  TWILIO_PEPPERMOBILE_APP_SID,
  TWILIO_PEPPERMOBILE_ANDROID_PUSH_CREDENTIAL_SID,
  TWILIO_PEPPERMOBILE_IOS_PUSH_CREDENTIAL_SID,
  APPLE_BUNDLE_ID_STRING,
  RECAPTCHA_SECRETKEY,
  GOOGLE_SERVICE_ACCOUNT_EMAIL,
  GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY,
  ANDROID_PACKAGE_NAME,
  APPLE_SHARED_SECRET,
  NODE_ENV,
  TWILIO_AUTH_TOKEN,
  TWILIO_SERVICE_ID,
  TWILIO_NUM,
  PORT,
  APN_KEY,
  APN_KEY_ID,
  APPLE_DEV_TEAM_ID,
  FIREBASE_SERVER_KEY,
  JWT_SECRET,
  PEPPER_TEAM_NUMBERS,
  PEPPER_TEAM_EMAILS,
  IS_PRODUCTION,
  AWS_ACCESS_KEY_ID,
  AWS_ACCESS_KEY_SECRET,
  UNKNOWN_NUMBERS,
  TRELLO_API_KEY,
  TRELLO_API_TOKEN,
  TRELLO_TECHNICAL_ISSUE_LIST_ID,
  TRELLO_SUPPORT_TICKET_LIST_ID,
  MERCURY_ACCOUNT_ID,
  MERCURY_API_KEY,
  RETOOL_PEPPER_API_KEY
};
