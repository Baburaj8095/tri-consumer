import { WithSpringConfig } from 'react-native-reanimated';

export const animations = {
  spring: {
    damping: 15,
    mass: 1,
    stiffness: 120,
  } as WithSpringConfig,
  gentle: {
    damping: 20,
    mass: 1,
    stiffness: 90,
  } as WithSpringConfig,
  bouncy: {
    damping: 10,
    mass: 1,
    stiffness: 150,
  } as WithSpringConfig,
} as const;
