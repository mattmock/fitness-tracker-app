// Mock for @gorhom/bottom-sheet
const BottomSheet = ({ children, snapPoints, ...props }) => {
  return { type: 'BottomSheet', props: { children, snapPoints, ...props } };
};

const BottomSheetView = ({ children, ...props }) => {
  return { type: 'BottomSheetView', props: { children, ...props } };
};

const BottomSheetModal = ({ children, snapPoints, ...props }) => {
  return { type: 'BottomSheetModal', props: { children, snapPoints, ...props } };
};

const BottomSheetModalProvider = ({ children }) => {
  return { type: 'BottomSheetModalProvider', props: { children } };
};

const useBottomSheet = () => ({
  snapTo: () => {},
  expand: () => {},
  collapse: () => {},
  close: () => {},
  animatedIndex: { value: 0 },
  animatedPosition: { value: 0 },
});

const useBottomSheetModal = () => ({
  present: () => {},
  dismiss: () => {},
  snapTo: () => {},
});

const BottomSheetExports = {
  BottomSheet,
  BottomSheetView,
  BottomSheetModal,
  BottomSheetModalProvider,
  useBottomSheet,
  useBottomSheetModal,
};

module.exports = {
  ...BottomSheetExports,
  default: BottomSheet,
}; 