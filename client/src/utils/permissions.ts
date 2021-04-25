import {Platform} from 'react-native';
import {
  check,
  checkNotifications,
  PERMISSIONS,
  PermissionStatus,
  request,
  requestNotifications,
} from 'react-native-permissions';

export type AllPermissionsResult =
  | AndroidAllPermissionsResult
  | IOSAllPermissionsResult;

export type AndroidAllPermissionsResult = {
  contactsStatus: PermissionStatus;
  recordAudioStatus: PermissionStatus;
  phoneStateStatus: PermissionStatus;
  overallStatus: PermissionStatus;
};

export type IOSAllPermissionsResult = {
  notifStatus: PermissionStatus;
  microphoneStatus: PermissionStatus;
  contactsStatus: PermissionStatus;
  overallStatus: PermissionStatus;
};

const rationale = {
  microphone: {
    buttonPositive: 'Okay',
    title: 'Grant Microphone Access',
    message: `
      Pepper needs microphone access in order for you to take calls.
    `,
  },
  contacts: {
    buttonPositive: 'Okay',
    title: 'Grant Microphone Access',
    message: `
      Pepper needs contacts access in order to avoid blocking people you know.
    `,
  },
  phoneState: {
    buttonPositive: 'Okay',
    title: 'Grant Microphone Access',
    message: `
      Pepper needs access to your phone state in order to answer calls.
    `,
  },
  externalStorageWrite: {
    buttonPositive: 'Okay',
    title: 'Grant External Storage Writing',
    message: `
      Pepper needs permission to write to external storage in order to save voicemail audio files.
    `,
  },
  externalStorageRead: {
    buttonPositive: 'Okay',
    title: 'Grant External Storage Reading',
    message: `
      Pepper needs permission to read external storage in order to display saved voicemail audio files.
    `,
  },
};

const getAllPermissions = async (): Promise<AllPermissionsResult> => {
  if (Platform.OS === 'ios') {
    const allStatuses: IOSAllPermissionsResult = {} as IOSAllPermissionsResult;
    allStatuses['microphoneStatus'] = await request(PERMISSIONS.IOS.MICROPHONE);
    allStatuses['contactsStatus'] = await request(PERMISSIONS.IOS.CONTACTS);
    const notificationOptions: any = [
      'alert',
      'badge',
      'lockScreen',
      'notificationCenter',
    ];
    const {status} = await requestNotifications(notificationOptions);
    allStatuses['notifStatus'] = status;
    allStatuses['overallStatus'] = Object.values(allStatuses).every(
      (s: string) => s === 'granted',
    )
      ? 'granted'
      : 'denied';
    return allStatuses;
  } else {
    const allStatuses: AndroidAllPermissionsResult = {} as AndroidAllPermissionsResult;
    allStatuses['phoneStateStatus'] = await request(
      PERMISSIONS.ANDROID.READ_PHONE_STATE,
    );
    allStatuses['recordAudioStatus'] = await request(
      PERMISSIONS.ANDROID.RECORD_AUDIO,
    );
    allStatuses['contactsStatus'] = await request(
      PERMISSIONS.ANDROID.READ_CONTACTS,
    );
    allStatuses['overallStatus'] = Object.values(allStatuses).every(
      (s: string) => s === 'granted',
    )
      ? 'granted'
      : 'denied';
    return allStatuses;
  }
};

const checkAllPermissions = async (): Promise<AllPermissionsResult> => {
  if (Platform.OS === 'ios') {
    const allStatuses: IOSAllPermissionsResult = {} as IOSAllPermissionsResult;
    allStatuses['microphoneStatus'] = await check(PERMISSIONS.IOS.MICROPHONE);
    allStatuses['contactsStatus'] = await check(PERMISSIONS.IOS.CONTACTS);
    allStatuses['notifStatus'] = Object.values(await checkNotifications()).some(
      (s: string) => s === 'granted',
    )
      ? 'granted'
      : 'denied';
    allStatuses['overallStatus'] = Object.values(allStatuses).every(
      (s: string) => s === 'granted',
    )
      ? 'granted'
      : 'denied';
    return allStatuses;
  } else {
    const allStatuses: AndroidAllPermissionsResult = {} as AndroidAllPermissionsResult;
    allStatuses['phoneStateStatus'] = await check(
      PERMISSIONS.ANDROID.READ_PHONE_STATE,
    );
    allStatuses['recordAudioStatus'] = await check(
      PERMISSIONS.ANDROID.RECORD_AUDIO,
    );
    allStatuses['contactsStatus'] = await check(
      PERMISSIONS.ANDROID.READ_CONTACTS,
    );
    allStatuses['overallStatus'] = Object.values(allStatuses).every(
      (s: string) => s === 'granted',
    )
      ? 'granted'
      : 'denied';
    return allStatuses;
  }
};

interface ExternalStoragePermission {
  read: PermissionStatus;
  write: PermissionStatus;
}

const getExternalStoragePermission = async (): Promise<ExternalStoragePermission | void> => {
  if (Platform.OS !== 'android') return;
  const allStatuses: ExternalStoragePermission = {} as ExternalStoragePermission;
  allStatuses['read'] = await request(
    PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE,
  );
  allStatuses['write'] = await request(
    PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE,
  );
  return allStatuses;
};

export {getAllPermissions, checkAllPermissions, getExternalStoragePermission};
