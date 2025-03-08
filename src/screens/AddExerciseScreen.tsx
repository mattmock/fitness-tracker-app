import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BackButton } from '../components';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useDatabaseContext } from '../db';
import { EXERCISE_CATEGORIES } from '../db/dev/utils/devExerciseUtils';
import { Ionicons } from '@expo/vector-icons';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export function AddExerciseScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { exerciseService } = useDatabaseContext();
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleSave = async () => {
    try {
      if (!name.trim()) {
        // TODO: Show error message
        return;
      }

      await exerciseService.create({
        id: Date.now().toString(),
        name: name.trim(),
        category: category || undefined,
        description: description.trim() || undefined,
      });

      navigation.goBack();
    } catch (error) {
      console.error('Failed to create exercise:', error);
      // TODO: Show error message
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.headerContainer}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <BackButton onPress={handleBackPress} />
            <Text style={styles.headerText}>New Exercise</Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.form}>
          <View style={styles.field}>
            <Text style={styles.label}>Name</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Exercise name"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Category</Text>
            <TouchableOpacity 
              style={styles.dropdownButton}
              onPress={() => setShowCategoryDropdown(true)}
            >
              <Text style={[
                styles.dropdownButtonText,
                !category && styles.dropdownButtonPlaceholder
              ]}>
                {category || 'Select a category'}
              </Text>
              <Ionicons name="chevron-down" size={20} color="#666" />
            </TouchableOpacity>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Exercise description (optional)"
              placeholderTextColor="#999"
              multiline
              numberOfLines={4}
            />
          </View>
        </View>
      </ScrollView>

      <SafeAreaView edges={['bottom']} style={styles.bottomContainer}>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={handleSave}
        >
          <Text style={styles.addButtonText}>Add Exercise</Text>
        </TouchableOpacity>
      </SafeAreaView>

      <Modal
        visible={showCategoryDropdown}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCategoryDropdown(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowCategoryDropdown(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Category</Text>
              <TouchableOpacity 
                onPress={() => setShowCategoryDropdown(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalList}>
              {EXERCISE_CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.modalItem,
                    category === cat && styles.modalItemActive
                  ]}
                  onPress={() => {
                    setCategory(cat);
                    setShowCategoryDropdown(false);
                  }}
                >
                  <Text style={[
                    styles.modalItemText,
                    category === cat && styles.modalItemTextActive
                  ]}>
                    {cat}
                  </Text>
                  {category === cat && (
                    <Ionicons name="checkmark" size={20} color="#007AFF" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerContainer: {
    backgroundColor: '#fff',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerText: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  form: {
    padding: 16,
  },
  field: {
    marginBottom: 24,
  },
  label: {
    fontSize: 17,
    fontWeight: '500',
    marginBottom: 8,
    color: '#000',
  },
  input: {
    backgroundColor: '#f0f0f0',
    padding: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    fontSize: 17,
    minHeight: 48,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f0f0f0',
    padding: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    minHeight: 48,
  },
  dropdownButtonText: {
    fontSize: 17,
    color: '#000',
  },
  dropdownButtonPlaceholder: {
    color: '#999',
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  addButton: {
    backgroundColor: '#101112e5',
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    width: '75%',
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
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  closeButton: {
    padding: 8,
  },
  modalList: {
    maxHeight: 400,
  },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalItemActive: {
    backgroundColor: '#f8f8f8',
  },
  modalItemText: {
    fontSize: 17,
    color: '#000',
  },
  modalItemTextActive: {
    color: '#007AFF',
    fontWeight: '500',
  },
}); 