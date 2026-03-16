// components/LiquidFill.tsx
import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';

interface LiquidFillProps {
  bac: number;
  color: string;
}

export default function LiquidFill({ bac, color }: LiquidFillProps) {
  // Shared value for the height percentage (0 to 100)
  const fillPercentage = useSharedValue(0);

  useEffect(() => {
    // Map BAC to a percentage. We will use 0.30% BAC as "100% full" (Critical toxicity).
    // The Math.min ensures the liquid doesn't overflow the circle if BAC goes above 0.30.
    const targetPercentage = Math.min((bac / 0.30) * 100, 100);
    
    // Animate to the new percentage with a bouncy spring effect
    fillPercentage.value = withSpring(targetPercentage, {
      damping: 15,
      stiffness: 100,
      mass: 1
    });
  }, [bac]);

  const animatedLiquidStyle = useAnimatedStyle(() => {
    return {
      height: `${fillPercentage.value}%`,
      backgroundColor: color,
    };
  });

  return (
    <View style={styles.circleMask}>
      {/* This is the animated liquid layer */}
      <Animated.View style={[styles.liquid, animatedLiquidStyle]} />
    </View>
  );
}

const styles = StyleSheet.create({
  circleMask: {
    ...StyleSheet.absoluteFillObject, // Fill the parent container completely
    borderRadius: 150, // Matches the dashboard circle radius
    overflow: 'hidden', // Clips the rectangular liquid so it stays inside the circle
    justifyContent: 'flex-end', // Liquid fills from the bottom up
  },
  liquid: {
    width: '100%',
    opacity: 0.3, // Keep it semi-transparent so the text above is readable
  }
});