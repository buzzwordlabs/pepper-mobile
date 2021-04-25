import React from 'react';
import {Platform} from 'react-native';
import {createStackNavigator} from 'react-navigation-stack';
import {fromRight} from 'react-navigation-transitions';

import {TabBarIcon} from '../components';
import {
  FAQ,
  Feedback,
  Help,
  ManageSubscription,
  Recents,
  Sandbox,
  Settings,
  TurnOffSpamBlocking,
  TurnOnSpamBlocking,
  Voicemail,
  RecordGreeting,
  Robocalls,
} from '../screens';
import {defaultHeaderStyle, defaultHeaderTitleStyle} from './NavigatorStyles';

const defaultStyles = {
  headerTitleStyle: defaultHeaderTitleStyle,
  headerStyle: defaultHeaderStyle,
};

const RecentsStack = createStackNavigator(
  {
    Recents: {
      screen: Recents,
      navigationOptions: {
        ...defaultStyles,
        headerBackTitle: 'Recents',
      },
    },
  },
  {
    initialRouteName: 'Recents',
    transitionConfig: () => fromRight(),
    navigationOptions: {
      tabBarLabel: 'Recents',
      tabBarIcon: ({focused}: {focused: boolean}) => (
        <TabBarIcon
          library={Platform.OS === 'android' ? 'materialIcons' : 'ionicon'}
          focused={focused}
          name={Platform.OS === 'android' ? 'access-time' : 'ios-time'}
        />
      ),
    },
  },
);
const RobocallsStack = createStackNavigator(
  {
    Robocalls: {
      screen: Robocalls,
      navigationOptions: {
        ...defaultStyles,
        headerBackTitle: 'Robocalls',
      },
    },
  },
  {
    initialRouteName: 'Robocalls',
    transitionConfig: () => fromRight(),
    navigationOptions: {
      tabBarLabel: 'Robocalls',
      tabBarIcon: ({focused}: {focused: boolean}) => (
        <TabBarIcon library="materialComIcons" focused={focused} name="robot" />
      ),
    },
  },
);

const SettingsStack = createStackNavigator(
  {
    Settings: {
      screen: Settings,
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
    RecordGreeting: {
      screen: RecordGreeting,
      navigationOptions: {
        ...defaultStyles,
      },
    },
    TurnOffSpamBlocking: {
      screen: TurnOffSpamBlocking,
      navigationOptions: {
        ...defaultStyles,
      },
    },
    TurnOnSpamBlocking: {
      screen: TurnOnSpamBlocking,
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
    Feedback: {
      screen: Feedback,
      navigationOptions: {
        ...defaultStyles,
      },
    },
    ManageSubscription: {
      screen: ManageSubscription,
      navigationOptions: {
        ...defaultStyles,
      },
    },
  },
  {
    initialRouteName: 'Settings',
    transitionConfig: () => fromRight(),
    navigationOptions: {
      tabBarLabel: 'Settings',
      tabBarIcon: ({focused}: {focused: boolean}) => (
        <TabBarIcon focused={focused} name="ios-settings" library="ionicon" />
      ),
      drawerLabel: 'Settings',
    },
  },
);

const VoicemailStack = createStackNavigator(
  {
    Voicemail: {
      screen: Voicemail,
      navigationOptions: {
        ...defaultStyles,
      },
    },
  },
  {
    initialRouteName: 'Voicemail',
    transitionConfig: () => fromRight(),
    navigationOptions: {
      tabBarLabel: 'Voicemail',
      tabBarIcon: ({focused}: {focused: boolean}) => (
        <TabBarIcon
          style={{width: 28}}
          library="feather"
          focused={focused}
          name="voicemail"
        />
      ),
    },
  },
);

const SandboxStack = createStackNavigator(
  {
    Sandbox,
  },
  {
    initialRouteName: 'Sandbox',
    transitionConfig: () => fromRight(),
    navigationOptions: {
      tabBarLabel: 'Sandbox',
      tabBarIcon: ({focused}: {focused: boolean}) => (
        <TabBarIcon focused={focused} name="box" library="feather" />
      ),
    },
  },
);

export {
  RecentsStack,
  SettingsStack,
  SandboxStack,
  VoicemailStack,
  RobocallsStack,
};
