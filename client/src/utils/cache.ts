import AsyncStorage from '@react-native-community/async-storage';

const readCache = async (name: string): Promise<any> => {
  const data: string | null = await AsyncStorage.getItem(name);
  if (data === null) {
    return null;
  }
  const cleansedData: any = parse(data);
  return cleansedData;
};

const writeCache = async (name: string, data: any): Promise<void> =>
  AsyncStorage.setItem(name, stringify(data));

const deleteCache = async (name: string): Promise<void> =>
  AsyncStorage.removeItem(name);

interface StringIndexableObject {
  [name: string]: string | object;
}

type KVPair = [string, string | number];

type StringifiedKVPair = [string, string];

const readCacheMulti = async (keys: string[]): Promise<any> => {
  const data: StringIndexableObject = {};
  const kvPairs = await AsyncStorage.multiGet(keys);
  kvPairs.forEach((pair: [string, string | null]): void => {
    if (pair[1] !== null && pair[0] !== null) {
      data[pair[0]] = parse(pair[1]);
    }
  });
  return data;
};

const writeCacheMulti = async (kvPairsArray: KVPair[]): Promise<void> => {
  const cleansedKvPairs: StringifiedKVPair[] = await Promise.all(
    kvPairsArray.map(
      (pair: any): StringifiedKVPair => {
        return [pair[0], stringify(pair[1])];
      },
    ),
  );
  await AsyncStorage.multiSet(cleansedKvPairs);
};

const deleteCacheMulti = async (keys: string[]): Promise<void> =>
  AsyncStorage.multiRemove(keys);

const readCacheAll = async (): Promise<any> => {
  const data: StringIndexableObject = {};
  const keys = await AsyncStorage.getAllKeys();
  const kvPairs: [string, string | null][] = await AsyncStorage.multiGet(keys);
  const nonNullKvPairs = filterNull(kvPairs);
  nonNullKvPairs.forEach((pair: any) => (data[pair[0]] = parse(pair[1])));
  return data;
};

const filterNull = (kvPairs: [string, string | null][]): any =>
  kvPairs.filter(pair => pair[1] !== null);

const deleteCacheAll = async (): Promise<void> => AsyncStorage.clear();

const deleteCacheAllExcept = async (keepKeys: string[]) => {
  const allKeys = await readCacheAllKeys();
  const keysToDelete = allKeys.filter(
    (keyToBeDeleted: string) => !keepKeys.includes(keyToBeDeleted),
  );
  await deleteCacheMulti(keysToDelete);
};

const readCacheAllKeys = async (): Promise<string[]> =>
  AsyncStorage.getAllKeys();

// Helpers
const stringify = (data: any): string => {
  let stringified: string;
  try {
    stringified = JSON.stringify(data);
  } catch (err) {
    stringified = String(data);
  }
  return stringified;
};

const parse = (data: string): any => {
  let parsed: any;
  try {
    parsed = JSON.parse(data);
  } catch (err) {
    parsed = data;
  }
  return parsed;
};

export {
  writeCache,
  readCache,
  deleteCache,
  writeCacheMulti,
  readCacheMulti,
  deleteCacheMulti,
  readCacheAll,
  deleteCacheAll,
  readCacheAllKeys,
  deleteCacheAllExcept,
};
