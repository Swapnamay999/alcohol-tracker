// components/BacGraph.tsx
import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import { LinearGradient } from 'expo-linear-gradient';
import { generateBacDataPoints } from '../utils/bacGraphUtils';
import { useDrinkStore } from '../store/useDrinkStore';

const { width: screenWidth } = Dimensions.get('window');

const BacGraph = () => {
  const { drinksLogged, userHeight, userWeight, userAge, userSex } = useDrinkStore();

  const dataPoints = useMemo(() => {
    if (!drinksLogged || drinksLogged.length === 0) return [];
    
    return generateBacDataPoints(
      drinksLogged,
      parseFloat(userHeight),
      parseFloat(userWeight),
      parseFloat(userAge),
      userSex
    );
  }, [drinksLogged, userHeight, userWeight, userAge, userSex]);

  if (dataPoints.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No metabolic data to visualize yet.</Text>
      </View>
    );
  }

  // Formatting data for Gifted Charts
  const chartData = dataPoints.map(p => ({
    value: p.value,
    label: p.label,
    dataPointText: p.value > 0.01 ? p.value.toFixed(2) : undefined, // Only show label for significant points
  }));

  // Find max value to scale Y axis nicely
  const maxBac = Math.max(...dataPoints.map(p => p.value));
  const yAxisMax = Math.max(0.1, Math.ceil(maxBac * 10) / 10); // Round up to nearest 0.1

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Metabolic Decay Curve</Text>
      <View style={styles.chartWrapper}>
        <LineChart
          data={chartData}
          height={180}
          width={screenWidth - 100}
          initialSpacing={10}
          noOfSections={4}
          maxValue={yAxisMax}
          stepValue={yAxisMax / 4}
          thickness={3}
          hideDataPoints={dataPoints.length > 20} // Hide dots if too many points for clarity
          dataPointsColor="#00FF00"
          dataPointsRadius={4}
          color="#00FF00"
          curved
          curveType={1} // Smooth bezier
          startFillColor="rgba(0, 255, 0, 0.3)"
          endFillColor="rgba(0, 255, 0, 0.01)"
          startOpacity={0.4}
          endOpacity={0.1}
          areaChart
          LinearGradientComponent={LinearGradient}
          yAxisColor="#333"
          xAxisColor="#333"
          yAxisTextStyle={{ color: '#777', fontSize: 10, textAlign: 'right' }}
          yAxixLabelWidth={50}
          xAxisLabelTextStyle={{ color: '#777', fontSize: 10, rotation: 45 }}
          rulesColor="#222"
          rulesType="solid"
          yAxisLabelSuffix="%"
          pointerConfig={{
            pointerStripColor: '#00FF00',
            pointerStripWidth: 2,
            pointerColor: '#00FF00',
            radius: 6,
            pointerLabelComponent: (items: any) => {
              return (
                <View style={styles.pointerLabel}>
                  <Text style={styles.pointerText}>{items[0].value.toFixed(3)}%</Text>
                  <Text style={styles.pointerTime}>{items[0].label}</Text>
                </View>
              );
            },
          }}
        />
      </View>
      <View style={styles.legend}>
        <View style={[styles.dot, { backgroundColor: '#00FF00' }]} />
        <Text style={styles.legendText}>Estimated BAC %</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#111',
    borderRadius: 16,
    padding: 16,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#222',
  },
  title: {
    color: '#AAA',
    fontSize: 14,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 20,
  },
  chartWrapper: {
    // marginLeft: -20, // Offset to align with labels
  },
  emptyContainer: {
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#111',
    borderRadius: 16,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#333',
    marginVertical: 10,
  },
  emptyText: {
    color: '#555',
    fontSize: 14,
  },
  legend: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
    justifyContent: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  legendText: {
    color: '#777',
    fontSize: 12,
  },
  pointerLabel: {
    backgroundColor: '#222',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#00FF00',
    alignItems: 'center',
    justifyContent: 'center',
    width: 80,
  },
  pointerText: {
    color: '#00FF00',
    fontWeight: 'bold',
    fontSize: 14,
  },
  pointerTime: {
    color: '#FFF',
    fontSize: 10,
  }
});

export default BacGraph;
