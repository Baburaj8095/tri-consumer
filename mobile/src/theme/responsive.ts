import { Dimensions, PixelRatio } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Standard design baseline (e.g. iPhone 11/13 width 375, height 812)
const BASE_WIDTH = 375;
const BASE_HEIGHT = 812;

export const responsive = {
  screenWidth: SCREEN_WIDTH,
  screenHeight: SCREEN_HEIGHT,
  
  // Percent-to-DP helper
  widthPx: (percent: number) => {
    return PixelRatio.roundToNearestPixel((SCREEN_WIDTH * percent) / 100);
  },
  
  heightPx: (percent: number) => {
    return PixelRatio.roundToNearestPixel((SCREEN_HEIGHT * percent) / 100);
  },
  
  // Linear scale based on width
  scale: (size: number) => {
    return PixelRatio.roundToNearestPixel((SCREEN_WIDTH / BASE_WIDTH) * size);
  },
  
  // Linear scale based on height
  verticalScale: (size: number) => {
    return PixelRatio.roundToNearestPixel((SCREEN_HEIGHT / BASE_HEIGHT) * size);
  },
  
  // Moderated scale (great for margins/paddings to avoid huge scaling on tablets)
  moderateScale: (size: number, factor = 0.5) => {
    const scaleValue = (SCREEN_WIDTH / BASE_WIDTH) * size;
    return PixelRatio.roundToNearestPixel(size + (scaleValue - size) * factor);
  },
  
  // Font scale helper that accounts for system accessibility scales
  scaleFont: (size: number) => {
    const scaleValue = SCREEN_WIDTH / BASE_WIDTH;
    const newSize = size * scaleValue;
    return Math.round(PixelRatio.roundToNearestPixel(newSize));
  },
};
