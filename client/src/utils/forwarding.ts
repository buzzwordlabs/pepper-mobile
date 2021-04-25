import {request} from './request';

const convertLibPhoneNumber = (phoneNumber: string): string =>
  phoneNumber.substring(2);

export interface CarrierObject {
  key: number;
  label: string;
  accessibilityLabel: string;
  value: string;
}

export interface Section {
  key: number;
  section: boolean;
  label: string;
}

export type ForwardingModalData = (CarrierObject | Section)[];

const setupCallForwarding = async (): Promise<ForwardingModalData> => {
  let index = 0;
  const response = await request({url: '/user/phone-number', method: 'GET'});
  const phoneNum = convertLibPhoneNumber(response.data.phoneNum);
  return [
    {key: index++, section: true, label: 'Choose your phone carrier'},
    {
      key: index++,
      label: 'AT&T',
      accessibilityLabel: 'AT&T',
      value: `*21*${phoneNum}#`,
    },
    {
      key: index++,
      label: 'T-Mobile',
      accessibilityLabel: 'T-Mobile',
      value: `*21*${phoneNum}#`,
    },
    {
      key: index++,
      label: 'Verizon',
      accessibilityLabel: 'Verizon',
      value: `*72${phoneNum}`,
    },
    {
      key: index++,
      label: 'Cricket',
      accessibilityLabel: 'Cricket',
      value: `*21*${phoneNum}#`,
    },
    {
      key: index++,
      label: 'XFinity',
      accessibilityLabel: 'XFinity',
      value: `*72${phoneNum}`,
    },
  ];
};

const turnOffCallForwarding = (): (CarrierObject | Section)[] => {
  let index = 0;
  return [
    {key: index++, section: true, label: 'Choose your phone carrier'},
    {
      key: index++,
      label: 'AT&T',
      accessibilityLabel: 'AT&T',
      value: '#21#',
    },
    {
      key: index++,
      label: 'T-Mobile',
      accessibilityLabel: 'T-Mobile',
      value: '#21#',
    },
    {
      key: index++,
      label: 'Verizon',
      accessibilityLabel: 'Verizon',
      value: '*73',
    },
    {
      key: index++,
      label: 'Cricket',
      accessibilityLabel: 'Cricket',
      value: '#21#',
    },
    {
      key: index++,
      label: 'XFinity',
      accessibilityLabel: 'Verizon',
      value: '*73',
    },
  ];
};

export {turnOffCallForwarding, setupCallForwarding};
