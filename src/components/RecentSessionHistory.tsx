import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Session } from '../db/models';
import { format } from 'date-fns';

interface RecentSessionHistoryProps {
  sessions: Session[];
}

export function RecentSessionHistory({ sessions }: RecentSessionHistoryProps) {
  const displayedSessions = sessions.slice(0, 6);

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

  const renderFooter = () => {
    if (sessions.length <= 6) return null;
    
    return (
      <TouchableOpacity style={styles.seeAllButton}>
        <Text style={styles.seeAllButtonText}>See all past sessions</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={displayedSessions}
        renderItem={renderSessionItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListFooterComponent={renderFooter}
        scrollEnabled={false}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 30,
    paddingBottom: 20,
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
  seeAllButton: {
    backgroundColor: '#101112e5',
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
    marginHorizontal: 0,
    opacity: 0.9,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  seeAllButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
}); 