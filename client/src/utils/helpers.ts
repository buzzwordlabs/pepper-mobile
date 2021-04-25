import moment from 'moment';

const convertRecentDateTime = (dateString: string) => {
  const date = moment(dateString);
  return {
    day: date.format('M/D/YY'),
    time: date.format('h:mm A'),
  };
};

const callerId = (
  givenName: string | undefined,
  familyName: string | undefined,
  number: string | undefined,
) => {
  if (givenName && !familyName) return givenName;
  else if (!givenName && familyName) return familyName;
  else if (givenName && familyName) return `${givenName} ${familyName}`;
  else return number;
};

export {convertRecentDateTime, callerId};
