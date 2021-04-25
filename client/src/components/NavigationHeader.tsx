import React from 'react';
import {Keyboard, TouchableOpacity} from 'react-native';
import Text from './Text';

interface Props {
  children: React.ReactChild;
  onPress?: () => void;
  ref?: any;
  scrollOnPress?: boolean;
}

const NavigationHeader = ({
  children,
  onPress,
  ref,
  scrollOnPress = false,
}: Props) => {
  const scrollToTop = () => {
    ref.scrollTo({x: 0, y: 0, animated: true});
  };
  let handler;
  if (onPress) handler = onPress;
  else if (scrollOnPress) handler = scrollToTop;
  else {
    handler = Keyboard.dismiss;
  }
  return (
    <TouchableOpacity onPress={handler}>
      <Text semibold lg>
        {children}
      </Text>
    </TouchableOpacity>
  );
};

export default NavigationHeader;
