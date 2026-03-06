import React, { useState } from 'react';
import { ScrollView, View, Text, Button, StyleSheet, TextInput } from 'react-native';
import { useDrinkStore } from '../store/useDrinkStore';

export default function DrinkLoggerScreen() {
  const addDrink = useDrinkStore((state) => state.addDrink);
  
  // Local component state for our input forms
  const [drinkType, setDrinkType] = useState('Rum');
  const [volume, setVolume] = useState('60'); // Default to Bara Peg (60ml)
  const [abv, setAbv] = useState('42.8'); // Standard IMFL ABV
  const [count, setCount] = useState('1');

  const handleLogDrink = () => {
    addDrink(drinkType, parseFloat(volume), parseFloat(abv), parseInt(count));
    alert(`${count}x ${drinkType} logged successfully.`);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Log New Beverage</Text>
        
        <Text style={styles.label}>Beverage Type (e.g., Rum, Beer, Vodka):</Text>
        <TextInput style={styles.input} value={drinkType} onChangeText={setDrinkType} />

        <Text style={styles.label}>Volume per drink (ml):</Text>
        <TextInput style={styles.input} keyboardType="numeric" value={volume} onChangeText={setVolume} />

        <Text style={styles.label}>Alcohol by Volume (%):</Text>
        <TextInput style={styles.input} keyboardType="numeric" value={abv} onChangeText={setAbv} />

        <Text style={styles.label}>Number of Drinks/Shots:</Text>
        <TextInput style={styles.input} keyboardType="numeric" value={count} onChangeText={setCount} />

        <Button title="Log Consumption" color="#00FF00" onPress={handleLogDrink} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000', padding: 10 },
  card: { backgroundColor: '#242424', padding: 20, borderRadius: 10, marginTop: 10 },
  title: { color: '#FFF', fontSize: 20, fontWeight: 'bold', marginBottom: 15 },
  label: { color: '#A0A0A0', marginBottom: 5, marginTop: 10 },
  input: { backgroundColor: '#000', color: '#FFF', padding: 10, borderRadius: 5, borderWidth: 1, borderColor: '#333' }
});