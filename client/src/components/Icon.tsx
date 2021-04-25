import React from 'react';
import {ViewStyle} from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Entypo from 'react-native-vector-icons/Entypo';
import Feather from 'react-native-vector-icons/Feather';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {fontScale} from '../constants';

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
  color?: string;
  style?: ViewStyle | ViewStyle[];
  onPress?: () => void | Promise<void>;
}

export default function Icon({
  name,
  size = 26 * fontScale,
  style,
  color = 'lightgray',
  library = 'ionicon',
  onPress,
}: Props) {
  const finalStyle = [{marginBottom: -3}, style && style] as ViewStyle;
  const finalSize = size * fontScale;
  if (library === 'feather') {
    return (
      <Feather
        name={name}
        size={finalSize}
        style={finalStyle}
        color={color}
        onPress={onPress && onPress}
      />
    );
  }
  if (library === 'fontAwesome') {
    return (
      <FontAwesome
        name={name}
        size={finalSize}
        color={color}
        style={finalStyle}
        onPress={onPress || onPress}
      />
    );
  }
  if (library === 'materialIcons') {
    return (
      <MaterialIcons
        name={name}
        size={finalSize}
        color={color}
        style={finalStyle}
        onPress={onPress || onPress}
      />
    );
  }
  if (library === 'materialComIcons') {
    return (
      <MaterialCommunityIcons
        name={name}
        size={finalSize}
        color={color}
        style={finalStyle}
        onPress={onPress || onPress}
      />
    );
  }
  if (library === 'entypo') {
    return (
      <Entypo
        name={name}
        size={finalSize}
        color={color}
        style={finalStyle}
        onPress={onPress || onPress}
      />
    );
  }
  if (library === 'antdesign') {
    return (
      <AntDesign
        name={name}
        size={finalSize}
        color={color}
        style={finalStyle}
        onPress={onPress || onPress}
      />
    );
  }
  return (
    <Ionicons
      name={name}
      size={finalSize}
      style={finalStyle}
      color={color}
      onPress={onPress || onPress}
    />
  );
}
