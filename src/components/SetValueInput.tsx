import React, { forwardRef } from 'react';
import { TextInput, TouchableOpacity, StyleSheet, TextInputProps } from 'react-native';

interface SetValueInputProps extends Omit<TextInputProps, 'style'> {
  value: string;
  onChangeText: (text: string) => void;
  onPress?: () => void;
  testID?: string;
}

const SetValueInput = forwardRef<TextInput, SetValueInputProps>(({
  value,
  onChangeText,
  onPress,
  testID = 'input-container',
  ...props
}, ref) => {
  return (
    <TouchableOpacity 
      testID={testID}
      style={styles.container} 
      onPress={onPress}
    >
      <TextInput
        ref={ref}
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        keyboardType="numeric"
        returnKeyType="done"
        maxLength={3}
        selectTextOnFocus
        blurOnSubmit={true}
        accessibilityRole="spinbutton"
        {...props}
      />
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 8,
    width: 70,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 41,
  },
  input: {
    fontSize: 17,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default SetValueInput; 