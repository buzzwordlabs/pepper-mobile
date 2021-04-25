import {Client, Configuration} from 'bugsnag-react-native';
import ENV from '../../env';

const config = new Configuration(ENV.BUGSNAG_API_KEY);
config.notifyReleaseStages = ['production'];
config.codeBundleId = ENV.BUGSNAG_CODE_BUNDLE_ID;
const bugsnag = new Client(config);

export {bugsnag};
