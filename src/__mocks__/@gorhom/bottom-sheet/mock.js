import React from 'react';

const BottomSheet = ({ children, snapPoints, onChange, index }) => {
  return <div data-testid="bottom-sheet">{children}</div>;
};

const BottomSheetView = ({ children }) => {
  return <div data-testid="bottom-sheet-view">{children}</div>;
};

const BottomSheetBackdrop = ({ children }) => {
  return <div data-testid="bottom-sheet-backdrop">{children}</div>;
};

const BottomSheetModal = ({ children, snapPoints, onChange, index }) => {
  return <div data-testid="bottom-sheet-modal">{children}</div>;
};

const BottomSheetScrollView = ({ children }) => {
  return <div data-testid="bottom-sheet-scroll-view">{children}</div>;
};

const BottomSheetTextInput = ({ children }) => {
  return <div data-testid="bottom-sheet-text-input">{children}</div>;
};

const BottomSheetFlatList = ({ children }) => {
  return <div data-testid="bottom-sheet-flat-list">{children}</div>;
};

const BottomSheetSectionList = ({ children }) => {
  return <div data-testid="bottom-sheet-section-list">{children}</div>;
};

const BottomSheetCloseButton = ({ children }) => {
  return <div data-testid="bottom-sheet-close-button">{children}</div>;
};

const BottomSheetHandle = ({ children }) => {
  return <div data-testid="bottom-sheet-handle">{children}</div>;
};

const BottomSheetFooter = ({ children }) => {
  return <div data-testid="bottom-sheet-footer">{children}</div>;
};

const BottomSheetHeader = ({ children }) => {
  return <div data-testid="bottom-sheet-header">{children}</div>;
};

const BottomSheetBackground = ({ children }) => {
  return <div data-testid="bottom-sheet-background">{children}</div>;
};

const BottomSheetDragHandle = ({ children }) => {
  return <div data-testid="bottom-sheet-drag-handle">{children}</div>;
};

const BottomSheetGestureHandler = ({ children }) => {
  return <div data-testid="bottom-sheet-gesture-handler">{children}</div>;
};

const BottomSheetTouchableOpacity = ({ children }) => {
  return <div data-testid="bottom-sheet-touchable-opacity">{children}</div>;
};

const BottomSheetTouchableHighlight = ({ children }) => {
  return <div data-testid="bottom-sheet-touchable-highlight">{children}</div>;
};

const BottomSheetTouchableWithoutFeedback = ({ children }) => {
  return <div data-testid="bottom-sheet-touchable-without-feedback">{children}</div>;
};

const BottomSheetPressable = ({ children }) => {
  return <div data-testid="bottom-sheet-pressable">{children}</div>;
};

const BottomSheetText = ({ children }) => {
  return <div data-testid="bottom-sheet-text">{children}</div>;
};

const BottomSheetImage = ({ children }) => {
  return <div data-testid="bottom-sheet-image">{children}</div>;
};

const BottomSheetImageBackground = ({ children }) => {
  return <div data-testid="bottom-sheet-image-background">{children}</div>;
};

const BottomSheetKeyboardAvoidingView = ({ children }) => {
  return <div data-testid="bottom-sheet-keyboard-avoiding-view">{children}</div>;
};

const BottomSheetModalProvider = ({ children }) => <div data-testid="bottom-sheet-modal-provider">{children}</div>;

export default BottomSheet;

export {
  BottomSheet,
  BottomSheetView,
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
  BottomSheetTextInput,
  BottomSheetFlatList,
  BottomSheetSectionList,
  BottomSheetCloseButton,
  BottomSheetHandle,
  BottomSheetFooter,
  BottomSheetHeader,
  BottomSheetBackground,
  BottomSheetDragHandle,
  BottomSheetGestureHandler,
  BottomSheetTouchableOpacity,
  BottomSheetTouchableHighlight,
  BottomSheetTouchableWithoutFeedback,
  BottomSheetPressable,
  BottomSheetText,
  BottomSheetImage,
  BottomSheetImageBackground,
  BottomSheetKeyboardAvoidingView,
  BottomSheetModalProvider,
}; 