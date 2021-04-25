import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  TextStyle,
  ViewStyle,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

import {secondaryColor, fontScale, isSmallDevice} from '../constants';
import Text from './Text';
import TouchableOpacity from './TouchableOpacity';
import {verticalScale} from 'react-native-size-matters';

const styles = StyleSheet.create({
  container: {
    height: isSmallDevice
      ? fontScale * verticalScale(50)
      : fontScale * verticalScale(40),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
    backgroundColor: secondaryColor,
    marginVertical: verticalScale(5),
    width: '100%',
  },
  outlineContainer: {
    borderWidth: 2,
    backgroundColor: 'white',
    borderColor: secondaryColor,
  },
  textOnlyContainer: {
    borderWidth: 0,
    height: verticalScale(20),
    backgroundColor: 'transparent',
  },
  text: {
    color: 'white',
    fontSize: 18,
    fontFamily: 'IBMPlexSans-SemiBold',
  },
  outlineText: {
    color: secondaryColor,
  },
  textOnlyText: {
    color: secondaryColor,
  },
  roundedContainer: {
    borderRadius: 60 / 2,
  },
  disabled: {
    opacity: 0.4,
  },
  center: {
    alignSelf: 'center',
  },
});

interface Props {
  style?: ViewStyle | ViewStyle[];
  title?: string;
  children?: React.ReactChild | string;
  textStyle?: TextStyle | TextStyle[];
  gradientColors?: string[];
  outline?: boolean;
  rounded?: boolean;
  textOnly?: boolean;
  onPress: () => any;
  center?: boolean;
  bold?: boolean;
  semibold?: boolean;
  loading?: boolean;
  disabled?: boolean;
  loadingColor?: string;
}

const Button = (props: Props) => {
  const {
    style,
    title,
    textStyle,
    children,
    gradientColors,
    outline,
    rounded,
    textOnly,
    onPress,
    center,
    bold,
    semibold,
    loading,
    disabled,
    loadingColor,
  } = props;

  const determineContainer = () => {
    const containerStyles: ViewStyle[] = [styles.container];
    if (outline) containerStyles.push(styles.outlineContainer);
    else if (textOnly) containerStyles.push(styles.textOnlyContainer);
    if (rounded) containerStyles.push(styles.roundedContainer);
    if (loading || disabled) containerStyles.push(styles.disabled);
    if (center) containerStyles.push(styles.center);
    return containerStyles;
  };

  const determineText = () => {
    const textStyles: TextStyle[] = [styles.text];
    if (outline) textStyles.push(styles.outlineText);
    else if (textOnly) textStyles.push(styles.textOnlyText);
    return textStyles;
  };

  return (
    <TouchableOpacity
      style={[...determineContainer(), style] as ViewStyle}
      onPress={loading || disabled ? () => {} : onPress}>
      {gradientColors ? (
        <LinearGradient
          colors={gradientColors || ['lightgrey', 'lightgrey']}
          style={[...determineContainer(), rounded && {borderRadius: 30}]}
          start={{x: 0, y: 0.5}}
          end={{x: 1, y: 0.5}}>
          {loading ? (
            <ActivityIndicator
              size="small"
              color={props.loadingColor || 'white'}
              animating={true}
            />
          ) : (
            <>
              <Text
                style={[...determineText(), textStyle] as TextStyle}
                bold={bold}
                semibold={semibold}
                numberOfLines={1}
                ellipsizeMode="tail">
                {title}
              </Text>
              {children}
            </>
          )}
        </LinearGradient>
      ) : loading ? (
        <ActivityIndicator
          size="small"
          color={props.loadingColor || 'white'}
          animating={true}
        />
      ) : (
        <Text
          style={[...determineText(), textStyle] as TextStyle}
          numberOfLines={1}
          ellipsizeMode="tail">
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

export default Button;
