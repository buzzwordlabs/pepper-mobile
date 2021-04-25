import {createAppContainer, createSwitchNavigator} from 'react-navigation';

import {Loading} from '../screens';
import AuthStack from './AuthStack';
import BottomTabNavigator from './BottomTabNavigator';

export default createAppContainer(
  createSwitchNavigator(
    {
      App: BottomTabNavigator,
      Auth: AuthStack,
      Loading,
    },
    {
      initialRouteName: 'Loading',
    },
  ),
);
