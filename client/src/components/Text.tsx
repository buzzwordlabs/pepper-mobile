// eslint-disable no-param-reassign
import React, {ReactNode} from 'react';
import {Text as DefaultText, TextProps, TextStyle} from 'react-native';

import {errorText, secondaryColor, successText} from '../constants';

type EllipsizeMode = 'tail';
interface Props extends TextProps {
  onPress?: (input: any) => void;
  children: ReactNode | string;
  style?: TextStyle | TextStyle[];
  muted?: boolean;
  xs?: boolean;
  sm?: boolean;
  md?: boolean;
  lg?: boolean;
  xl?: boolean;
  xxl?: boolean;
  error?: boolean;
  success?: boolean;
  semibold?: boolean;
  bold?: boolean;
  highlight?: boolean;
  fontFamily?: string;
  fontWeight?: number | 'bold';
  left?: boolean;
  center?: boolean;
  right?: boolean;
  linebreak?: boolean;
  numberOfLines?: number;
  ellipsizeMode?: EllipsizeMode;
}

export default function Text({
  children,
  muted,
  style,
  onPress,
  xs,
  sm,
  md,
  lg,
  xl,
  xxl,
  error,
  success,
  semibold,
  bold,
  highlight,
  fontFamily,
  fontWeight,
  left,
  center,
  right,
  linebreak,
  numberOfLines,
  ellipsizeMode,
}: Props) {
  let fontSize;
  let color;
  let textAlign;
  let alignSelf;

  if (xs) fontSize = 12;
  else if (sm) fontSize = 14;
  else if (md) fontSize = 16;
  else if (lg) fontSize = 18;
  else if (xl) fontSize = 24;
  else if (xxl) fontSize = 30;
  else fontSize = 16;

  if (error) color = errorText;
  else if (success) color = successText;
  else if (muted) color = 'gray';
  else if (highlight) color = secondaryColor;
  else color = 'black';

  if (!fontFamily) fontFamily = 'IBMPlexSans';
  if (semibold) fontFamily = 'IBMPlexSans-SemiBold';
  if (bold) fontFamily = 'IBMPlexSans-Bold';

  if (left) {
    textAlign = 'left';
    alignSelf = 'flex-start';
  }
  if (center) {
    textAlign = 'center';
    alignSelf = 'center';
  }
  if (right) {
    textAlign = 'right';
    alignSelf = 'flex-end';
  }

  const finalStyle = [
    {fontSize, color, fontFamily, fontWeight, textAlign, alignSelf},
    style,
  ] as TextStyle;

  return (
    <DefaultText
      style={finalStyle}
      onPress={onPress && onPress}
      maxFontSizeMultiplier={1.25}
      numberOfLines={numberOfLines}
      ellipsizeMode={ellipsizeMode}
      suppressHighlighting>
      {children}
      {linebreak && '\n'}
    </DefaultText>
  );
}
