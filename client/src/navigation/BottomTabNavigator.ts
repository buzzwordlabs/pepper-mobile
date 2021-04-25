import {Platform} from 'react-native';
import {createMaterialBottomTabNavigator} from 'react-navigation-material-bottom-tabs';
import {createBottomTabNavigator} from 'react-navigation-tabs';

import {tabBarColor, tabIconDefault, tabIconSelected} from '../constants';
import {
  RecentsStack,
  SettingsStack,
  VoicemailStack,
  RobocallsStack,
} from './StackNavigators';

const Stacks = {
  RecentsStack,
  RobocallsStack,
  VoicemailStack,
  SettingsStack,
};

const initialRouteName = 'RecentsStack';

const MDBottomTab = createMaterialBottomTabNavigator(Stacks, {
  initialRouteName,
  activeColor: tabIconSelected,
  inactiveColor: tabIconDefault,
  barStyle: {backgroundColor: tabBarColor},
});

const iOSBottomTab = createBottomTabNavigator(Stacks, {
  initialRouteName,
  tabBarOptions: {allowFontScaling: false},
});

export default Platform.OS === 'ios' ? iOSBottomTab : MDBottomTab;
