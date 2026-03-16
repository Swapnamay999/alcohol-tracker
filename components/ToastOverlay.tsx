import React, { useEffect } from 'react';
import { StyleSheet, Text } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSequence, 
  withTiming, 
  withDelay, 
  withSpring 
} from 'react-native-reanimated';
import { useDrinkStore } from '../store/useDrinkStore';

export default function ToastOverlay() {
  const toastMessage = useDrinkStore(state => state.toastMessage);
  
  // Start off-screen (-100 pixels above the top)
  const translateY = useSharedValue(-100);

  useEffect(() => {
    if (toastMessage) {
      // Slide down with a spring, wait 2.5 seconds, then slide back up
      translateY.value = withSequence(
        withSpring(50, { damping: 12, stiffness: 90 }),
        withDelay(2500, withTiming(-100, { duration: 300 }))
      );
    }
  }, [toastMessage]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  // Don't render anything in the DOM if there is no message
  if (!toastMessage) return null;

  return (
    <Animated.View style={[styles.toastContainer, animatedStyle]}>
      <Text style={styles.toastText}>{toastMessage}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  toastContainer: {
    position: 'absolute',
    top: 0,
    left: 20,
    right: 20,
    backgroundColor: '#1A331A', // Dark green background to match our theme
    borderColor: '#00FF00',
    borderWidth: 1,
    padding: 15,
    borderRadius: 12,
    zIndex: 9999, // Ensure it floats above everything else
    alignItems: 'center',
    shadowColor: '#00FF00',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 10,
  },
  toastText: { 
    color: '#00FF00', 
    fontWeight: 'bold', 
    fontSize: 16,
    textAlign: 'center'
  },
});