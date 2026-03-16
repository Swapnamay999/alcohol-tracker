import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity } from 'react-native';
import { useDrinkStore } from '../store/useDrinkStore';

export default function ProfileScreen() {
  const { userHeight, userWeight, userAge, userSex, setUserProfile } = useDrinkStore();
  
  const [heightInput, setHeightInput] = useState(userHeight);
  const [weightInput, setWeightInput] = useState(userWeight);
  const [ageInput, setAgeInput] = useState(userAge);
  const [sexInput, setSexInput] = useState<'Male' | 'Female'>(userSex || 'Male');

  const handleSave = () => {
    setUserProfile(heightInput, weightInput, ageInput, sexInput);
    alert('Full physiological profile saved securely.');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Biological Metrics for Watson TBW</Text>

      <Text style={styles.label}>Height (cm):</Text>
      <TextInput style={styles.input} keyboardType="numeric" value={heightInput} onChangeText={setHeightInput} />
      
      <Text style={styles.label}>Weight (kg):</Text>
      <TextInput style={styles.input} keyboardType="numeric" value={weightInput} onChangeText={setWeightInput} />

      <Text style={styles.label}>Age:</Text>
      <TextInput style={styles.input} keyboardType="numeric" value={ageInput} onChangeText={setAgeInput} />

      <Text style={styles.label}>Biological Sex (for physiological water distribution):</Text>
      <View style={styles.toggleRow}>
        <TouchableOpacity 
          style={[styles.toggleButton, sexInput === 'Male' && styles.toggleSelected]} 
          onPress={() => setSexInput('Male')}
        >
          <Text style={[styles.toggleText, sexInput === 'Male' && styles.textSelected]}>Male</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.toggleButton, sexInput === 'Female' && styles.toggleSelected]} 
          onPress={() => setSexInput('Female')}
        >
          <Text style={[styles.toggleText, sexInput === 'Female' && styles.textSelected]}>Female</Text>
        </TouchableOpacity>
      </View>
      
      <Button title="Save Metrics" color="#00FF00" onPress={handleSave} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000', padding: 20 },
  header: { color: '#FFF', fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
  label: { color: '#A0A0A0', fontSize: 16, marginBottom: 5 },
  input: { backgroundColor: '#242424', color: '#FFF', padding: 15, borderRadius: 8, marginBottom: 20 },
  toggleRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30 },
  toggleButton: { flex: 1, padding: 15, backgroundColor: '#242424', marginHorizontal: 5, borderRadius: 8, alignItems: 'center' },
  toggleSelected: { borderColor: '#00FF00', borderWidth: 2, backgroundColor: '#1A331A' },
  toggleText: { color: '#A0A0A0', fontSize: 16 },
  textSelected: { color: '#00FF00', fontWeight: 'bold' }
});