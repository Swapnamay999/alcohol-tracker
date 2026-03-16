import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { useDrinkStore } from '../store/useDrinkStore';
import { addUser, getAllUsers } from '../utils/database';

export default function ProfileScreen() {
  const { activeUserId, setActiveUser, showToast } = useDrinkStore();

  const [users, setUsers] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);

  // Form State for new user
  const [nameInput, setNameInput] = useState('');
  const [heightInput, setHeightInput] = useState('');
  const [weightInput, setWeightInput] = useState('');
  const [ageInput, setAgeInput] = useState('');
  const [sexInput, setSexInput] = useState<'Male' | 'Female'>('Male');

  // Load existing users from SQLite on mount
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = () => {
    try {
      const dbUsers = getAllUsers();
      setUsers(dbUsers);
      // Force the form open if the database is completely empty
      if (dbUsers.length === 0) setShowForm(true);
    } catch (error) {
      console.error("Failed to load users:", error);
    }
  };

  const handleSelectUser = (user: any) => {
    setActiveUser(
      user.id, 
      user.name, 
      user.height.toString(), 
      user.weight.toString(), 
      user.age.toString(), 
      user.sex
    );
    showToast(`Active profile switched to ${user.name}`);
    router.push('/'); // Bounce back to dashboard
  };

  const handleSaveNewUser = () => {
    if (!nameInput || !heightInput || !weightInput || !ageInput) {
      showToast('Please fill out all physiological metrics.');
      return;
    }

    try {
      // 1. Save to SQLite
      const newId = addUser(
        nameInput.trim(),
        parseFloat(heightInput),
        parseFloat(weightInput),
        parseInt(ageInput, 10),
        sexInput
      );

      showToast(`Profile for ${nameInput} created securely.`);

      // 2. Clear form
      setNameInput('');
      setHeightInput('');
      setWeightInput('');
      setAgeInput('');
      setSexInput('Male');
      setShowForm(false);

      // 3. Refresh list and automatically log them in
      fetchUsers();
      setActiveUser(newId, nameInput, heightInput, weightInput, ageInput, sexInput);
      router.push('/');

    } catch (error) {
      showToast('Error saving profile. Name might already exist.');
      console.error(error);
    }
  };

  return (
    <ScrollView style={styles.container}>
      
      {/* HEADER & TOGGLE */}
      <View style={styles.headerRow}>
        <Text style={styles.headerTitle}>User Physiology</Text>
        {users.length > 0 && (
          <TouchableOpacity 
            style={styles.toggleBtn} 
            onPress={() => setShowForm(!showForm)}
          >
            <Text style={styles.toggleBtnText}>
              {showForm ? 'Cancel' : '+ New Profile'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* NEW USER FORM */}
      {showForm ? (
        <View style={styles.formContainer}>
          <Text style={styles.label}>Name / Alias:</Text>
          <TextInput style={styles.input} placeholder="e.g. Swapnamay" placeholderTextColor="#666" value={nameInput} onChangeText={setNameInput} />

          <Text style={styles.label}>Height (cm):</Text>
          <TextInput style={styles.input} keyboardType="numeric" placeholder="175" placeholderTextColor="#666" value={heightInput} onChangeText={setHeightInput} />
          
          <Text style={styles.label}>Weight (kg):</Text>
          <TextInput style={styles.input} keyboardType="numeric" placeholder="70" placeholderTextColor="#666" value={weightInput} onChangeText={setWeightInput} />

          <Text style={styles.label}>Age:</Text>
          <TextInput style={styles.input} keyboardType="numeric" placeholder="25" placeholderTextColor="#666" value={ageInput} onChangeText={setAgeInput} />

          <Text style={styles.label}>Biological Sex (for Watson TBW distribution):</Text>
          <View style={styles.toggleRow}>
            <TouchableOpacity style={[styles.sexToggle, sexInput === 'Male' && styles.sexSelected]} onPress={() => setSexInput('Male')}>
              <Text style={[styles.sexText, sexInput === 'Male' && styles.textSelected]}>Male</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.sexToggle, sexInput === 'Female' && styles.sexSelected]} onPress={() => setSexInput('Female')}>
              <Text style={[styles.sexText, sexInput === 'Female' && styles.textSelected]}>Female</Text>
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity style={styles.saveBtn} onPress={handleSaveNewUser}>
            <Text style={styles.saveBtnText}>Save Profile</Text>
          </TouchableOpacity>
        </View>
      ) : (
        /* USER SELECTION LIST */
        <View style={styles.listContainer}>
          <Text style={styles.subHeader}>Select Active Profile</Text>
          {users.map((user) => {
            const isActive = activeUserId === user.id;
            return (
              <TouchableOpacity 
                key={user.id} 
                style={[styles.userCard, isActive && styles.userCardActive]}
                onPress={() => handleSelectUser(user)}
              >
                <View>
                  <Text style={[styles.userName, isActive && styles.textSelected]}>{user.name}</Text>
                  <Text style={styles.userDetails}>
                    {user.age} yrs • {user.height}cm • {user.weight}kg • {user.sex}
                  </Text>
                </View>
                {isActive && <Text style={styles.activeBadge}>ACTIVE</Text>}
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000', padding: 20 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
  headerTitle: { color: '#FFF', fontSize: 24, fontWeight: 'bold' },
  toggleBtn: { backgroundColor: '#1A331A', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: '#00FF00' },
  toggleBtnText: { color: '#00FF00', fontWeight: 'bold' },
  
  formContainer: { backgroundColor: '#111', padding: 20, borderRadius: 12, borderWidth: 1, borderColor: '#333' },
  label: { color: '#A0A0A0', fontSize: 14, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 },
  input: { backgroundColor: '#242424', color: '#FFF', padding: 15, borderRadius: 8, marginBottom: 20, fontSize: 16 },
  
  toggleRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30 },
  sexToggle: { flex: 1, padding: 15, backgroundColor: '#242424', marginHorizontal: 5, borderRadius: 8, alignItems: 'center', borderWidth: 2, borderColor: 'transparent' },
  sexSelected: { borderColor: '#00FF00', backgroundColor: '#1A331A' },
  sexText: { color: '#A0A0A0', fontSize: 16, fontWeight: 'bold' },
  textSelected: { color: '#00FF00' },
  
  saveBtn: { backgroundColor: '#00FF00', padding: 18, borderRadius: 12, alignItems: 'center' },
  saveBtnText: { color: '#000', fontSize: 18, fontWeight: 'bold' },

  listContainer: { marginTop: 10 },
  subHeader: { color: '#666', fontSize: 16, marginBottom: 15, textTransform: 'uppercase', letterSpacing: 1 },
  userCard: { backgroundColor: '#242424', padding: 20, borderRadius: 12, marginBottom: 15, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderLeftWidth: 6, borderLeftColor: '#444' },
  userCardActive: { borderLeftColor: '#00FF00', backgroundColor: '#1A221A' },
  userName: { color: '#FFF', fontSize: 20, fontWeight: 'bold', marginBottom: 4 },
  userDetails: { color: '#A0A0A0', fontSize: 14 },
  activeBadge: { backgroundColor: '#00FF00', color: '#000', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, fontSize: 12, fontWeight: 'bold', overflow: 'hidden' }
});