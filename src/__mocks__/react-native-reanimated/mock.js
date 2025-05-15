import React from 'react';

// Mock components
const Animated = {
  View: ({ children, style, ...props }) => <div data-testid="animated-view" style={style} {...props}>{children}</div>,
  Text: ({ children, style, ...props }) => <div data-testid="animated-text" style={style} {...props}>{children}</div>,
  TouchableOpacity: ({ children, style, ...props }) => <div data-testid="animated-touchable" style={style} {...props}>{children}</div>,
  FlatList: ({ data, renderItem, keyExtractor, contentContainerStyle, ListFooterComponent, scrollEnabled, showsVerticalScrollIndicator }) => (
    <div data-testid="animated-flatlist" style={contentContainerStyle}>
      {data.map((item, index) => (
        <div key={keyExtractor(item)}>
          {renderItem({ item, index })}
        </div>
      ))}
      {ListFooterComponent && <ListFooterComponent />}
    </div>
  ),
};

// Mock hooks
const useSharedValue = (initial) => {
  const value = { value: initial };
  const listeners = new Set();
  
  return {
    value,
    addListener: (callback) => {
      listeners.add(callback);
      return () => listeners.delete(callback);
    },
    removeListener: (callback) => listeners.delete(callback),
    __getValue: () => value.value,
    __setValue: (newValue) => {
      value.value = newValue;
      listeners.forEach(callback => callback(newValue));
    },
  };
};

const withTiming = (toValue, config, callback) => {
  if (callback) callback(toValue);
  return toValue;
};

const withSpring = (toValue, config, callback) => {
  if (callback) callback(toValue);
  return toValue;
};

const withSequence = (...animations) => {
  return animations[animations.length - 1];
};

const withDelay = (delay, animation) => {
  return animation;
};

const withRepeat = (animation, numberOfReps, reverse) => animation;

const cancelAnimation = () => {};

const runOnJS = (fn) => fn;

const Easing = {
  linear: (t) => t,
  ease: (t) => t,
  quad: (t) => t * t,
  cubic: (t) => t * t * t,
  poly: (t) => t * t * t * t,
  sin: (t) => Math.sin(t * Math.PI / 2),
  circle: (t) => 1 - Math.sqrt(1 - t * t),
  exp: (t) => Math.pow(2, 10 * (t - 1)),
  elastic: (t) => t,
  back: (t) => t,
  bounce: (t) => t,
};

export const useAnimatedProps = (props) => {
  const safeProps = props || {};
  const result = {
    ...safeProps,
    __getValueWithStaticProps: () => ({
      props: safeProps,
      allowlist: Object.keys(safeProps)
    })
  };
  return result;
};

const useAnimatedStyle = (style) => {
  return style;
};

const useAnimatedReaction = (prepare, react, deps) => {
  // No-op in tests
};

const useAnimatedScrollHandler = (handlers) => {
  return handlers;
};

const useAnimatedGestureHandler = (handlers) => {
  return handlers;
};

const useAnimatedRef = () => {
  return { current: null };
};

const useAnimatedSensor = (sensorType, config) => {
  return {
    sensor: { value: 0 },
    unregister: () => {},
  };
};

const useAnimatedKeyboard = () => {
  return {
    height: { value: 0 },
    state: { value: 0 },
  };
};

const useAnimatedScrollView = () => {
  return {
    scrollTo: () => {},
    scrollToOffset: () => {},
  };
};

const useAnimatedFlatList = () => {
  return {
    scrollToIndex: () => {},
    scrollToOffset: () => {},
  };
};

const useAnimatedSectionList = () => {
  return {
    scrollToLocation: () => {},
  };
};

const Reanimated = {
  ...Animated,
  useSharedValue,
  withTiming,
  withSpring,
  withSequence,
  withDelay,
  withRepeat,
  cancelAnimation,
  runOnJS,
  Easing,
  useAnimatedProps,
  useAnimatedStyle,
  useAnimatedReaction,
  useAnimatedScrollHandler,
  useAnimatedGestureHandler,
  useAnimatedRef,
  useAnimatedSensor,
  useAnimatedKeyboard,
  useAnimatedScrollView,
  useAnimatedFlatList,
  useAnimatedSectionList,
  createAnimatedComponent: (Component) => Component,
  interpolate: (value, input, output) => output[0],
  Extrapolate: {
    CLAMP: 'clamp',
    EXTEND: 'extend',
    IDENTITY: 'identity',
  },
};

module.exports = {
  ...Reanimated,
  default: Reanimated,
}; 