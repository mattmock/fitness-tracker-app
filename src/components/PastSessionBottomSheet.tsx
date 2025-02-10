import React, { useCallback, useRef, useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { Session } from '../db/models';
import { RecentSessionHistory } from './RecentSessionHistory';

interface PastSessionBottomSheetProps {
  sessions: Session[];
}

export function PastSessionBottomSheet({ sessions }: PastSessionBottomSheetProps) {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['10%', '45%', '85%'], []);
  const [isExpanded, setIsExpanded] = React.useState(false);

  const handleSheetChanges = useCallback((index: number) => {
    setIsExpanded(index > 0);
  }, []);

  return (
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
            <Text style={styles.title}>Recent History</Text>
          </View>
        </View>
        <RecentSessionHistory sessions={sessions} />
      </BottomSheetView>
    </BottomSheet>
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