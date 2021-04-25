// eslint-disable react/no-unused-state
import {isEmpty, isEqual} from 'lodash';
import React, {Component} from 'react';
import {Platform, Text as DefaultText} from 'react-native';
import RNIap, {
  finishTransaction,
  purchaseErrorListener,
  purchaseUpdatedListener,
} from 'react-native-iap';
import SplashScreen from 'react-native-splash-screen';
import codePush from 'react-native-code-push';

import {
  getUserMetadata,
  getContacts,
  readCacheMulti,
  writeCache,
  request,
  redirectAppStore,
  readCache,
  deleteCache,
  toastOptions,
  notify,
  bugsnag,
} from '../utils';
import {getVersion} from 'react-native-device-info';
import {Text} from '../components';

let purchaseUpdateSubscription: any;
let purchaseErrorSubscription: any;

type ContextProps = {
  state: any;
  resetState: any;
  setState: any;
  getInitialContacts: any;
  getInitData: any;
  syncUserMetadata: any;
};

const GlobalContext = React.createContext<Partial<ContextProps>>({});

interface InitDataResponse {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  blockedCalls: number;
  settings: any;
  newestAppVersion: string;
  userMetadata: UserMetadata;
}

interface State {
  isLoggedIn: boolean | string;
  onboardingStep: number;
  permissionsGranted: boolean;
  persistentToastVisible: boolean;
  persistentToastText: string | Text;
  itemSubs: string[];
  blockedCalls: number;
  settings: {
    robocallPN: boolean;
    voicemailGreeting: string;
  };
}

interface UserMetadata {
  [name: string]: any;
  appVersion: string;
  codePushVersion: string | null;
  carrier: string;
  deviceInfo: {
    phoneModel: string;
    systemName: string;
    systemVersion: string;
  };
}

class GlobalContextProvider extends Component<{}, State> {
  state: State = {
    isLoggedIn: false,
    onboardingStep: 0,
    permissionsGranted: false,
    persistentToastVisible: false,
    blockedCalls: 0,
    settings: {
      robocallPN: false,
      voicemailGreeting: '',
    },
    persistentToastText: '',
    itemSubs: Platform.select({
      ios: ['com.buzzwordlabs.pepper.monthly_6'],
      android: ['com.buzzwordlabs.pepper.monthly_six'],
    }),
  };

  componentDidMount = async () => {
    (async () => {
      const {
        authToken,
        onboardingStep,
      }: {
        authToken: string;
        onboardingStep: number;
      } = await readCacheMulti(['authToken', 'onboardingStep']);
      let onboardingStepUpdated;
      if (onboardingStep > 0) {
        const response = await request({
          url: '/user/onboarding/step',
          method: 'GET',
        });
        onboardingStepUpdated = response.data.onboardingStep;
      }
      const {itemSubs} = this.state;
      this.setState({
        isLoggedIn: !!authToken,
        onboardingStep: onboardingStepUpdated || onboardingStep,
        itemSubs,
      });
      if (this.state.isLoggedIn) {
        const {
          blockedCalls,
          settings,
          newestAppVersion,
          userMetadata,
          id,
          firstName,
          lastName,
          email,
        } = await this.getInitData();
        bugsnag.setUser(id, `${firstName} ${lastName}`, email);
        // If newest deployed version is different from this one
        if (
          newestAppVersion !== undefined &&
          newestAppVersion !== getVersion()
        ) {
          notify(
            <Text success semibold onPress={redirectAppStore}>
              There's a new app update! To ensure Pepper continues working for
              you and that you get the latest features, please press me to
              update the app.
            </Text>,
            {
              duration: 3000,
              containerStyle: {
                ...toastOptions.containerStyle,
                height: 90,
              },
            },
          );
        }
        this.syncUserMetadata(userMetadata);
        this.setState({
          blockedCalls,
          settings,
        });
      }
    })();
    this.iapSetup();
    SplashScreen.hide();
  };

