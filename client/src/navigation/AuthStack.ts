import {createStackNavigator} from 'react-navigation-stack';
import {fromRight} from 'react-navigation-transitions';

import {
  FAQ,
  Help,
  Intro,
  Login,
  Onboarding,
  PasswordReset,
  PasswordResetCode,
  PasswordResetNew,
  Signup,
} from '../screens';
import {defaultHeaderStyle, defaultHeaderTitleStyle} from './NavigatorStyles';

const defaultStyles = {
  headerTitleStyle: defaultHeaderTitleStyle,
  headerStyle: defaultHeaderStyle,
};

const AuthStack = createStackNavigator(
  {
    Intro: {
      screen: Intro,
      navigationOptions: {
        ...defaultStyles,
        headerBackTitle: 'Back',
      },
    },
    Login: {
      screen: Login,
      navigationOptions: {
        ...defaultStyles,
      },
    },
    FAQ: {
      screen: FAQ,
      navigationOptions: {
        ...defaultStyles,
      },
    },
    Help: {
      screen: Help,
      navigationOptions: {
        ...defaultStyles,
      },
    },
    Onboarding: {
      screen: Onboarding,
      navigationOptions: {
        ...defaultStyles,
      },
    },
    Signup: {
      screen: Signup,
      navigationOptions: {
        ...defaultStyles,
      },
    },
    PasswordReset: {
      screen: PasswordReset,
      navigationOptions: {
        ...defaultStyles,
      },
    },
    PasswordResetCode: {
      screen: PasswordResetCode,
      navigationOptions: {
        ...defaultStyles,
      },
    },
    PasswordResetNew: {
      screen: PasswordResetNew,
      navigationOptions: {
        ...defaultStyles,
      },
    },
  },
  {
    initialRouteName: 'Intro',
    transitionConfig: () => fromRight(),
  },
);

export default AuthStack;
