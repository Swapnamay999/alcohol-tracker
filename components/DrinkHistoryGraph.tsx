// components/DrinkHistoryGraph.tsx
import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';
import { LinearGradient } from 'expo-linear-gradient';
import { useDrinkStore } from '../store/useDrinkStore';
import { generateDrinkHistoryData } from '../utils/bacGraphUtils';

const { width: screenWidth } = Dimensions.get('window');

const DrinkHistoryGraph = () => {
  const { drinksLogged } = useDrinkStore();

  const barData = useMemo(() => {
    return generateDrinkHistoryData(drinksLogged);
  }, [drinksLogged]);

  if (barData.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Drink Frequency</Text>
      <View style={styles.chartWrapper}>
        <BarChart
          data={barData}
          barWidth={22}
          noOfSections={3}
          barBorderRadius={6}
          frontColor="#00FF00"
          yAxisThickness={0}
          xAxisThickness={1}
          xAxisColor="#333"
          yAxisTextStyle={{ color: '#777', fontSize: 10 }}
          xAxisLabelTextStyle={{ color: '#777', fontSize: 10, rotation: 45 }}
          height={120}
          width={screenWidth - 100}
          initialSpacing={10}
          spacing={15}
          hideRules
          isAnimated
          renderTooltip={(item: any) => {
            return (
              <View style={styles.tooltip}>
                <Text style={styles.tooltipText}>{item.value} {item.value === 1 ? 'drink' : 'drinks'}</Text>
              </View>
            );
          }}
        />
      </View>
      <View style={styles.footer}>
        <Text style={styles.footerText}>Showing consumption by hour</Text>
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    marginTop: 15,
    alignItems: 'center',
  },
  footerText: {
    color: '#555',
    fontSize: 11,
    fontStyle: 'italic',
  },
  tooltip: {
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 4,
    backgroundColor: '#333',
    marginBottom: 5,
  },
  tooltipText: {
    color: '#00FF00',
    fontSize: 10,
    fontWeight: 'bold',
  }
});

export default DrinkHistoryGraph;