  syncUserMetadata = async (expectedUserMetadata: UserMetadata) => {
    const changedData: any = {};
    const currentUserMetadata: UserMetadata = await getUserMetadata();
    // Check what data has changed if any
    Object.keys(currentUserMetadata).map((key: string) => {
      if (!isEqual(expectedUserMetadata[key], currentUserMetadata[key])) {
        changedData[key] = currentUserMetadata[key];
      }
    });

    // If data changed, update only that data
    if (!isEmpty(changedData)) {
      await request({
        url: '/user/devices/sync-user-metadata',
        method: 'POST',
        body: changedData,
      });
    }
  };

  componentWillUnmount() {
    if (purchaseUpdateSubscription) {
      purchaseUpdateSubscription.remove();
      purchaseUpdateSubscription = null;
    }
    if (purchaseErrorSubscription) {
      purchaseErrorSubscription.remove();
      purchaseErrorSubscription = null;
    }
  }

  getInitData = async (): Promise<InitDataResponse> => {
    const response = await request({url: '/user/init', method: 'GET'});
    if (response.ok) {
      await writeCache('lastInitData', response.data);
      const {
        blockedCalls = 0,
        carrier,
        deviceInfo,
        appVersion,
        codePushVersion,
      } = response.data;
      return {
        ...response.data,
        blockedCalls,
        userMetadata: {
          carrier,
          deviceInfo,
          appVersion,
          codePushVersion,
        },
      };
    } else return readCache('lastInitData');
  };

  getInitialContacts = async () => {
    const cleansedContacts = await getContacts();
    await request({
      url: '/user/contacts',
      method: 'POST',
      body: {
        contacts: cleansedContacts,
      },
    });
    await writeCache('cleansedContacts', cleansedContacts);
  };

  iapSetup = async () => {
    try {
      await RNIap.getSubscriptions(this.state.itemSubs);
    } catch (err) {
      console.warn(err.code, err.message);
    }
    purchaseUpdateSubscription = purchaseUpdatedListener(
      async (purchase: any) => {
        if (purchase.transactionReceipt) {
          try {
            await writeCache('purchase', purchase);
            // Send receipt to server for validation
            const response = await request({
              url: '/user/iap/save-receipt',
              method: 'POST',
              body: {
                platform: Platform.OS,
                purchase,
              },
            });
            if (response.ok) {
              Platform.OS === 'ios' &&
                (await finishTransaction(purchase, false));
            } else throw Error('Subscription error');
          } catch (error) {
            console.warn('error: ', error);
          }
        }
      },
    );

    purchaseErrorSubscription = purchaseErrorListener(async (error: any) => {
      console.log('Failed purchase, trying again..');
      try {
        const purchase = await readCache('purchase');
        if (purchase) {
          const response = await request({
            url: '/user/iap/save-receipt',
            method: 'POST',
            body: {
              platform: Platform.OS,
              purchase,
            },
          });
          if (response.ok) {
            await deleteCache('purchase');
          }
        }
      } catch (err) {
        console.warn('Purchase error: ', error.message);
      }
    });
  };

  resetState = () =>
    this.setState({
      isLoggedIn: false,
      onboardingStep: 0,
      permissionsGranted: false,
      persistentToastVisible: false,
      blockedCalls: 0,
      settings: {
        robocallPN: false,
        voicemailGreeting: '',
      },
      persistentToastText: '',
      itemSubs: Platform.select({
        ios: ['com.buzzwordlabs.pepper.monthly_6'],
        android: ['com.buzzwordlabs.pepper.monthly_six'],
      }),
    });

  updateState = (newState: State) => this.setState(newState);

  render() {
    return (
      <GlobalContext.Provider
        value={{
          state: this.state!,
          resetState: this.resetState,
          setState: this.updateState,
          getInitialContacts: this.getInitialContacts,
          getInitData: this.getInitData,
          syncUserMetadata: this.syncUserMetadata,
        }}>
        {this.props.children}
      </GlobalContext.Provider>
    );
  }
}

export {GlobalContext, GlobalContextProvider};
