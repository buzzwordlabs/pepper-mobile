import React from 'react';
import {ViewStyle} from 'react-native';

import {tabIconDefault, tabIconSelected} from '../constants';
import Icon from './Icon';

interface Props {
  name: string;
  size?: number;
  focused: boolean;
  library:
    | 'feather'
    | 'fontAwesome'
    | 'ionicon'
    | 'materialIcons'
    | 'materialComIcons';
  style?: ViewStyle;
}

const TabBarIcon: React.FunctionComponent<Props> = props => {
  return (
    <Icon
      name={props.name}
      size={props.size || 26}
      style={[{marginBottom: -3}, props.style] as ViewStyle}
      color={props.focused ? tabIconSelected : tabIconDefault}
      library={props.library}
    />
  );
};

export default TabBarIcon;
