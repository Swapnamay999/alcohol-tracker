import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useDrinkStore } from '../store/useDrinkStore';
import { calculateBAC } from '../utils/bacCalculator';
import LiquidFill from '../components/LiquidFill'; // Import the new component

export default function DashboardScreen() {
  const { drinksLogged, userHeight, userWeight, userAge, userSex } = useDrinkStore();
  const [currentBac, setCurrentBac] = useState(0.000);

  useEffect(() => {
    const updateBac = () => {
      const bac = calculateBAC(
        drinksLogged, 
        parseFloat(userHeight), 
        parseFloat(userWeight), 
        parseFloat(userAge), 
        userSex
      );
      setCurrentBac(bac);
    };

    updateBac(); 
    const interval = setInterval(updateBac, 60000); 
    
    return () => clearInterval(interval);
  }, [drinksLogged, userHeight, userWeight, userAge, userSex]);

  let zoneText = "Sober / Baseline";
  let themeColor = "#00FF00"; 
  let warningMessage = "You are currently within safe limits.";

  if (currentBac >= 0.01 && currentBac <= 0.05) {
    zoneText = "Social Zone";
    themeColor = "#00BFFF"; 
    warningMessage = "Mild relaxation. Safe, but alcohol is present.";
  } else if (currentBac > 0.05 && currentBac <= 0.10) {
    zoneText = "Impaired Zone";
    themeColor = "#FFBF00"; 
    warningMessage = "Motor skills and judgment are noticeably impaired. Do not drive.";
  } else if (currentBac > 0.10 && currentBac <= 0.20) {
    zoneText = "Risky Zone";
    themeColor = "#FF4444"; 
    warningMessage = "Significant intoxication. Loss of physical control. Seek water and stop drinking.";
  } else if (currentBac > 0.20) {
    zoneText = "Danger / Toxicity";
    themeColor = "#8B0000"; 
    warningMessage = "CRITICAL: Severe risk of alcohol poisoning, blackout, or loss of consciousness.";
  }

  const isProfileComplete = userHeight && userWeight && userAge;

  return (
    <ScrollView style={styles.container}>
      {!isProfileComplete ? (
        <View style={styles.warningCard}>
          <Text style={styles.warningTitle}>Profile Incomplete</Text>
          <Text style={styles.warningText}>Please visit the Physiology tab to enter your metrics. BAC cannot be calculated without them.</Text>
        </View>
      ) : (
        <>
          <View style={[styles.bacCircle, { borderColor: themeColor }]}>
            {/* The animated liquid component injected here */}
            <LiquidFill bac={currentBac} color={themeColor} />
            
            <Text style={styles.bacLabel}>Current BAC</Text>
            <Text style={[styles.bacValue, { color: themeColor }]}>
              {currentBac.toFixed(3)}%
            </Text>
            <Text style={[styles.zoneText, { color: themeColor }]}>{zoneText}</Text>
          </View>

          <View style={[styles.feedbackCard, { borderLeftColor: themeColor }]}>
            <Text style={styles.feedbackTitle}>Clinical Status</Text>
            <Text style={styles.feedbackText}>{warningMessage}</Text>
            <Text style={styles.statsText}>Drinks Logged Today: {drinksLogged.length}</Text>
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000', padding: 20 },
  
  bacCircle: {
    height: 300,
    width: 300,
    borderRadius: 150,
    borderWidth: 8,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
    marginBottom: 40,
    backgroundColor: '#111',
  },
  bacLabel: { color: '#A0A0A0', fontSize: 18, textTransform: 'uppercase', letterSpacing: 2 },
  bacValue: { fontSize: 64, fontWeight: 'bold', marginVertical: 10 },
  zoneText: { fontSize: 20, fontWeight: '600' },

  feedbackCard: {
    backgroundColor: '#242424',
    padding: 20,
    borderRadius: 12,
    borderLeftWidth: 6,
  },
  feedbackTitle: { color: '#FFF', fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  feedbackText: { color: '#E0E0E0', fontSize: 16, lineHeight: 24, marginBottom: 15 },
  statsText: { color: '#A0A0A0', fontSize: 14, fontStyle: 'italic' },

  warningCard: { backgroundColor: '#331A1A', padding: 20, borderRadius: 12, marginTop: 40, borderWidth: 1, borderColor: '#FF4444' },
  warningTitle: { color: '#FF4444', fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  warningText: { color: '#FFF', fontSize: 16, lineHeight: 24 }
});