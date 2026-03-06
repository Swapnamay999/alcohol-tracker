import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import { useDrinkStore } from '../store/useDrinkStore';

export default function ProfileScreen() {
  const { userHeight, userWeight, setUserProfile } = useDrinkStore();
  const [heightInput, setHeightInput] = useState(userHeight);
  const [weightInput, setWeightInput] = useState(userWeight);

  const handleSave = () => {
    setUserProfile(heightInput, weightInput);
    alert('Physiology profile saved securely.');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Height (cm):</Text>
      <TextInput 
        style={styles.input} 
        keyboardType="numeric" 
        value={heightInput} 
        onChangeText={setHeightInput} 
      />
      
      <Text style={styles.label}>Weight (kg):</Text>
      <TextInput 
        style={styles.input} 
        keyboardType="numeric" 
        value={weightInput} 
        onChangeText={setWeightInput} 
      />
      
      <Button title="Save Metrics" color="#00FF00" onPress={handleSave} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000', padding: 20 },
  label: { color: '#A0A0A0', fontSize: 16, marginBottom: 5 },
  input: { backgroundColor: '#242424', color: '#FFF', padding: 15, borderRadius: 8, marginBottom: 20 }
});