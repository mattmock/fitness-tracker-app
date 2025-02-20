import React from 'react';
import { View } from 'react-native';

const MockIonicons = ({ testID, name, size, color }: any) => {
  return <View testID={testID} style={{ width: size, height: size, backgroundColor: color }} />;
};

export default MockIonicons; 