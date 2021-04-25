import React, {ReactNode} from 'react';
import {
  TouchableOpacity as DefaultTouchableOpacity,
  ViewStyle,
} from 'react-native';
import Text from './Text';

interface Props {
  style: ViewStyle;
  activeOpacity?: number;
  onPress: () => void | null | undefined;
  children: ReactNode | Text;
}

const TouchableOpacity = ({
  style,
  activeOpacity = 0.2,
  onPress,
  children,
}: Props) => {
  return (
    <DefaultTouchableOpacity
      style={style}
      activeOpacity={activeOpacity}
      onPress={onPress}>
      {children}
    </DefaultTouchableOpacity>
  );
};

export default TouchableOpacity;
