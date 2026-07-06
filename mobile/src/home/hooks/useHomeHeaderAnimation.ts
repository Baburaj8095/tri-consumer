import {
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function useHomeHeaderAnimation() {
  const insets = useSafeAreaInsets();
  const scrollY = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  // Base heights
  const statusBarHeight = insets.top;
  const HEADER_MAX_HEIGHT = 244 + statusBarHeight; // Expanded height to fit all content
  const HEADER_MIN_HEIGHT = 56 + statusBarHeight;  // Option 1: Compact single-row height

  const headerAnimatedStyle = useAnimatedStyle(() => {
    const height = interpolate(
      scrollY.value,
      [0, 100],
      [HEADER_MAX_HEIGHT, HEADER_MIN_HEIGHT],
      Extrapolation.CLAMP
    );

    return {
      height,
    };
  });

  const expandedHeaderAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [0, 80],
      [1, 0],
      Extrapolation.CLAMP
    );

    return {
      opacity,
    };
  });

  const compactHeaderAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [70, 100],
      [0, 1],
      Extrapolation.CLAMP
    );

    return {
      opacity,
    };
  });

  return {
    scrollY,
    scrollHandler,
    headerAnimatedStyle,
    expandedHeaderAnimatedStyle,
    compactHeaderAnimatedStyle,
    HEADER_MAX_HEIGHT,
    HEADER_MIN_HEIGHT,
  };
}

