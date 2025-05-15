// Mock for react-native-gesture-handler
const GestureHandlerRootView = ({ children }) => {
  return { type: 'GestureHandlerRootView', props: { children } };
};

const PanGestureHandler = ({ children, onGestureEvent, ...props }) => {
  return { type: 'PanGestureHandler', props: { children, onGestureEvent, ...props } };
};

const TapGestureHandler = ({ children, onGestureEvent, ...props }) => {
  return { type: 'TapGestureHandler', props: { children, onGestureEvent, ...props } };
};

const GestureDetector = ({ children, gesture, ...props }) => {
  return { type: 'GestureDetector', props: { children, gesture, ...props } };
};

const Gesture = {
  Pan: () => ({
    onStart: () => {},
    onUpdate: () => {},
    onEnd: () => {},
    onFinalize: () => {},
  }),
  Tap: () => ({
    onStart: () => {},
    onEnd: () => {},
    onFinalize: () => {},
  }),
};

const createAnimatedComponent = (component) => {
  return component;
};

const GestureHandler = {
  GestureHandlerRootView,
  PanGestureHandler,
  TapGestureHandler,
  GestureDetector,
  Gesture,
  createAnimatedComponent,
};

module.exports = {
  ...GestureHandler,
  default: GestureHandler,
}; 