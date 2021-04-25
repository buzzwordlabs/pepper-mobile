import {AsYouType} from 'libphonenumber-js';
import React, {useContext, useEffect, useState} from 'react';
import {StyleSheet, View} from 'react-native';
import {requestSubscription} from 'react-native-iap';
import {NavigationStackProp} from 'react-navigation-stack';

import {completed, filter, security, noRobots} from '../assets/images';
import {
  Button,
  ModalSelector,
  Text,
  TextInput,
  ParentView,
  Image,
} from '../components';
import {smallIos} from '../constants';
import {GlobalContext} from '../global/GlobalContext';
import {WithRequest, withRequest} from '../hoc';
import {
  getAllPermissions,
  getContacts,
  notify,
  popupPermissionsPrompt,
  readCache,
  sendCall,
  setupCallForwarding,
  validatePhoneNumber,
  writeCache,
} from '../utils';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
  },
  textInput: {
    fontFamily: 'IBMPlexSans',
  },
  text: {
    fontFamily: 'IBMPlexSans-SemiBold',
  },
  logo: {
    width: 275,
    height: 100,
    resizeMode: 'contain',
    marginBottom: 25,
  },
  mainImage: {
    width: '100%',
    height: 275,
    resizeMode: 'contain',
  },
});

interface Props extends WithRequest {
  navigation: NavigationStackProp;
}

