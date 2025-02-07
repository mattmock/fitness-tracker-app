import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export function SessionHistory() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [collapseAnim] = useState(new Animated.Value(1));

  const toggleCollapse = () => {
    Animated.timing(collapseAnim, {
      toValue: isCollapsed ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
    setIsCollapsed(!isCollapsed);
  };

  const containerHeight = collapseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '50%'],
  });

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.header}
        onPress={toggleCollapse}
        activeOpacity={0.7}
      >
        <Text style={styles.title}>Recent History</Text>
        <Ionicons 
          name={isCollapsed ? "chevron-up" : "chevron-down"} 
          size={20} 
          color="#666"
        />
      </TouchableOpacity>
      <Animated.View style={[styles.content, { height: containerHeight }]}>
        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>No recent sessions</Text>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
  },
  content: {
    overflow: 'hidden',
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#9CA3AF',
    fontSize: 16,
  },
}); 