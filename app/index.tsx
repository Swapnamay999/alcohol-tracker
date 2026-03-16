import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Redirect, router } from 'expo-router'; 
import { useDrinkStore } from '../store/useDrinkStore';
import { calculateBAC } from '../utils/bacCalculator';
import LiquidFill from '../components/LiquidFill';

export default function DashboardScreen() {
  const { drinksLogged, userHeight, userWeight, userAge, userSex } = useDrinkStore();
  const [currentBac, setCurrentBac] = useState(0.000);

  const isProfileComplete = userHeight && userWeight && userAge;

  // 1. All Hooks MUST be declared before any early returns
  useEffect(() => {
    // Safety check so it doesn't try to calculate with missing data
    if (!isProfileComplete) return; 

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
  }, [drinksLogged, userHeight, userWeight, userAge, userSex, isProfileComplete]);

  // 2. Instant Redirection Logic (Now safely AFTER the hooks)
  if (!isProfileComplete) {
    return <Redirect href="/profile" />;
  }

  // 3. Aggregate Drinks by Type
  const drinkSummary = drinksLogged.reduce((acc: any[], drink: any) => {
    const existing = acc.find((d: any) => d.type === drink.type);
    if (existing) {
      existing.count += drink.count;
    } else {
      acc.push({ ...drink });
    }
    return acc;
  }, []);
  
  const summaryString = drinkSummary.map(d => `${d.count}x ${d.name || d.type}`).join(' • ') || "No drinks logged today.";

  let zoneText = "Sober / Baseline";
  let themeColor = "#00FF00"; 
  let warningMessage = "You are currently within safe limits.";

  if (currentBac >= 0.01 && currentBac <= 0.05) {
    zoneText = "Social Zone"; themeColor = "#00BFFF"; warningMessage = "Mild relaxation. Safe, but alcohol is present.";
  } else if (currentBac > 0.05 && currentBac <= 0.10) {
    zoneText = "Impaired Zone"; themeColor = "#FFBF00"; warningMessage = "Motor skills and judgment are noticeably impaired. Do not drive.";
  } else if (currentBac > 0.10 && currentBac <= 0.20) {
    zoneText = "Risky Zone"; themeColor = "#FF4444"; warningMessage = "Significant intoxication. Loss of physical control. Seek water and stop drinking.";
  } else if (currentBac > 0.20) {
    zoneText = "Danger / Toxicity"; themeColor = "#8B0000"; warningMessage = "CRITICAL: Severe risk of alcohol poisoning, blackout, or loss of consciousness.";
  }

  return (
    <ScrollView style={styles.container}>
      <View style={[styles.bacCircle, { borderColor: themeColor }]}>
        <LiquidFill bac={currentBac} color={themeColor} />
        <Text style={styles.bacLabel}>Current BAC</Text>
        <Text style={[styles.bacValue, { color: themeColor }]}>{currentBac.toFixed(3)}%</Text>
        <Text style={[styles.zoneText, { color: themeColor }]}>{zoneText}</Text>
      </View>

      <View style={[styles.feedbackCard, { borderLeftColor: themeColor }]}>
        <Text style={styles.feedbackTitle}>Clinical Status</Text>
        <Text style={styles.feedbackText}>{warningMessage}</Text>
        <Text style={styles.statsText}>{summaryString}</Text>
      </View>

      <TouchableOpacity 
        style={[styles.logDrinkBtn, { backgroundColor: themeColor }]} 
        onPress={() => router.push('/logger')}
      >
        <Text style={styles.logDrinkBtnText}>+ Log a Beverage</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000', padding: 20 },
  bacCircle: { height: 300, width: 300, borderRadius: 150, borderWidth: 8, alignSelf: 'center', alignItems: 'center', justifyContent: 'center', marginTop: 40, marginBottom: 40, backgroundColor: '#111' },
  bacLabel: { color: '#A0A0A0', fontSize: 18, textTransform: 'uppercase', letterSpacing: 2 },
  bacValue: { fontSize: 64, fontWeight: 'bold', marginVertical: 10 },
  zoneText: { fontSize: 20, fontWeight: '600' },
  feedbackCard: { backgroundColor: '#242424', padding: 20, borderRadius: 12, borderLeftWidth: 6, marginBottom: 20 },
  feedbackTitle: { color: '#FFF', fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  feedbackText: { color: '#E0E0E0', fontSize: 16, lineHeight: 24, marginBottom: 15 },
  statsText: { color: '#A0A0A0', fontSize: 14, fontStyle: 'italic' },
  logDrinkBtn: { padding: 18, borderRadius: 12, alignItems: 'center', marginTop: 10 },
  logDrinkBtnText: { color: '#000', fontSize: 18, fontWeight: 'bold' }
});