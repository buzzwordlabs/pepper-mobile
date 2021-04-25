import React, {ReactNode} from 'react';
import {Platform} from 'react-native';
import Toast, {ToastOptions} from 'react-native-root-toast';
import {Header} from 'react-navigation-stack';
import {statusBarHeight, fontScale} from '../constants';
interface PepperToastOptions extends ToastOptions {
  containerStyle: any;
}

const toastOptions: PepperToastOptions = {
  duration: 6000,
  position: Platform.select({
    ios: Header.HEIGHT + statusBarHeight / 2,
    android: Header.HEIGHT,
  }),
  shadow: false,
  shadowColor: 'gray',
  animation: true,
  hideOnPress: true,
  delay: 0,
  textColor: 'black',
  opacity: 1,
  containerStyle: {
    backgroundColor: 'white',
    justifyContent: 'center',
    width: '100%',
    borderWidth: 1,
    borderColor: 'lightgray',
    borderRadius: 0,
  },
  textStyle: {fontFamily: 'IBMPlexSans', textAlign: 'left'},
};

const notify = (message: string | Element, options = {}) => {
  const finalOptions: PepperToastOptions = {
    visible: true,
    ...toastOptions,
    containerStyle: {
      ...toastOptions.containerStyle,
      height: 70 * (fontScale > 1 ? 1.7 : 1),
    },
    ...options,
  };
  Toast.show(message as string, finalOptions);
};

export {notify, toastOptions};
