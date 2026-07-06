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
  const HEADER_MAX_HEIGHT = 250 + statusBarHeight; // Expanded
  const HEADER_MID_HEIGHT = 140 + statusBarHeight; // Phase 1 collapse (Search + Services)
  const HEADER_MIN_HEIGHT = 80 + statusBarHeight;  // Phase 2 collapse (Search only)

  const headerAnimatedStyle = useAnimatedStyle(() => {
    const height = interpolate(
      scrollY.value,
      [0, 60, 140],
      [HEADER_MAX_HEIGHT, HEADER_MID_HEIGHT, HEADER_MIN_HEIGHT],
      Extrapolation.CLAMP
    );

    return {
      height,
    };
  });

  const greetingAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [0, 40],
      [1, 0],
      Extrapolation.CLAMP
    );
    const scale = interpolate(
      scrollY.value,
      [0, 40],
      [1, 0.9],
      Extrapolation.CLAMP
    );

    return {
      opacity,
      transform: [{ scale }],
    };
  });

  const deliveryAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [0, 45],
      [1, 0],
      Extrapolation.CLAMP
    );

    return {
      opacity,
    };
  });

  const servicesAnimatedStyle = useAnimatedStyle(() => {
    // Stays fully visible in Phase 1, fades out in Phase 2
    const opacity = interpolate(
      scrollY.value,
      [60, 120],
      [1, 0],
      Extrapolation.CLAMP
    );

    const translateY = interpolate(
      scrollY.value,
      [0, 60, 140],
      [0, -10, -70], // Slides up slightly in Phase 1, scrolls off completely in Phase 2
      Extrapolation.CLAMP
    );

    return {
      opacity,
      transform: [{ translateY }],
    };
  });

  const searchAnimatedStyle = useAnimatedStyle(() => {
    // Search is always visible but moves slightly to align in the sticky collapsed state
    const translateY = interpolate(
      scrollY.value,
      [0, 60, 140],
      [0, -5, -12],
      Extrapolation.CLAMP
    );

    const scale = interpolate(
      scrollY.value,
      [0, 140],
      [1, 0.98],
      Extrapolation.CLAMP
    );

    return {
      transform: [{ translateY }, { scale }],
    };
  });

  return {
    scrollY,
    scrollHandler,
    headerAnimatedStyle,
    greetingAnimatedStyle,
    deliveryAnimatedStyle,
    servicesAnimatedStyle,
    searchAnimatedStyle,
    HEADER_MAX_HEIGHT,
  };
}
