import React from 'react';
import {
  StyleSheet,
  TextInput as DefaultTextInput,
  TextInputProps,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';

import Text from './Text';

interface Props extends TextInputProps {
  inputContainerStyle?: ViewStyle;
  label?: string;
  labelText?: string;
  labelStyle?: TextStyle | TextStyle[];
  textInputStyle?: TextStyle | TextStyle[];
  textbox?: boolean;
  warn?: boolean;
  icon?: (() => Element) | Element;
}

const TextInput = (props: Props) => {
  const {
    inputContainerStyle,
    label,
    labelText,
    labelStyle,
    placeholder,
    placeholderTextColor,
    value,
    textInputStyle,
    onChangeText,
    autoCompleteType,
    autoCapitalize,
    autoFocus,
    clearButtonMode,
    maxLength,
    secureTextEntry,
    warn,
    keyboardType,
    textbox,
    icon,
  } = props;

  const styles = StyleSheet.create({
    inputContainer: {
      width: '100%',
      height: 50,
      marginVertical: 20,
      borderBottomWidth: 1,
      borderBottomColor: warn ? 'red' : 'lightgrey',
      justifyContent: 'center',
    },
    textBoxInputContainer: {
      width: '100%',
      marginVertical: 20,
      flex: 1,
    },
    input: {
      paddingRight: 10,
      paddingLeft: 5,
      paddingBottom: 5,
      height: 50,
      flex: 1,
      fontSize: 18,
      fontFamily: 'IBMPlexSans',
      color: 'black',
    },
    textBoxInput: {
      fontSize: 18,
      fontFamily: 'IBMPlexSans',
    },
    label: {
      paddingLeft: 5,
      fontSize: 14,
    },
    errorText: {
      fontSize: 14,
      color: 'red',
    },
  });

  if (!textbox) {
    return (
      <View style={[styles.inputContainer, inputContainerStyle]}>
        {label && (
          <Text style={[styles.label, labelStyle] as TextStyle}>
            {labelText}
          </Text>
        )}
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <DefaultTextInput
            style={[styles.input, textInputStyle]}
            onChangeText={onChangeText}
            value={value}
            placeholder={placeholder || 'Placeholder Text'}
            placeholderTextColor={placeholderTextColor || 'gray'}
            autoCompleteType={autoCompleteType}
            autoCapitalize={autoCapitalize || 'none'}
            autoFocus={autoFocus || false}
            clearButtonMode={clearButtonMode || 'never'}
            maxLength={maxLength || 60}
            secureTextEntry={secureTextEntry || false}
            keyboardType={keyboardType || 'default'}
            maxFontSizeMultiplier={1.25}
          />
          {icon && icon}
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.textBoxInputContainer, inputContainerStyle]}>
      {label && (
        <Text style={[styles.label, labelStyle] as TextStyle}>{labelText}</Text>
      )}
      <DefaultTextInput
        style={[styles.textBoxInput, textInputStyle]}
        onChangeText={onChangeText}
        value={value}
        placeholder={placeholder || 'Placeholder Text'}
        placeholderTextColor={placeholderTextColor || 'gray'}
        autoCapitalize={autoCapitalize}
        autoFocus={autoFocus || false}
        clearButtonMode={clearButtonMode || 'never'}
        maxLength={maxLength || 20000}
        multiline
        keyboardType={keyboardType || 'default'}
        maxFontSizeMultiplier={1.25}
      />
    </View>
  );
};

export default TextInput;
