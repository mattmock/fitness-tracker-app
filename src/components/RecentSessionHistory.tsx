import React, { useCallback, useRef } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { Session } from '../db/models';
import { format } from 'date-fns';

interface RecentSessionHistoryProps {
  sessions: Session[];
}

export function RecentSessionHistory({ sessions }: RecentSessionHistoryProps) {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = ['10%', '50%', '85%'];

  const renderSessionItem = ({ item }: { item: Session }) => {
    const date = new Date(item.startTime);
    const formattedDate = format(date, 'MMM d, yyyy');
    const formattedTime = format(date, 'h:mm a');

    return (
      <View style={styles.sessionItem}>
        <View style={styles.sessionHeader}>
          <Text style={styles.sessionDate}>{formattedDate}</Text>
          <Text style={styles.sessionTime}>{formattedTime}</Text>
        </View>
        <Text style={styles.exerciseCount}>
          {item.sessionExercises.length} exercise{item.sessionExercises.length !== 1 ? 's' : ''}
        </Text>
      </View>
    );
  };

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={0}
      snapPoints={snapPoints}
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
        <FlatList
          data={sessions}
          renderItem={renderSessionItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
        />
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
  listContent: {
    paddingHorizontal: 30,
  },
  sessionItem: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  sessionDate: {
    fontSize: 16,
    fontWeight: '600',
  },
  sessionTime: {
    fontSize: 16,
    color: '#666',
  },
  exerciseCount: {
    fontSize: 14,
    color: '#666',
  },
}); 