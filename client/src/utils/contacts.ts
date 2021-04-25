import Contacts from 'react-native-contacts';
import {parsePhoneNumberFromString} from 'libphonenumber-js';
import {map, difference, keys, isEqual} from 'lodash';
import {readCache, writeCache} from './cache';

interface CleansedContacts {
  [index: string]:
    | {
        givenName: string;
        familyName: string;
      }
    | undefined;
}

interface UnprocessedCallData {
  createdAt: string;
  caller: string;
  dialCallStatus?: string;
}

const getContacts = async (): Promise<any> => {
  return new Promise((resolve, reject) => {
    Contacts.getAll(async (err, contacts) => {
      await writeCache('contacts', contacts);
      const cleansedContacts: CleansedContacts = {};
      await Promise.all(
        map(contacts, async (contact: any) =>
          Promise.all(
            map(contact.phoneNumbers, async (contactNum: any) => {
              const phoneNumber = parsePhoneNumberFromString(
                contactNum.number,
                'US',
              );

              if (phoneNumber) {
                return (cleansedContacts[phoneNumber.number as string] = {
                  givenName: contact.givenName,
                  familyName: contact.familyName,
                });
              }
            }),
          ),
        ),
      );
      await writeCache('cleansedContacts', cleansedContacts);
      return resolve(cleansedContacts);
    });
  });
};

const getDiffContacts = async () => {
  const cachedContacts: CleansedContacts = await readCache('cleansedContacts');
  const cleansedContacts = await getContacts();
  const updatedContactsArray = Object.keys(cleansedContacts).filter(
    key => !isEqual(cleansedContacts[key], cachedContacts[key]),
  );
  const deletedContacts = difference(
    keys(cachedContacts),
    keys(cleansedContacts),
  );
  if (deletedContacts.length > 0 || updatedContactsArray.length > 0) {
    await writeCache('cleansedContacts', cleansedContacts);
  }
  const updatedContacts: CleansedContacts = {};

  updatedContactsArray.forEach(
    updatedContact =>
      (updatedContacts[updatedContact] = cleansedContacts[updatedContact]),
  );
  return {updatedContacts, deletedContacts};
};

const mapCallsToContact = async (
  calls: UnprocessedCallData[],
): Promise<any> => {
  return Promise.all(
    calls.map(async call => {
      return new Promise((resolve, reject) => {
        Contacts.getContactsByPhoneNumber(call.caller, (err, response) => {
          if (response.length > 0) {
            resolve({
              ...call,
              givenName: response[0].givenName,
              familyName: response[0].familyName,
            });
          } else {
            resolve(call);
          }
        });
      });
    }),
  );
};

const getContactByPhoneNumber = async (
  phoneNumber: string,
): Promise<string> => {
  return new Promise((resolve, reject) => {
    Contacts.getContactsByPhoneNumber(phoneNumber, (err, response) => {
      response.length > 0
        ? resolve(response[0].givenName + response[0].familyName)
        : resolve(phoneNumber);
    });
  });
};

export {
  getDiffContacts,
  mapCallsToContact,
  getContacts,
  getContactByPhoneNumber,
};
