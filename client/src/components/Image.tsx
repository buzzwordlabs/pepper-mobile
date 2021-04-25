import React from 'react';
import {Image as DefaultImage, ImageProps} from 'react-native';
import {scale, verticalScale, moderateScale} from 'react-native-size-matters';

// @ts-ignore
interface Props extends ImageProps {
  width: number | string;
  height: number;
}

export default function Image(props: Props) {
  const {width, height} = props;
  return (
    // @ts-ignore
    <DefaultImage
      {...props}
      style={[
        {
          width: width === '100%' ? '100%' : verticalScale(width as number),
          height: verticalScale(height),
        },
        props.style,
      ]}
    />
  );
}
