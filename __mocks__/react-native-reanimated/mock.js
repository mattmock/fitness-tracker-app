// Simple no-op mock for React Native Reanimated
const Reanimated = {
  View: ({ children, style, ...props }) => {
    return { type: 'Reanimated.View', props: { children, style, ...props } };
  },
  Text: ({ children, style, ...props }) => {
    return { type: 'Reanimated.Text', props: { children, style, ...props } };
  },
  Image: ({ source, style, ...props }) => {
    return { type: 'Reanimated.Image', props: { source, style, ...props } };
  },
  ScrollView: ({ children, style, ...props }) => {
    return { type: 'Reanimated.ScrollView', props: { children, style, ...props } };
  },
  createAnimatedComponent: (Component) => {
    return ({ children, style, ...props }) => {
      return { type: 'ReanimatedComponent', props: { children, style, ...props } };
    };
  },
  // Basic shared value mock
  useSharedValue: (initial) => ({
    value: initial,
    setValue: (value) => { this.value = value; }
  }),
  // Simple animation hooks
  withSpring: (value) => value,
  withTiming: (value) => value,
  withSequence: (...animations) => animations[animations.length - 1],
  withDelay: (delay, animation) => animation,
  // Basic worklet mock
  runOnJS: (fn) => fn
};

module.exports = Reanimated; 