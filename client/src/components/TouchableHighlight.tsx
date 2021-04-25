import React, {ReactNode} from 'react';
import {
  TouchableHighlight as DefaultTouchableHighlight,
  ViewStyle,
} from 'react-native';
import {underlayColor as constantUnderlayColor} from '../constants';

interface Props {
  onPress: () => void;
  activeOpacity?: number;
  onHideUnderlay?: () => void;
  onShowUnderlay?: () => void;
  style?: ViewStyle;
  underlayColor?: string;
  children?: string | ReactNode;
}

const TouchableHighlight = ({
  onPress,
  activeOpacity,
  onHideUnderlay,
  onShowUnderlay,
  style,
  underlayColor,
  children,
}: Props) => {
  return (
    <DefaultTouchableHighlight
      style={style}
      onPress={onPress}
      activeOpacity={activeOpacity || 0.8}
      underlayColor={underlayColor || constantUnderlayColor}
      onHideUnderlay={onHideUnderlay}
      onShowUnderlay={onShowUnderlay}>
      {children}
    </DefaultTouchableHighlight>
  );
};

export default TouchableHighlight;
