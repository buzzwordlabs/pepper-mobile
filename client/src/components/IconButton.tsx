import React from 'react';
import {ViewStyle} from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Entypo from 'react-native-vector-icons/Entypo';
import Feather from 'react-native-vector-icons/Feather';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Text from './Text';

interface Props {
  name: string;
  size: number;
  library:
    | 'feather'
    | 'fontAwesome'
    | 'ionicon'
    | 'materialIcons'
    | 'entypo'
    | 'antdesign'
    | 'materialComIcons';
  text?: string | Element;
  backgroundColor?: string;
  iconStyle?: any;
  color?: string;
  style?: ViewStyle | ViewStyle[];
  onPress?: () => void | Promise<void>;
}

export default function Icon({
  name,
  size = 26,
  style,
  color = 'lightgray',
  library = 'ionicon',
  backgroundColor,
  iconStyle,
  onPress,
  text,
}: Props) {
  const finalStyle = [{marginBottom: -3}, style && style] as ViewStyle;
  if (library === 'feather') {
    return (
      <Feather.Button
        name={name}
        size={size}
        iconStyle={iconStyle}
        backgroundColor={backgroundColor}
        style={finalStyle}
        color={color}
        onPress={onPress && onPress}>
        <Text>{text}</Text>
      </Feather.Button>
    );
  }
  if (library === 'fontAwesome') {
    return (
      <FontAwesome.Button
        name={name}
        size={size}
        iconStyle={iconStyle}
        backgroundColor={backgroundColor}
        color={color}
        style={finalStyle}
        onPress={onPress || onPress}>
        <Text>{text}</Text>
      </FontAwesome.Button>
    );
  }
  if (library === 'materialIcons') {
    return (
      <MaterialIcons.Button
        name={name}
        size={size}
        iconStyle={iconStyle}
        backgroundColor={backgroundColor}
        color={color}
        style={finalStyle}
        onPress={onPress || onPress}>
        <Text>{text}</Text>
      </MaterialIcons.Button>
    );
  }
  if (library === 'materialComIcons') {
    return (
      <MaterialCommunityIcons.Button
        name={name}
        size={size}
        iconStyle={iconStyle}
        backgroundColor={backgroundColor}
        color={color}
        style={finalStyle}
        onPress={onPress || onPress}>
        <Text>{text}</Text>
      </MaterialCommunityIcons.Button>
    );
  }
  if (library === 'entypo') {
    return (
      <Entypo.Button
        name={name}
        size={size}
        iconStyle={iconStyle}
        backgroundColor={backgroundColor}
        color={color}
        style={finalStyle}
        onPress={onPress || onPress}>
        <Text>{text}</Text>
      </Entypo.Button>
    );
  }
  if (library === 'antdesign') {
    return (
      <AntDesign.Button
        name={name}
        iconStyle={iconStyle}
        backgroundColor={backgroundColor}
        size={size}
        color={color}
        style={finalStyle}
        onPress={onPress || onPress}>
        <Text>{text}</Text>
      </AntDesign.Button>
    );
  }
  return (
    <Ionicons.Button
      name={name}
      iconStyle={iconStyle}
      backgroundColor={backgroundColor}
      size={size}
      style={finalStyle}
      color={color}
      onPress={onPress || onPress}>
      <Text>{text}</Text>
    </Ionicons.Button>
  );
}
