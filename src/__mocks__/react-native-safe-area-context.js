import React from 'react';

const SafeAreaView = ({ children }) => children;
const useSafeAreaInsets = () => ({ top: 0, right: 0, bottom: 0, left: 0 });

module.exports = {
  SafeAreaView,
  useSafeAreaInsets,
  default: SafeAreaView,
}; 