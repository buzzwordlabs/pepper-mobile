import { PEPPER_TEAM_NUMBERS } from '../config';

// If given number is in the whitelisted numbers, return false
const inWhitelist = (phoneNumber: string) => {
  return PEPPER_TEAM_NUMBERS.includes(phoneNumber);
};

export { inWhitelist };
