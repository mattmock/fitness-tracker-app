import React, { useCallback, useRef, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { BottomSheetContext } from './BottomSheetContext';

interface PastSessionBottomSheetProps {
  children: React.ReactNode;
  initialSnapPoints?: (string | number)[];
  initialTitle?: string;
}

export function PastSessionBottomSheet({ 
  children, 
  initialSnapPoints = ['10%', '45%'],
  initialTitle = 'Recent History'
}: PastSessionBottomSheetProps) {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const [snapPoints, setSnapPoints] = useState<(string | number)[]>(initialSnapPoints);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [title, setTitle] = useState(initialTitle);

  const handleSheetChanges = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  // Context value
  const contextValue = React.useMemo(() => ({
    setTitle: (newTitle: string) => setTitle(newTitle),
    setSnapPoints: (newPoints: (string | number)[]) => {
      setSnapPoints(newPoints);
      // Reset to initial position when snap points change
      bottomSheetRef.current?.snapToIndex(0);
    },
    snapToIndex: (index: number) => bottomSheetRef.current?.snapToIndex(index),
    currentTitle: title,
    currentIndex,
    isExpanded: currentIndex > 0
  }), [title, currentIndex]);

  return (
    <BottomSheetContext.Provider value={contextValue}>
      <BottomSheet
        ref={bottomSheetRef}
        index={0}
        snapPoints={snapPoints}
        onChange={handleSheetChanges}
        enablePanDownToClose={false}
        handleStyle={styles.handle}
        handleIndicatorStyle={styles.indicator}
        backgroundStyle={styles.background}
        style={styles.bottomSheet}
      >
        <BottomSheetView style={styles.contentContainer}>
          <View style={styles.header}>
            <View style={styles.titleContainer}>
              <Text style={styles.title}>{title}</Text>
            </View>
          </View>
          {children}
        </BottomSheetView>
      </BottomSheet>
    </BottomSheetContext.Provider>
  );
}

const styles = StyleSheet.create({
  bottomSheet: {
    zIndex: 1000,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
  },
  contentContainer: {
    flex: 1,
  },
  handle: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 12,
    paddingBottom: 8,
    zIndex: 1000,
  },
  indicator: {
    width: 36,
    height: 5,
    backgroundColor: '#E5E7EB',
    borderRadius: 2.5,
  },
  background: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  header: {
    paddingTop: 4,
    paddingBottom: 8,
    backgroundColor: '#fff',
  },
  titleContainer: {
    paddingHorizontal: 30,
    paddingBottom: 25,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
}); 