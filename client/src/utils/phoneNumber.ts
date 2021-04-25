import {parsePhoneNumberFromString, E164Number} from 'libphonenumber-js';

export const validatePhoneNumber = (
  phoneNumber: string,
): E164Number | string => {
  const parsedPhoneNumber = parsePhoneNumberFromString(phoneNumber, 'US');
  if (
    parsedPhoneNumber &&
    parsedPhoneNumber.country === 'US' &&
    parsedPhoneNumber.isValid()
  ) {
    return parsedPhoneNumber.number;
  } else return '';
};
