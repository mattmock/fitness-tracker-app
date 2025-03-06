import React from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';

export const MockBackButton = ({ onPress }: { onPress: () => void }) => {
  return (
    <TouchableOpacity testID="back-button" onPress={onPress}>
      <View />
    </TouchableOpacity>
  );
};

export const MockExerciseTypeCard = ({ 
  title, 
  exerciseCount, 
  selectedCount, 
  onPress 
}: { 
  title: string; 
  exerciseCount: number; 
  selectedCount?: number; 
  onPress: () => void;
}) => {
  return (
    <TouchableOpacity 
      testID={`exercise-type-${title}`}
      onPress={onPress}
    >
      <Text>{title}</Text>
      <Text>Exercise Count: {exerciseCount}</Text>
      <Text>Selected Count: {selectedCount}</Text>
    </TouchableOpacity>
  );
};

export const MockSearchInput = ({ onChangeText }: { onChangeText: (text: string) => void }) => {
  return (
    <TextInput
      testID="search-input"
      placeholder="Search"
      onChangeText={onChangeText}
    />
  );
};

export const MockTabButton = ({ 
  title, 
  onPress, 
  isActive 
}: { 
  title: string; 
  onPress: () => void;
  isActive: boolean;
}) => {
  return (
    <TouchableOpacity
      testID={`${title.toLowerCase()}-tab`}
      onPress={onPress}
      accessibilityRole="tab"
      accessibilityState={{ selected: isActive }}
    >
      <Text>{title}</Text>
    </TouchableOpacity>
  );
}; 