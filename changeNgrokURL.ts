import { writeFileSync } from 'fs';
import * as Twilio from './server/node_modules/twilio';
import { parseFileSync, stringifySync } from 'envfile';
import file from './client/env';

const fileName = './client/env.ts';
const envFile = '.env';

const twilioAccountSid = process.env.TWILIO_SID;
const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
const twilioClient = new (Twilio as any)(twilioAccountSid, twilioAuthToken);

process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function(data) {
  const { tunnels } = JSON.parse(String(data));
  const url =
    tunnels[0].proto === 'https'
      ? tunnels[0].public_url
      : tunnels[1].public_url;
  console.log('Ngrok URL: ', url);
  file.API_BASE_URL = url;
  writeFileSync(
    fileName,
    `export const ENV = ${JSON.stringify(file, null, 2)}; export default ENV;`
  );
  console.log('Done writing to env.ts');
  const parsedFile = parseFileSync(envFile);
  parsedFile.SITE_URL = url;
  writeFileSync('.env', stringifySync(parsedFile));
  console.log('Done writing to .env');
  twilioClient
    .incomingPhoneNumbers(process.env.TWILIO_TEST_NUM_SID)
    .update({ voiceUrl: `${file.API_BASE_URL}/call/api/index` })
    .then()
    .catch(error => {
      console.log(error);
      console.log('PHONE NUMBER NOT UPDATED, SEE ERROR ABOVE');
    });
});
