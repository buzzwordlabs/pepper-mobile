import { writeFileSync } from 'fs';
import { parseFileSync, stringifySync } from 'envfile';
import file from './client/env';

const fileName = './client/env.ts';
const envFile = '.env';

const url = 'http://localhost:8000';
console.log('Server URL: ', url);
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
