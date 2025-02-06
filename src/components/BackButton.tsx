import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

interface BackButtonProps {
  label?: string;
}

export function BackButton({ label = 'Back' }: BackButtonProps) {
  const navigation = useNavigation();

  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={() => navigation.goBack()}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
      <Ionicons name="chevron-back" size={24} color="#007AFF" />
      <Text style={styles.text}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  text: {
    color: '#007AFF',
    fontSize: 17,
    marginLeft: -4,
  },
}); 