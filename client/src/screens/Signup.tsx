import React, {useContext, useState} from 'react';
import {Platform, View} from 'react-native';
import {isEmail} from 'validator';

import {
  Button,
  PasswordField,
  Text,
  TextInput,
  ParentView,
} from '../components';
import {gradientColors} from '../constants';
import {GlobalContext} from '../global/GlobalContext';
import {
  notify,
  redirectPrivacyPolicy,
  redirectTOS,
  request,
  writeCache,
  writeCacheMulti,
  getUserMetadata,
  readCacheMulti,
} from '../utils';
import {NavigationProps} from './types';

const initialState = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  isLoading: false,
};

export default function Signup(props: NavigationProps) {
  const global = useContext(GlobalContext);
  const [state, setState] = useState(initialState);

  const submitUserInfo = async () => {
    const {authToken, onboardingStep} = await readCacheMulti([
      'authToken',
      'onboardingStep',
    ]);
    if (authToken && onboardingStep) return props.navigation.push('Onboarding');
    const {firstName, lastName, email, password, isLoading} = state;
    if (
      !firstName ||
      !lastName ||
      password.length < 8 ||
      password.length > 60 ||
      !email ||
      !isEmail(email)
    ) {
      return notify(
        <Text semibold error>
          An error occurred. Are you sure your password is greater than 8 but
          less than 32 characters and your email is valid?
        </Text>,
      );
    }
    setState({...state, isLoading: true});
    const response = await request({
      url: '/auth/local/signup',
      method: 'POST',
      body: {
        firstName,
        lastName,
        password,
        email,
        platform: Platform.OS,
        ...(await getUserMetadata()),
      },
    });
    setState({...state, isLoading: false});
    if (response.ok) {
      await writeCacheMulti([
        ['authToken', response.data.token],
        ['firstName', response.data.firstName],
        ['onboardingStep', response.data.onboardingStep],
      ]);
      global.setState({isLoggedIn: true});
      const changeStepResponse = await request({
        url: '/user/onboarding/step',
        method: 'POST',
        body: {onboardingStep: 1},
      });
      if (changeStepResponse.ok) {
        await writeCache('onboardingStep', 1);
        global.setState({onboardingStep: 1});
        props.navigation.navigate('Onboarding');
      }
    } else {
      if (response.status === 409) {
        notify(
          <Text semibold error>
            That email is already taken. Did you already create an account?
          </Text>,
        );
      } else {
        notify(
          <Text semibold error>
            An unknown error occurred. Please make sure your email is valid.
          </Text>,
        );
      }
    }
  };

  return (
    <ParentView extraScrollHeight={175}>
      <View>
        <Text semibold xxl left>
          Welcome to Pepper.
        </Text>
        <TextInput
          placeholder="First Name"
          onChangeText={(firstName: string) => setState({...state, firstName})}
          value={state.firstName}
          autoCompleteType="name"
          autoCapitalize="words"
          clearButtonMode="while-editing"
        />
        <TextInput
          placeholder="Last Name"
          onChangeText={(lastName: string) => setState({...state, lastName})}
          value={state.lastName}
          autoCompleteType="name"
          autoCapitalize="words"
          clearButtonMode="while-editing"
        />
        <TextInput
          placeholder="Email address"
          onChangeText={(email: string) => setState({...state, email})}
          value={state.email}
          autoCompleteType="email"
          clearButtonMode="while-editing"
          keyboardType="email-address"
        />
        <PasswordField
          placeholder="Password (8+ Characters)"
          onChangeText={(password: string) => setState({...state, password})}
          value={state.password}
        />
        <Text muted linebreak>
          By continuing, you agree to Pepper's{' '}
          <Text onPress={redirectTOS} highlight>
            Terms & Conditions{' '}
          </Text>
          and{' '}
          <Text onPress={redirectPrivacyPolicy} highlight>
            Privacy Policy
          </Text>
        </Text>
        <Button
          loading={state.isLoading}
          gradientColors={gradientColors}
          title="Create Account"
          onPress={submitUserInfo}
          style={{marginTop: 10, width: '100%'}}
        />
      </View>
    </ParentView>
  );
}

Signup.navigationOptions = {
  title: 'Create Account',
};
