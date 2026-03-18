import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Pressable } from 'react-native';
import { Redirect, router, useNavigation } from 'expo-router';
import { useDrinkStore } from '../store/useDrinkStore';
import { calculateBAC } from '../utils/bacCalculator';
import LiquidFill from '../components/LiquidFill';
import InfoModal from '../components/InfoModal';
import EditDrinksModal from '../components/EditDrinksModal';
import BacGraph from '../components/BacGraph';

export default function DashboardScreen() {
  const { drinksLogged, userHeight, userWeight, userAge, userSex } = useDrinkStore();
  const [currentBac, setCurrentBac] = useState(0.000);
  const [isInfoVisible, setInfoVisible] = useState(false);
  const [isEditModalVisible, setEditModalVisible] = useState(false);
  const navigation = useNavigation();

  const isProfileComplete = userHeight && userWeight && userAge;

  // Disable the swipe gesture for the drawer to prevent it from opening 
  // when interacting with the BAC graph. The drawer remains accessible via the burger menu.
  useEffect(() => {
    navigation.setOptions({
      swipeEnabled: false,
    });
  }, [navigation]);

  useEffect(() => {
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

  if (!isProfileComplete) {
    return <Redirect href="/profile" />;
  }

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
    <View style={styles.mainWrapper}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerRow}>
          <Pressable
            style={styles.pageInfoButton}
            onPress={() => setInfoVisible(true)}
            hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
          >
            <Text style={styles.infoButtonText}>?</Text>
          </Pressable>
        </View>

        <View style={[styles.bacCircle, { borderColor: themeColor }]}>
          <LiquidFill bac={currentBac} color={themeColor} />
          <View style={styles.textOverlay} pointerEvents="none">
            <Text style={styles.bacLabel}>Current BAC</Text>
            <Text style={[styles.bacValue, { color: themeColor }]}>{currentBac.toFixed(3)}%</Text>
            <Text style={[styles.zoneText, { color: themeColor }]}>{zoneText}</Text>
          </View>
        </View>

        <View style={[styles.feedbackCard, { borderLeftColor: themeColor }]}>
          <View style={styles.feedbackHeaderRow}>
            <Text style={styles.feedbackTitle}>Clinical Status</Text>
            <Pressable
              onPress={() => setEditModalVisible(true)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={styles.editIconText}>✎</Text>
            </Pressable>
          </View>
          <Text style={styles.feedbackText}>{warningMessage}</Text>
          <Text style={styles.statsText}>{summaryString}</Text>
        </View>

        <BacGraph />

        <TouchableOpacity
          style={[styles.logDrinkBtn, { backgroundColor: themeColor }]}
          onPress={() => router.push('/logger')}
        >
          <Text style={styles.logDrinkBtnText}>+ Log a Beverage</Text>
        </TouchableOpacity>

        <InfoModal visible={isInfoVisible} onClose={() => setInfoVisible(false)} />
        <EditDrinksModal
          visible={isEditModalVisible}
          onClose={() => setEditModalVisible(false)}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainWrapper: {
    flex: 1,
    backgroundColor: '#000000'
  },
  scrollContent: {
    padding: 20,
    paddingTop: 20, 
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: -20,
    zIndex: 1000,
  },
  pageInfoButton: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#333'
  },
  infoButtonText: {
    color: '#00FF00',
    fontSize: 22,
    fontWeight: 'bold',
  },
  bacCircle: {
    height: 300,
    width: 300,
    borderRadius: 150,
    borderWidth: 8,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    marginBottom: 40,
    backgroundColor: '#111',
    overflow: 'hidden' // Keeps liquid inside the circle
  },
  textOverlay: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  feedbackHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  editIconText: {
    color: '#00FF00',
    fontSize: 20,
    fontWeight: 'bold',
  },
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