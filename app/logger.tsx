import React, { useState } from 'react';
import { ScrollView, View, Text, Button, StyleSheet, TouchableOpacity, Modal, TextInput } from 'react-native';
import { useDrinkStore } from '../store/useDrinkStore';

import { router } from 'expo-router';

export default function DrinkLoggerScreen() {
  const { addDrink, presets, addPreset, updatePreset, resetPresets, showToast } = useDrinkStore();

  const [selectedDrink, setSelectedDrink] = useState(presets[0]);
  const [count, setCount] = useState(1);

  // Modal State
  const [isModalVisible, setModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Form State
  const [formId, setFormId] = useState('');
  const [formName, setFormName] = useState('');
  const [formType, setFormType] = useState('');
  const [formVolume, setFormVolume] = useState('');
  const [formAbv, setFormAbv] = useState('');
  const [formIcon, setFormIcon] = useState('🍹');

  const handleLogDrink = () => {
    addDrink(selectedDrink.type, selectedDrink.volumeMl, selectedDrink.abv, count);
    showToast(`${count}x ${selectedDrink.name} logged securely.`);
    setCount(1);
  };

  const openAddModal = () => {
    setIsEditing(false);
    setFormId(Date.now().toString()); // Generate unique ID
    setFormName('');
    setFormType('Custom');
    setFormVolume('');
    setFormAbv('');
    setFormIcon('🍹');
    setModalVisible(true);
  };

  const openEditModal = (drink: any) => {
    setIsEditing(true);
    setFormId(drink.id);
    setFormName(drink.name);
    setFormType(drink.type);
    setFormVolume(drink.volumeMl.toString());
    setFormAbv(drink.abv.toString());
    setFormIcon(drink.icon);
    setModalVisible(true);
  };

  const savePreset = () => {
    const presetData = {
      id: formId,
      name: formName,
      type: formType,
      volumeMl: parseFloat(formVolume),
      abv: parseFloat(formAbv),
      icon: formIcon
    };

    if (isEditing) {
      updatePreset(formId, presetData);
      if (selectedDrink.id === formId) setSelectedDrink(presetData);
    } else {
      addPreset(presetData);
    }
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Select Beverage</Text>

      <View style={styles.carouselContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {presets.map((drink) => {
            const isSelected = selectedDrink?.id === drink.id;
            return (
              <TouchableOpacity
                key={drink.id}
                style={[styles.presetCard, isSelected && styles.presetCardSelected]}
                onPress={() => setSelectedDrink(drink)}
                onLongPress={() => openEditModal(drink)} // Trigger Edit
                delayLongPress={500}
              >
                <Text style={styles.presetIcon}>{drink.icon}</Text>
                <Text style={[styles.presetName, isSelected && styles.textSelected]}>{drink.name}</Text>
                <Text style={styles.presetDetails}>{drink.volumeMl}ml • {drink.abv}%</Text>
              </TouchableOpacity>
            );
          })}

          {/* Add Custom Drink Card */}
          <TouchableOpacity style={styles.addCard} onPress={openAddModal}>
            <Text style={styles.addIcon}>+</Text>
            <Text style={styles.presetName}>Add Custom</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      <View style={styles.actionCard}>
        <Text style={styles.selectedTitle}>{selectedDrink?.name || 'Select a drink'}</Text>
        <View style={styles.counterRow}>
          <TouchableOpacity style={styles.counterButton} onPress={() => setCount(Math.max(1, count - 1))}>
            <Text style={styles.counterButtonText}>-</Text>
          </TouchableOpacity>
          <Text style={styles.counterValue}>{count}</Text>
          <TouchableOpacity style={styles.counterButton} onPress={() => setCount(count + 1)}>
            <Text style={styles.counterButtonText}>+</Text>
          </TouchableOpacity>
        </View>
        <Button title={`Log ${count} Drink(s)`} color="#00FF00" onPress={handleLogDrink} disabled={!selectedDrink} />
      </View>

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.push('/')}
      >
        <Text style={styles.backButtonText}>Dashboard</Text>
      </TouchableOpacity>

      {/* Edit / Add Modal */}
      <Modal visible={isModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{isEditing ? 'Edit Preset' : 'Create Custom Drink'}</Text>

            <TextInput style={styles.input} placeholder="Name (e.g., Craft IPA)" placeholderTextColor="#666" value={formName} onChangeText={setFormName} />
            <TextInput style={styles.input} placeholder="Icon (e.g., 🍺)" placeholderTextColor="#666" value={formIcon} onChangeText={setFormIcon} />
            <TextInput style={styles.input} placeholder="Volume in ml (e.g., 330)" placeholderTextColor="#666" keyboardType="numeric" value={formVolume} onChangeText={setFormVolume} />
            <TextInput style={styles.input} placeholder="ABV % (e.g., 6.5)" placeholderTextColor="#666" keyboardType="numeric" value={formAbv} onChangeText={setFormAbv} />

            <View style={styles.modalButtons}>
              <Button title="Cancel" color="#FF4444" onPress={() => setModalVisible(false)} />
              <Button title="Save" color="#00FF00" onPress={savePreset} />
            </View>

            {/* Global Reset Button */}
            <TouchableOpacity style={styles.resetButton} onPress={() => { resetPresets(); setModalVisible(false); }}>
              <Text style={styles.resetText}>Reset All to Factory Defaults</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  // ... (keep previous styles: container, headerTitle, carouselContainer, presetCard, presetCardSelected, presetIcon, presetName, presetDetails, textSelected, actionCard, selectedTitle, counterRow, counterButton, counterButtonText, counterValue)
  container: { flex: 1, backgroundColor: '#000000', paddingVertical: 20 },
  headerTitle: { color: '#FFF', fontSize: 22, fontWeight: 'bold', paddingHorizontal: 20, marginBottom: 15 },
  carouselContainer: { height: 160, marginBottom: 20 },
  presetCard: { backgroundColor: '#242424', padding: 15, borderRadius: 12, marginHorizontal: 10, width: 140, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'transparent' },
  presetCardSelected: { borderColor: '#00FF00', backgroundColor: '#1A331A' },
  presetIcon: { fontSize: 40, marginBottom: 10 },
  presetName: { color: '#FFF', fontSize: 14, fontWeight: 'bold', textAlign: 'center' },
  presetDetails: { color: '#A0A0A0', fontSize: 12, marginTop: 5 },
  textSelected: { color: '#00FF00' },
  actionCard: { backgroundColor: '#242424', marginHorizontal: 20, padding: 20, borderRadius: 12, alignItems: 'center' },
  selectedTitle: { color: '#FFF', fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
  counterRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  counterButton: { backgroundColor: '#333', width: 50, height: 50, borderRadius: 25, alignItems: 'center', justifyContent: 'center' },
  counterButtonText: { color: '#FFF', fontSize: 24, fontWeight: 'bold' },
  counterValue: { color: '#FFF', fontSize: 32, fontWeight: 'bold', marginHorizontal: 30 },

  // New Styles
  addCard: { backgroundColor: '#111', padding: 15, borderRadius: 12, marginHorizontal: 10, width: 140, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#333', borderStyle: 'dashed' },
  addIcon: { color: '#666', fontSize: 40, marginBottom: 10 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#242424', padding: 20, borderRadius: 15 },
  modalTitle: { color: '#FFF', fontSize: 20, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
  input: { backgroundColor: '#000', color: '#FFF', padding: 12, borderRadius: 8, marginBottom: 10, borderWidth: 1, borderColor: '#333' },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  resetButton: { marginTop: 20, padding: 10, alignItems: 'center', borderTopWidth: 1, borderTopColor: '#333' },
  resetText: { color: '#FF4444', fontSize: 14 },
  backButton: { padding: 18, borderRadius: 12, alignItems: 'center', marginTop: 10, backgroundColor: '#00FF00', width: '90%', alignSelf: 'center' },
  backButtonText: { color: 'white', fontSize: 18, fontWeight: 'bold' }
});