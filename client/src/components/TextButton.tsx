import React, {ReactNode} from 'react';
import {TouchableOpacity, ViewStyle, TextStyle} from 'react-native';
import {tintColor} from '../constants';
import Text from './Text';

interface FProps {
  onPress: () => void;
  containerStyle?: ViewStyle;
  textStyle?: TextStyle;
  title: ReactNode | string;
}

const TextButton = ({onPress, containerStyle, textStyle, title}: FProps) => (
  <TouchableOpacity onPress={onPress} style={[containerStyle]}>
    <Text semibold lg style={[{color: tintColor}, textStyle] as TextStyle}>
      {title}
    </Text>
  </TouchableOpacity>
);

export default TextButton;
