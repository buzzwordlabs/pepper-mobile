import React, {useState} from 'react';
import {Platform} from 'react-native';

import Icon from './Icon';
import TextInput from './TextInput';

interface Props {
  value: string;
  onChangeText: (text: string) => void | Promise<void>;
  placeholder?: string;
  placeholderTextColor?: string;
}

export default function PasswordField(props: Props) {
  const [showPassword, setShowPassword] = useState(false);
  const renderIcon = () => {
    if (showPassword) {
      return Platform.select({
        ios: <PasswordFieldIcon name="ios-eye-off" />,
        android: <PasswordFieldIcon name="md-eye-off" />,
      });
    } else {
      return Platform.select({
        ios: <PasswordFieldIcon name="ios-eye" />,
        android: <PasswordFieldIcon name="md-eye" />,
      });
    }
  };

  const PasswordFieldIcon = ({name}: {name: string}) => {
    return (
      <Icon
        library="ionicon"
        name={name}
        color="gray"
        size={20}
        style={{marginHorizontal: 10}}
        onPress={() => setShowPassword(!showPassword)}
      />
    );
  };

  return (
    <TextInput
      onChangeText={props.onChangeText}
      value={props.value}
      placeholder={props.placeholder || 'Password'}
      placeholderTextColor={props.placeholderTextColor || 'gray'}
      secureTextEntry={!showPassword}
      autoCompleteType="password"
      clearButtonMode="while-editing"
      maxLength={32}
      icon={renderIcon()}
    />
  );
}
