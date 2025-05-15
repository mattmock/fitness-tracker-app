const Animated = {
  Value: jest.fn((value) => ({
    _value: value,
    _animation: null,
    _listeners: [],
    setValue: jest.fn((value) => {
      this._value = value;
      this._listeners.forEach(listener => listener({ value }));
    }),
    addListener: jest.fn((callback) => {
      this._listeners.push(callback);
      return this._listeners.length - 1;
    }),
    removeListener: jest.fn((id) => {
      this._listeners.splice(id, 1);
    }),
    interpolate: jest.fn(() => this),
    setOffset: jest.fn(() => this),
    flattenOffset: jest.fn(() => this),
    extractOffset: jest.fn(() => this),
    addListener: jest.fn(() => 0),
    removeListener: jest.fn(),
    removeAllListeners: jest.fn(),
    stopAnimation: jest.fn((callback) => {
      if (callback) {
        callback(this._value);
      }
    }),
    resetAnimation: jest.fn((callback) => {
      if (callback) {
        callback(this._value);
      }
    }),
  })),

  timing: jest.fn((value, config) => ({
    start: jest.fn((callback) => {
      if (config.useNativeDriver) {
        // For native driver, just call the callback immediately
        if (callback) {
          callback({ finished: true });
        }
      } else {
        // For JS driver, use setTimeout to simulate animation
        setTimeout(() => {
          value.setValue(config.toValue);
          if (callback) {
            callback({ finished: true });
          }
        }, 0);
      }
    }),
    stop: jest.fn(),
    reset: jest.fn(),
  })),

  spring: jest.fn((value, config) => ({
    start: jest.fn((callback) => {
      if (config.useNativeDriver) {
        if (callback) {
          callback({ finished: true });
        }
      } else {
        setTimeout(() => {
          value.setValue(config.toValue);
          if (callback) {
            callback({ finished: true });
          }
        }, 0);
      }
    }),
    stop: jest.fn(),
    reset: jest.fn(),
  })),

  decay: jest.fn((value, config) => ({
    start: jest.fn((callback) => {
      if (config.useNativeDriver) {
        if (callback) {
          callback({ finished: true });
        }
      } else {
        setTimeout(() => {
          value.setValue(config.toValue || 0);
          if (callback) {
            callback({ finished: true });
          }
        }, 0);
      }
    }),
    stop: jest.fn(),
    reset: jest.fn(),
  })),

  sequence: jest.fn((animations) => ({
    start: jest.fn((callback) => {
      let index = 0;
      const next = () => {
        if (index < animations.length) {
          animations[index].start(({ finished }) => {
            if (finished) {
              index++;
              next();
            }
          });
        } else if (callback) {
          callback({ finished: true });
        }
      };
      next();
    }),
    stop: jest.fn(),
    reset: jest.fn(),
  })),

  parallel: jest.fn((animations) => ({
    start: jest.fn((callback) => {
      let finishedCount = 0;
      animations.forEach(animation => {
        animation.start(({ finished }) => {
          if (finished) {
            finishedCount++;
            if (finishedCount === animations.length && callback) {
              callback({ finished: true });
            }
          }
        });
      });
    }),
    stop: jest.fn(),
    reset: jest.fn(),
  })),

  stagger: jest.fn((delay, animations) => ({
    start: jest.fn((callback) => {
      let finishedCount = 0;
      animations.forEach((animation, index) => {
        setTimeout(() => {
          animation.start(({ finished }) => {
            if (finished) {
              finishedCount++;
              if (finishedCount === animations.length && callback) {
                callback({ finished: true });
              }
            }
          });
        }, index * delay);
      });
    }),
    stop: jest.fn(),
    reset: jest.fn(),
  })),

  loop: jest.fn((animation, config) => ({
    start: jest.fn((callback) => {
      let iterations = 0;
      const maxIterations = config.iterations || -1;
      const next = () => {
        if (maxIterations === -1 || iterations < maxIterations) {
          animation.start(({ finished }) => {
            if (finished) {
              iterations++;
              next();
            }
          });
        } else if (callback) {
          callback({ finished: true });
        }
      };
      next();
    }),
    stop: jest.fn(),
    reset: jest.fn(),
  })),

  event: jest.fn(() => ({
    __isNative: true,
  })),

  add: jest.fn((a, b) => ({
    interpolate: jest.fn(() => this),
  })),

  subtract: jest.fn((a, b) => ({
    interpolate: jest.fn(() => this),
  })),

  divide: jest.fn((a, b) => ({
    interpolate: jest.fn(() => this),
  })),

  multiply: jest.fn((a, b) => ({
    interpolate: jest.fn(() => this),
  })),

  modulo: jest.fn((a, b) => ({
    interpolate: jest.fn(() => this),
  })),

  diffClamp: jest.fn((a, min, max) => ({
    interpolate: jest.fn(() => this),
  })),

  delay: jest.fn((time) => ({
    start: jest.fn((callback) => {
      setTimeout(() => {
        if (callback) {
          callback({ finished: true });
        }
      }, time);
    }),
    stop: jest.fn(),
    reset: jest.fn(),
  })),

  View: 'Animated.View',
  Text: 'Animated.Text',
  Image: 'Animated.Image',
  ScrollView: 'Animated.ScrollView',
  FlatList: 'Animated.FlatList',
  SectionList: 'Animated.SectionList',
  createAnimatedComponent: jest.fn((component) => component),
};

module.exports = {
  ...Animated,
  default: Animated,
}; 