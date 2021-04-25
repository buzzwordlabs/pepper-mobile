import React, {useContext, useState} from 'react';
import {Platform, StyleSheet} from 'react-native';
import {NavigationStackProp} from 'react-navigation-stack';
import {isEmail} from 'validator';

import {pepperLogo} from '../assets/images';
import {
  Image,
  Button,
  PasswordField,
  Text,
  TextInput,
  ParentView,
} from '../components';
import {gradientColors} from '../constants';
import {GlobalContext} from '../global/GlobalContext';
import {
  getAllPermissions,
  notify,
  request,
  writeCacheMulti,
  bugsnag,
} from '../utils';

const styles = StyleSheet.create({
  inputContainer: {
    width: '100%',
    height: 50,
    marginVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'lightgrey',
    justifyContent: 'center',
  },
  input: {
    paddingRight: 10,
    paddingLeft: 5,
    paddingBottom: 5,
    height: 50,
    fontSize: 20,
  },
  logo: {
    resizeMode: 'contain',
    marginBottom: 25,
    alignSelf: 'center',
  },
  label: {
    paddingLeft: 5,
    fontSize: 14,
  },
  header: {
    fontSize: 32,
    fontWeight: '500',
    width: 260,
  },
});

interface Props {
  navigation: NavigationStackProp;
  request: any;
}

const initialState = {
  email: '',
  password: '',
  isLoading: false,
};

const Login = (props: Props) => {
  const global = useContext(GlobalContext);
  const [state, setState] = useState(initialState);
  const auth = async (email: string, password: string) => {
    if (!password || !email || !isEmail(email)) {
      return notify(
        <Text semibold error>
          It looks like one of your input are blank, or your email isn't valid.
        </Text>,
      );
    }
    setState({...state, isLoading: true});
    const response = await request({
      url: '/auth/local/login',
      method: 'POST',
      body: {
        email,
        password,
        platform: Platform.OS,
      },
    });
    setState({...state, isLoading: false});
    if (response.ok) {
      const {token, firstName, onboardingStep} = response.data;
      await writeCacheMulti([
        ['authToken', token],
        ['firstName', firstName],
        ['onboardingStep', onboardingStep],
      ]);
      const {
        blockedCalls,
        settings,
        userMetadata,
        id,
        lastName,
        email,
      } = await global.getInitData();
      bugsnag.setUser(id, `${firstName} ${lastName}`, email);
      await global.syncUserMetadata(userMetadata);
      global.setState({
        isLoggedIn: true,
        onboardingStep,
        blockedCalls,
        settings,
      });
      if (onboardingStep !== 0) return props.navigation.push('Onboarding');
      const {overallStatus} = await getAllPermissions();
      if (overallStatus === 'granted') await global.getInitialContacts();
      return props.navigation.navigate('App');
    } else {
      return notify(
        <Text semibold error>
          It looks like those credentials aren't correct. Please try again.
        </Text>,
      );
    }
  };

  return (
    <ParentView extraScrollHeight={175}>
      <Image source={pepperLogo} style={styles.logo} width={275} height={100} />
      <TextInput
        onChangeText={email => setState({...state, email})}
        value={state.email}
        placeholder="Email address"
        placeholderTextColor="gray"
        keyboardType="email-address"
      />
      <PasswordField
        onChangeText={(password: string) => setState({...state, password})}
        value={state.password}
      />
      <Text
        onPress={() => props.navigation.push('PasswordReset')}
        left
        highlight
        sm>
        Forgot password?
      </Text>
      <Button
        title="Login"
        loading={state.isLoading}
        gradientColors={gradientColors}
        onPress={() => auth(state.email, state.password)}
        style={{marginBottom: 20, marginTop: 20}}
      />
    </ParentView>
  );
};

Login.navigationOptions = {
  title: 'Login',
};

export default Login;
