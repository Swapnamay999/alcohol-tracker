import React from 'react';
import { Modal, View, Text, StyleSheet, Pressable, Linking } from 'react-native';

interface InfoModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function InfoModal({ visible, onClose }: InfoModalProps) {
  const openSource = () => {
    Linking.openURL('https://pubmed.ncbi.nlm.nih.gov/6986753/');
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          
          <Text style={styles.header}>How We Calculate</Text>

          <View style={styles.warningBox}>
            <Text style={styles.warningTitle}>⚠️ Important Disclaimer</Text>
            <Text style={styles.bodyText}>
              This application provides an estimate of Blood Alcohol Content (BAC) for educational and tracking purposes only. It is not a clinical diagnostic tool or a legal measure of intoxication. Metabolism varies vastly by individual. Never use this app to determine if it is safe to drive.
            </Text>
          </View>

          <Text style={styles.subHeader}>🔬 The Watson Engine</Text>
          <Text style={styles.bodyText}>
            Standard calculators use generic constants. We use the Watson Formula (1980), a clinical-grade algorithm that calculates your specific Total Body Water (TBW) using your height, weight, age, and biological sex.
          </Text>

          <Text style={styles.subHeader}>🏥 Real-World Medical Use</Text>
          <Text style={styles.bodyText}>
            The Watson equations are actively used globally in Nephrology (programming hemodialysis machines) and Pharmacology (determining safe dosages for water-soluble IV medications).
          </Text>

          <Pressable onPress={openSource} style={styles.linkButton}>
            <Text style={styles.linkText}>View PubMed Source (PMID: 6986753)</Text>
          </Pressable>

          <Pressable style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Acknowledge & Close</Text>
          </Pressable>

        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)', // Dark dimming effect
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#121212', // Deep dark mode surface
    borderRadius: 16,
    padding: 24,
    width: '100%',
    borderWidth: 1,
    borderColor: '#333',
  },
  header: {
    color: '#00FF00', // Neon Biotech Green
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  warningBox: {
    backgroundColor: 'rgba(255, 69, 58, 0.1)', // Subtle red tint for warning
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderColor: '#FF453A',
    marginBottom: 16,
  },
  warningTitle: {
    color: '#FF453A',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subHeader: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 4,
  },
  bodyText: {
    color: '#A0A0A0',
    fontSize: 14,
    lineHeight: 20,
  },
  linkButton: {
    marginTop: 16,
    paddingVertical: 8,
  },
  linkText: {
    color: '#00FF00',
    textDecorationLine: 'underline',
    textAlign: 'center',
  },
  closeButton: {
    backgroundColor: '#00FF00',
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 20,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#000000',
    fontWeight: 'bold',
    fontSize: 16,
  },
});