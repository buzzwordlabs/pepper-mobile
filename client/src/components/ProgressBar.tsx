import React from 'react';
import {Bar} from 'react-native-progress';

import {fadedTintColor, window} from '../constants';

interface Props {
  progress: number;
  screenMargin: number;
  unfilledColor?: string;
  borderColor?: string;
}

export default function ProgressBar({
  progress,
  screenMargin,
  unfilledColor,
  borderColor,
}: Props) {
  return (
    <Bar
      progress={progress}
      width={window.width - screenMargin}
      unfilledColor={unfilledColor || fadedTintColor}
      borderColor={borderColor || 'transparent'}
    />
  );
}
