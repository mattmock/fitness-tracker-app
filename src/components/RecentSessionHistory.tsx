import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { GestureDetector, Gesture, GestureUpdateEvent, GestureStateChangeEvent, PanGestureHandlerEventPayload } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
  runOnJS,
} from 'react-native-reanimated';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const SNAP_POINTS = {
  COLLAPSED: 0,
  HALF: -SCREEN_HEIGHT * 0.4,
  FULL: -SCREEN_HEIGHT * 0.85
};

export function RecentSessionHistory() {
  const [position, setPosition] = useState<'collapsed' | 'half' | 'full'>('collapsed');
  const translateY = useSharedValue(0);
  const context = useSharedValue({ y: 0 });

  const snapToPosition = (newPosition: 'collapsed' | 'half' | 'full') => {
    'worklet';
    const snapPoint = 
      newPosition === 'collapsed' ? 0 :
      newPosition === 'half' ? SNAP_POINTS.HALF :
      SNAP_POINTS.FULL;

    translateY.value = withSpring(snapPoint, {
      damping: 20,
      stiffness: 300,
    });
    runOnJS(setPosition)(newPosition);
  };

  const gesture = Gesture.Pan()
    .onStart(() => {
      'worklet';
      context.value = { y: translateY.value };
    })
    .onUpdate((event: GestureUpdateEvent<PanGestureHandlerEventPayload>) => {
      'worklet';
      if (position === 'collapsed' && event.translationY > 0) return;
      
      const newY = context.value.y + event.translationY;
      if (newY <= 0 && newY >= SNAP_POINTS.FULL) {
        translateY.value = newY;
      }
    })
    .onEnd((event: GestureStateChangeEvent<PanGestureHandlerEventPayload>) => {
      'worklet';
      const velocity = event.velocityY;
      const currentPosition = translateY.value;

      // Handle swipe up from collapsed state
      if (position === 'collapsed' && event.translationY < -20) {
        snapToPosition('half');
        return;
      }

      // Handle swipe up from half state
      if (position === 'half' && event.translationY < -20) {
        snapToPosition('full');
        return;
      }

      // Handle swipe down
      if (event.translationY > 20) {
        if (position === 'full') {
          snapToPosition('half');
        } else if (position === 'half') {
          snapToPosition('collapsed');
        }
        return;
      }

      // If no clear swipe, snap back to current position
      snapToPosition(position);
    });

  const animatedStyle = useAnimatedStyle(() => {
    'worklet';
    const height = 
      position === 'collapsed' ? 90 :
      position === 'half' ? SCREEN_HEIGHT * 0.5 :
      SCREEN_HEIGHT * 0.9;

    return {
      transform: [{ translateY: translateY.value }],
      height,
    };
  });

  const contentStyle = useAnimatedStyle(() => {
    'worklet';
    const opacity = position === 'collapsed' ? 0 : 1;
    return { opacity };
  });

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View 
        style={[
          styles.container,
          animatedStyle,
          { zIndex: position === 'collapsed' ? 1 : 999 }
        ]}
      >
        <View style={styles.header}>
          <View style={styles.pullBar} />
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Recent History</Text>
          </View>
        </View>
        <Animated.View style={[styles.content, contentStyle]}>
          <Text style={styles.placeholderText}>No recent sessions</Text>
        </Animated.View>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
    paddingBottom: 34,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -3,
    },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 5,
  },
  header: {
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  titleContainer: {
    paddingHorizontal: 16,
  },
  pullBar: {
    width: 36,
    height: 5,
    backgroundColor: '#E5E7EB',
    borderRadius: 2.5,
    marginBottom: 8,
    alignSelf: 'center',
  },
  title: {
    fontSize: 34,
    fontWeight: 'bold',
    textAlign: 'left',
    marginBottom: 4,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#9CA3AF',
    fontSize: 16,
  },
}); 