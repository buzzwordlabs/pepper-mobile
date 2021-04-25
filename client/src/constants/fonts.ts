import {window} from './dimensions';

const FONT_SCALE_MAX = 1.5;
const FONT_SCALE_MIN = 1;
const initFontScale = window.fontScale;

let fontScale: number;

if (initFontScale > FONT_SCALE_MAX) {
  fontScale = 1.25;
} else if (initFontScale < FONT_SCALE_MIN) {
  fontScale = 1.0;
} else fontScale = initFontScale;

export {fontScale};
