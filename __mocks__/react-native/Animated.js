// Mock for React Native's Animated module
class Value {
  constructor(value) {
    this._value = value;
    this._listeners = [];
  }

  setValue(value) {
    this._value = value;
    this._listeners.forEach(listener => listener({ value }));
  }

  getValue() {
    return this._value;
  }

  addListener(callback) {
    this._listeners.push(callback);
    return this._listeners.length;
  }

  removeListener(id) {
    this._listeners.splice(id - 1, 1);
  }

  removeAllListeners() {
    this._listeners = [];
  }

  resetAnimation() {
    // No-op for testing
  }
}

const View = ({ children, ...props }) => {
  return { type: 'Animated.View', props: { children, ...props } };
};

const Text = ({ children, ...props }) => {
  return { type: 'Animated.Text', props: { children, ...props } };
};

const Image = ({ ...props }) => {
  return { type: 'Animated.Image', props };
};

const ScrollView = ({ children, ...props }) => {
  return { type: 'Animated.ScrollView', props: { children, ...props } };
};

const createAnimatedComponent = (component) => {
  return component;
};

const timing = (value, config) => {
  return {
    start: (callback) => {
      if (callback) {
        callback({ finished: true });
      }
    },
    stop: () => {},
  };
};

const spring = (value, config) => {
  return {
    start: (callback) => {
      if (callback) {
        callback({ finished: true });
      }
    },
    stop: () => {},
  };
};

const parallel = (animations) => {
  return {
    start: (callback) => {
      if (callback) {
        callback({ finished: true });
      }
    },
    stop: () => {},
  };
};

const sequence = (animations) => {
  return {
    start: (callback) => {
      if (callback) {
        callback({ finished: true });
      }
    },
    stop: () => {},
  };
};

const Animated = {
  Value,
  View,
  Text,
  Image,
  ScrollView,
  createAnimatedComponent,
  timing,
  spring,
  parallel,
  sequence,
};

module.exports = {
  ...Animated,
  default: Animated,
}; 