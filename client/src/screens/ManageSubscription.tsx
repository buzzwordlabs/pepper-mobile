import React, {useContext, useState} from 'react';
import {Alert, Linking, Platform, View} from 'react-native';
import {requestSubscription} from 'react-native-iap';
import {NavigationStackProp} from 'react-navigation-stack';

import {Button, Text, TextButton} from '../components';
import {GlobalContext} from '../global/GlobalContext';

interface Props {
  navigation: NavigationStackProp;
}

const ManageSubscription = (props: Props) => {
  const [isSubscribed, setIsSubscribed] = useState<boolean | null>(null);
  const global = useContext(GlobalContext);

  const Prompt = () => {
    return (
      <>
        <Text semibold xl style={{marginBottom: 30}}>
          Are you attempting to unsubscribe or resubscribe?
        </Text>
        <Button title="Resubscribe" onPress={() => setIsSubscribed(false)} />
        <Button
          title="Unsubscribe"
          outline
          onPress={() => setIsSubscribed(true)}
        />
      </>
    );
  };
  const Resubscribe = () => {
    const sendPayment = async () => {
      requestSubscription(global.state.itemSubs[0]);
    };
    return (
      <>
        <Text semibold style={{marginBottom: 30}} xl>
          Welcome back! We're glad to see you again.
        </Text>
        <Text semibold style={{marginBottom: 30}} lg>
          Pepper costs $6 per month. You get billed every month and you can
          unsubscribe at any time.
        </Text>
        <Button
          style={{marginVertical: 30}}
          title="Resubscribe"
          onPress={sendPayment}
        />
        <TextButton title="Go Back" onPress={() => props.navigation.goBack()} />
      </>
    );
  };
  const Unsubscribe = () => (
    <>
      <Text semibold xl>
        We're sad to see you go {'\n'}
      </Text>
      <Text>
        After unsubscribing, be sure to
        <Text
          onPress={() => props.navigation.push('TurnOffSpamBlocking')}
          highlight>
          {' '}
          turn off{' '}
        </Text>
        call blocking on your phone. None of your calls will be able to reach
        you if it's not deactivated. {'\n'}
      </Text>
      <Text>
        Running into issues and need help?{' '}
        <Text onPress={() => props.navigation.push('Help')} highlight>
          We can help.
        </Text>
      </Text>
      <Button
        title="Unsubscribe"
        style={{marginVertical: 30}}
        onPress={() =>
          Alert.alert(
            'Get Robocalls Again',
            "If you unsubscribe from Pepper, you'll start getting robocalls again. Are you sure you want to unsubscribe?",
            [
              {text: 'No', onPress: () => props.navigation.goBack()},
              {
                text: 'Yes',
                onPress: Platform.select({
                  ios: () =>
                    Linking.openURL(
                      'https://buy.itunes.apple.com/WebObjects/MZFinance.woa/wa/manageSubscriptions',
                    ),
                  android: () =>
                    Linking.openURL(
                      `https://play.google.com/store/account/subscriptions?package=com.buzzwordlabs.pepper&sku=${global.state.itemSubs[0]}`,
                    ),
                }),
              },
            ],
          )
        }
      />
      <TextButton title="Go Back" onPress={() => props.navigation.goBack()} />
    </>
  );
  return (
    <View
      style={{
        marginHorizontal: 30,
        justifyContent: 'center',
        flex: 1,
        alignItems: 'center',
      }}>
      {isSubscribed === null ? (
        <Prompt />
      ) : isSubscribed ? (
        <Unsubscribe />
      ) : (
        <Resubscribe />
      )}
    </View>
  );
};

ManageSubscription.navigationOptions = {
  title: 'Manage Subscription',
};

export default ManageSubscription;
