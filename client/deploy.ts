import {execSync} from 'child_process';
import {writeFileSync} from 'fs';
import env from './env';
const envFileName = 'env.ts';

if (process.argv[process.argv.length - 1] === 'cpandroid') {
  execSync('./apicheck.sh', {stdio: 'inherit'});
  const codePushVersion = execSync(
    "appcenter codepush deployment list -a callpepper/pepper-android --output json | jq -r '.[0] | .[1]' | sed -n -e 's/^.*Label: //p'",
  )
    .toString()
    .trim();
  let codePushVersionIncrement = codePushVersion;
  if (
    Number(codePushVersion.split('v')[1]) <
    Number(env.BUGSNAG_CODE_BUNDLE_ID.split('v')[1])
  ) {
    codePushVersionIncrement =
      'v' + (Number(codePushVersion.split('v')[1]) + 1);
    env.BUGSNAG_CODE_BUNDLE_ID = codePushVersionIncrement;
    writeFileSync(
      envFileName,
      `export const ENV = ${JSON.stringify(env)}; export default ENV;`,
    );
  }
  execSync(
    'appcenter codepush release-react -a callpepper/pepper-android --entry-file index.ts -d Production -o bundle',
    {stdio: 'inherit'},
  );
  execSync(
    `curl --http1.1 https://upload.bugsnag.com/react-native-source-map -F apiKey=${env.BUGSNAG_API_KEY} -F codeBundleId=${codePushVersionIncrement} -F dev=false -F platform=android -F sourceMap=@bundle/index.android.bundle.map -F  bundle=@bundle/index.android.bundle -F projectRoot=\`pwd\``,
    {stdio: 'inherit'},
  );
  execSync(
    `git tag -fa cp${codePushVersionIncrement} -m CodePush${codePushVersionIncrement} && git push --tags --force`,
  );
} else if (process.argv[process.argv.length - 1] === 'cpios') {
  execSync('./apicheck.sh', {stdio: 'inherit'});
  const codePushVersion = execSync(
    "appcenter codepush deployment list -a callpepper/pepper-ios --output json | jq -r '.[0] | .[1]' | sed -n -e 's/^.*Label: //p'",
  )
    .toString()
    .trim();
  let codePushVersionIncrement = codePushVersion;
  if (
    Number(codePushVersion.split('v')[1]) <
    Number(env.BUGSNAG_CODE_BUNDLE_ID.split('v')[1])
  ) {
    codePushVersionIncrement =
      'v' + (Number(codePushVersion.split('v')[1]) + 1);
    env.BUGSNAG_CODE_BUNDLE_ID = codePushVersionIncrement;
    writeFileSync(
      envFileName,
      `export const ENV = ${JSON.stringify(env)}; export default ENV;`,
    );
  }
  execSync(
    'appcenter codepush release-react -a callpepper/pepper-ios --entry-file index.ts -d Production -o bundle',
    {stdio: 'inherit'},
  );
  execSync(
    `curl --http1.1 https://upload.bugsnag.com/react-native-source-map -F apiKey=${env.BUGSNAG_API_KEY} -F codeBundleId=${codePushVersionIncrement} -F dev=false -F platform=ios -F sourceMap=@bundle/main.jsbundle.map -F  bundle=@bundle/main.jsbundle -F projectRoot=\`pwd\``,
    {stdio: 'inherit'},
  );
  execSync(
    `git tag -fa cp${codePushVersionIncrement} -m CodePush${codePushVersionIncrement} && git push --tags --force`,
  );
} else if (process.argv[process.argv.length - 1] === 'android') {
  const appVersion = execSync(
    `grep "versionName " android/app/build.gradle | sed -n -e 's/^.*versionName //p'`,
  )
    .toString()
    .trim();
  const appVersionCode = Number(
    execSync(
      `grep "versionCode " android/app/build.gradle | sed -n -e 's/^.*versionCode //p'`,
    )
      .toString()
      .trim(),
  );
  execSync(
    'react-native bundle --platform android --entry-file index.ts --dev false --sourcemap-output ./bundle/android-release.bundle.map --bundle-output ./bundle/android-release.bundle',
    {stdio: 'inherit'},
  );
  execSync(
    `curl --http1.1 https://upload.bugsnag.com/react-native-source-map -F apiKey=${env.BUGSNAG_API_KEY} -F appVersion=${appVersion} -F appVersionCode=${appVersionCode} -F dev=false -F platform=android -F sourceMap=@bundle/android-release.bundle.map -F bundle=@bundle/android-release.bundle -F projectRoot=\`pwd\``,
    {stdio: 'inherit'},
  );
} else if (process.argv[process.argv.length - 1] === 'ios') {
  console.log('iOS app versions and bundle version missing as last arguments');
  process.exit(1);
} else if (process.argv[process.argv.length - 2] === 'ios') {
  const appVersion = process.argv[process.argv.length - 2].toString().trim();
  const appBundleVersion = Number(
    process.argv[process.argv.length - 1].toString().trim(),
  );
  if (!Number.isInteger(appBundleVersion)) {
    console.log(
      'App bundle version you passed in is not an integer. Please try again.',
    );
    process.exit(1);
  } else {
    execSync(
      'react-native bundle --platform ios --entry-file index.ts --dev false --sourcemap-output ./bundle/ios-release.bundle.map --bundle-output ./bundle/ios-release.bundle',
      {stdio: 'inherit'},
    );
    execSync(
      `curl --http1.1 https://upload.bugsnag.com/react-native-source-map -F apiKey=${env.BUGSNAG_API_KEY} -F appVersion=${appVersion} -F appBundleVersion=${appBundleVersion} -F dev=false -F platform=ios -F sourceMap=@bundle/ios-release.bundle.map -F bundle=@bundle/ios-release.bundle -F projectRoot=\`pwd\``,
      {stdio: 'inherit'},
    );
  }
}
