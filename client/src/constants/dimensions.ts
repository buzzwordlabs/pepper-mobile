import {Dimensions} from 'react-native';
import {Header} from 'react-navigation-stack';
import {getStatusBarHeight} from 'react-native-status-bar-height';
import {getModel} from 'react-native-device-info';

const window = Dimensions.get('window');
// Height of iPhone XS
const isSmallDevice = window.height < 812;
const statusBarHeight = getStatusBarHeight();
const stackHeaderHeight = Header.HEIGHT;
const topOffset = statusBarHeight + stackHeaderHeight;
const smallIos = [
  'iPhone 6s',
  'iPhone 6',
  'iPhone 8',
  'iPhone 7',
  'iPhone 7s',
  'iPhone SE',
].includes(getModel());

const hasIOSNotch = [
  'iPhone 11 Pro',
  'iPhone 11 Pro Max',
  'iPhone XS',
  'iPhone X',
  'iPhone 11',
  'iPhone 11 Xʀ',
].includes(getModel());
const bottomOffset = hasIOSNotch ? 20 : 0;

export {
  window,
  isSmallDevice,
  statusBarHeight,
  stackHeaderHeight,
  topOffset,
  smallIos,
  bottomOffset,
};