const Onboarding = (props: Props) => {
  const global = useContext(GlobalContext);
  const [onboardingStep, setOnboardingStep] = useState(1);

  useEffect(() => {
    (async () => {
      const stateOnboardingStep = global.state.onboardingStep;
      if (!stateOnboardingStep) {
        const cacheOnboardingStep = await readCache('onboardingStep');
        setOnboardingStep(cacheOnboardingStep);
      } else {
        setOnboardingStep(stateOnboardingStep);
      }
    })();
  }, [global.state.onboardingStep]);

  const changeStep = async (newOnboardingStep: number) => {
    const response = await props.request({
      url: '/user/onboarding/step',
      method: 'POST',
      body: {
        onboardingStep: newOnboardingStep,
      },
    });
    if (response.ok) {
      await writeCache('onboardingStep', newOnboardingStep);
      global.setState({onboardingStep: newOnboardingStep});
      setOnboardingStep(newOnboardingStep);
    }
  };

  const PhoneNumberVerification = () => {
    const [number, setNumber] = useState('');
    const [showVerify, setShowVerify] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [code, setCode] = useState('');
    const submitCode = async () => {
      if (code.length === 6) {
        const validatedNumber = validatePhoneNumber(number);
        if (!validatedNumber) {
          return notify(
            <Text error>
              Your phone number is invalid. Are you sure you input a valid U.S.
              phone number?
            </Text>,
          );
        }
        setIsLoading(true);
        const response = await props.request({
          url: '/user/onboarding/phone-verify',
          method: 'POST',
          body: {
            phone: validatedNumber,
            code,
          },
        });
        setIsLoading(false);
        if (response.ok) {
          changeStep(onboardingStep + 1);
        } else {
          notify(
            <Text error semibold>
              This verification code is incorrect.
            </Text>,
          );
        }
      }
    };
    const sendPhoneNumber = async () => {
      if (number.length !== 14) {
        return notify(
          <Text error>
            Your phone number is invalid. Are you sure you input a valid U.S.
            phone number?
          </Text>,
        );
      }
      setIsLoading(true);
      let validatedNumber;
      try {
        validatedNumber = validatePhoneNumber(number);
      } catch (err) {
        return notify(
          <Text error>
            Your phone number is invalid. Are you sure you input a valid U.S.
            phone number?
          </Text>,
        );
      }
      const response = await props.request({
        url: '/user/onboarding/phone-input',
        method: 'POST',
        body: {
          phone: validatedNumber,
        },
      });
      setIsLoading(false);
      if (response.status === 409) {
        notify(
          <Text error>
            That phone number has already been used. Press "Need Help?" to get
            some assistance.
          </Text>,
        );
      } else {
        setShowVerify(true);
      }
    };
    if (!showVerify) {
      return (
        <>
          <Text xl semibold style={{marginBottom: 30}}>
            Verify Phone Number
          </Text>
          <TextInput
            maxLength={14}
            keyboardType="phone-pad"
            placeholder="Ex: (415) 123-4567"
            value={number}
            onChangeText={changedNumber =>
              setNumber(
                changedNumber.length === 4
                  ? changedNumber
                  : new AsYouType('US').input(changedNumber),
              )
            }
          />
          <Text linebreak>
            Important: Pepper requires an active internet connection and only
            works in the USA on certain carriers for now.
          </Text>
          <Text muted linebreak>
            Please see our
            <Text onPress={() => props.navigation.push('FAQ')} highlight>
              {' '}
              FAQs{' '}
            </Text>
            to learn about which carriers/countries we support, and other
            limitations with Pepper.
          </Text>
          <Text style={{marginBottom: 10}} muted>
            You should receive a text message to this number. Text message and
            data rates may apply.
          </Text>
          <Text
            style={{marginBottom: 15}}
            onPress={() => props.navigation.push('Help')}
            highlight>
            Need help?
          </Text>
          <Button
            title="Send Confirmation"
            onPress={sendPhoneNumber}
            loading={isLoading}
          />
        </>
      );
    }
    return (
      <View>
        <Text style={[styles.text, {marginBottom: 30}]} xl left>
          Phone Number Verification
        </Text>
        <TextInput
          keyboardType="phone-pad"
          placeholder="Ex: 123456"
          onChangeText={changedCode => setCode(changedCode)}
          value={code}
          maxLength={6}
        />
        <Text muted sm style={{marginBottom: 10}}>
          Please enter the 6-digit verification code received via SMS.{' '}
          <Text onPress={() => props.navigation.push('Help')} highlight left sm>
            Need help?
          </Text>
        </Text>
        <Button title="Submit Code" onPress={submitCode} loading={isLoading} />
        <Text muted md style={{marginTop: 10}}>
          Need to resend the code?{' '}
          <Text onPress={() => setShowVerify(false)} md highlight>
            Go Back
          </Text>
        </Text>
      </View>
    );
  };

  const Permissions = () => {
    const setupContactsAndPermissions = async () => {
      const {overallStatus} = await getAllPermissions();
      // If the user still didn't give us permissions, don't let them continue
      if (overallStatus !== 'granted') return popupPermissionsPrompt();
      const cleansedContacts = await getContacts();
      const response = await props.request({
        url: '/user/contacts',
        method: 'POST',
        body: {
          contacts: cleansedContacts,
        },
      });
      if (response.ok) changeStep(onboardingStep + 1);
    };
    return (
      <View
        style={{
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <Image
          source={security}
          style={styles.mainImage}
          width={styles.mainImage.width}
          height={styles.mainImage.height}
        />
        <Text lg semibold>
          Thanks for verifying your phone number!{'\n\n'}Enable some permissions
          for us so that we can make sure you get notified for incoming calls.
          {'\n\n'}
          Note: Pepper won't work if these permissions aren't enabled.{' '}
          <Text
            onPress={() => props.navigation.push('Help')}
            highlight
            lg
            semibold>
            Need help?
          </Text>
        </Text>
        <Button
          title="Give Permission"
          onPress={setupContactsAndPermissions}
          style={{marginTop: 30}}
        />
      </View>
    );
  };

  const Subscribe = () => {
    const subscribe = async () => {
      try {
        await requestSubscription(global.state.itemSubs[0]);
        changeStep(onboardingStep + 1);
      } catch (error) {}
    };
    return (
      <View>
        <Text semibold style={{marginBottom: 10}} xl>
          Subscribe
        </Text>
        <Text>
          Subscriptions are automaticaly renewed each month. Pepper only works
          in the U.S. for now.{' '}
          <Text onPress={() => props.navigation.push('Help')} highlight>
            Need help?
          </Text>
        </Text>
        <View
          style={{
            marginVertical: 10,
            paddingHorizontal: 20,
            backgroundColor: 'white',
            alignSelf: 'center',
          }}>
          <Image
            width={220}
            height={200}
            style={{
              resizeMode: 'contain',
              alignSelf: 'center',
            }}
            source={noRobots}
          />
          <Text semibold center style={{marginBottom: 10}}>
            Never get a robocall again!
          </Text>
          <Text semibold center>
            $6 per month
          </Text>
          <Text lg semibold center style={{marginVertical: 10}}>
            with a 1 week free trial
          </Text>
        </View>
        <Button title="Subscribe" onPress={subscribe} />
        <Button
          textOnly
          title="Back"
          onPress={() => props.navigation.goBack()}
        />
      </View>
    );
  };

  const Forward = () => {
    const [showDoneForward, setShowDoneForward] = useState(false);
    const [forwardingData, setForwardingData] = useState([]);

    useEffect(() => {
      (async () => {
        setForwardingData((await setupCallForwarding()) as any);
      })();
    }, []);

    return (
      <View>
        <View style={{justifyContent: 'center', alignItems: 'center'}}>
          <Image
            source={filter}
            style={styles.mainImage}
            width={styles.mainImage.width}
            height={styles.mainImage.height}
          />
          <Text lg>
            <Text lg semibold>
              Last step! You just need to forward your calls to our spam-filter.
            </Text>
            {'\n\n'}
            <Text semibold lg>
              Important:
            </Text>{' '}
            Call forwarding must be turned off if you delete the Pepper app or
            unsubscribe. All of your calls will get blocked otherwise.
            <Text
              onPress={() => props.navigation.push('Help')}
              highlight
              semibold
              lg>
              {' '}
              Need help?
            </Text>
          </Text>
        </View>
        <View
          style={{
            alignItems: 'center',
            marginVertical: 30,
          }}>
          <ModalSelector
            data={forwardingData as any}
            buttonStyle={{marginVertical: 10}}
            buttonText="Turn On Spam Blocking"
            onChange={selectedCarrier => {
              setShowDoneForward(true);
              sendCall(selectedCarrier.value);
            }}
          />
          {showDoneForward && (
            <Button
              title="Done"
              onPress={() => changeStep(onboardingStep + 1)}
              outline
              style={{marginVertical: 10}}
            />
          )}
        </View>
      </View>
    );
  };

  const Completion = () => {
    return (
      <View style={{justifyContent: 'center', alignItems: 'center'}}>
        <Image
          source={completed}
          style={styles.mainImage}
          width={styles.mainImage.width}
          height={styles.mainImage.height}
        />
        <Text linebreak lg>
          Hooray! Congrats on getting all setup.{'\n\n'}All you need to do now
          is enjoy a spam-call free life.
        </Text>
        <Text semibold lg>
          Note: If you ever need to delete the Pepper app, be sure to turn off
          call forwarding. You will stop receiving calls until you do.
        </Text>
        <Button
          title="Finish"
          onPress={async () => {
            changeStep(0);
            props.navigation.navigate('Recents');
            // Assume that contacts permissions were given
            // and send contacts to server for the first time
            const cleansedContacts = await getContacts();
            await props.request({
              url: '/user/contacts',
              method: 'POST',
              body: {
                contacts: cleansedContacts,
              },
            });
          }}
          style={{marginTop: 40}}
        />
      </View>
    );
  };

  const onboardingSteps = [
    <PhoneNumberVerification />,
    <Permissions />,
    <Subscribe />,
    <Forward />,
    <Completion />,
  ];

  const totalSteps = onboardingSteps.length;

  return (
    <ParentView style={{marginTop: 0}}>
      <Text semibold center lg linebreak>
        Step {onboardingStep}/{totalSteps}
      </Text>
      {onboardingSteps[onboardingStep - 1]}
    </ParentView>
  );
};

Onboarding.navigationOptions = {
  title: 'Onboarding',
};

export default withRequest(Onboarding);
